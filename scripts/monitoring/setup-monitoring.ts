#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config();

const execAsync = promisify(exec);

interface MonitoringConfig {
  databaseUrl: string;
  alertThresholds: {
    migrationErrorRate: number;
    dataIntegrityFailure: boolean;
    migrationDuration: number;
    rollbackTriggerRate: number;
  };
  checkInterval: number; // in milliseconds
  alertWebhook?: string;
}

interface HealthCheck {
  name: string;
  query: string;
  threshold?: number;
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  critical: boolean;
}

interface AlertEvent {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  check: string;
  message: string;
  value?: any;
}

class MigrationMonitoring {
  private config: MonitoringConfig;
  private alerts: AlertEvent[] = [];
  private isMonitoring: boolean = false;

  constructor() {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      alertThresholds: {
        migrationErrorRate: 0.02, // 2%
        dataIntegrityFailure: true,
        migrationDuration: 7200, // 2 hours in seconds
        rollbackTriggerRate: 0.05 // 5% error rate triggers rollback
      },
      checkInterval: 60000, // Check every minute
      alertWebhook: process.env.ALERT_WEBHOOK_URL
    };

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  private healthChecks: HealthCheck[] = [
    {
      name: 'Database Connection',
      query: 'SELECT 1',
      critical: true
    },
    {
      name: 'User Count',
      query: 'SELECT COUNT(*) FROM users',
      threshold: 0,
      operator: 'gt',
      critical: true
    },
    {
      name: 'VVIP Migration Status',
      query: "SELECT COUNT(*) FROM users WHERE tier = 'VVIP'",
      threshold: 0,
      operator: 'gte',
      critical: false
    },
    {
      name: 'Orphan Registrations',
      query: 'SELECT COUNT(*) FROM registrations_v2 r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL',
      threshold: 0,
      operator: 'eq',
      critical: true
    },
    {
      name: 'Orphan Payments',
      query: 'SELECT COUNT(*) FROM payment_transactions p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL',
      threshold: 0,
      operator: 'eq',
      critical: true
    },
    {
      name: 'Duplicate Exam Tickets',
      query: 'SELECT COUNT(*) FROM (SELECT exam_ticket, COUNT(*) as cnt FROM registrations_v2 GROUP BY exam_ticket HAVING COUNT(*) > 1) as duplicates',
      threshold: 0,
      operator: 'eq',
      critical: true
    },
    {
      name: 'Invalid Tier Values',
      query: "SELECT COUNT(*) FROM users WHERE tier NOT IN ('FREE', 'VVIP') AND tier IS NOT NULL",
      threshold: 0,
      operator: 'eq',
      critical: true
    }
  ];

  private async executeHealthCheck(check: HealthCheck): Promise<{ passed: boolean; value: any; error?: string }> {
    try {
      const command = `psql "${this.config.databaseUrl}" -t -c "${check.query}"`;
      const { stdout } = await execAsync(command);
      const value = stdout.trim();
      
      // If no threshold, just check if query succeeds
      if (check.threshold === undefined) {
        return { passed: true, value };
      }
      
      // Compare with threshold
      const numericValue = parseFloat(value);
      let passed = false;
      
      switch (check.operator) {
        case 'gt':
          passed = numericValue > check.threshold;
          break;
        case 'lt':
          passed = numericValue < check.threshold;
          break;
        case 'eq':
          passed = numericValue === check.threshold;
          break;
        case 'gte':
          passed = numericValue >= check.threshold;
          break;
        case 'lte':
          passed = numericValue <= check.threshold;
          break;
        default:
          passed = true;
      }
      
      return { passed, value: numericValue };
    } catch (error) {
      return { 
        passed: false, 
        value: null, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async sendAlert(event: AlertEvent): Promise<void> {
    // Log to console
    const icon = {
      'INFO': 'ℹ️',
      'WARNING': '⚠️',
      'ERROR': '❌',
      'CRITICAL': '🚨'
    }[event.level];
    
    console.log(`${icon} [${event.level}] ${event.check}: ${event.message}`);
    
    // Store alert
    this.alerts.push(event);
    
    // Send webhook if configured
    if (this.config.alertWebhook) {
      try {
        const webhookPayload = JSON.stringify({
          text: `${icon} TBAT Migration Alert`,
          attachments: [{
            color: event.level === 'CRITICAL' ? 'danger' : event.level === 'ERROR' ? 'warning' : 'good',
            fields: [
              { title: 'Level', value: event.level, short: true },
              { title: 'Check', value: event.check, short: true },
              { title: 'Message', value: event.message, short: false },
              { title: 'Timestamp', value: event.timestamp, short: true }
            ]
          }]
        });
        
        await execAsync(`curl -X POST -H 'Content-Type: application/json' -d '${webhookPayload}' ${this.config.alertWebhook}`);
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
  }

  async runHealthChecks(): Promise<{ healthy: boolean; checks: any[] }> {
    const results = [];
    let healthy = true;
    
    console.log('\n🔍 Running health checks...');
    
    for (const check of this.healthChecks) {
      const result = await this.executeHealthCheck(check);
      results.push({
        name: check.name,
        passed: result.passed,
        value: result.value,
        error: result.error,
        critical: check.critical
      });
      
      if (!result.passed) {
        const event: AlertEvent = {
          timestamp: new Date().toISOString(),
          level: check.critical ? 'CRITICAL' : 'ERROR',
          check: check.name,
          message: result.error || `Check failed: ${result.value} (expected ${check.operator} ${check.threshold})`,
          value: result.value
        };
        
        await this.sendAlert(event);
        
        if (check.critical) {
          healthy = false;
        }
      } else {
        console.log(`  ✅ ${check.name}: ${result.value}`);
      }
    }
    
    return { healthy, checks: results };
  }

  async setupDashboard(): Promise<void> {
    console.log('\n📊 Setting up monitoring dashboard...');
    
    const dashboardHtml = `<!DOCTYPE html>
<html>
<head>
    <title>TBAT Migration Monitoring Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        .status-healthy { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-critical { color: #ef4444; }
        .alerts {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .alert-item {
            padding: 10px;
            border-left: 4px solid;
            margin-bottom: 10px;
            background: #f9fafb;
        }
        .alert-info { border-color: #3b82f6; }
        .alert-warning { border-color: #f59e0b; }
        .alert-error { border-color: #ef4444; }
        .alert-critical { 
            border-color: #ef4444;
            background: #fee;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        .timestamp {
            color: #999;
            font-size: 0.8em;
        }
    </style>
    <script>
        async function refreshData() {
            try {
                const response = await fetch('/api/monitoring/status');
                const data = await response.json();
                updateDashboard(data);
            } catch (error) {
                console.error('Failed to fetch monitoring data:', error);
            }
        }
        
        function updateDashboard(data) {
            // Update metrics
            document.getElementById('migrationStatus').textContent = data.migrationStatus || 'N/A';
            document.getElementById('totalUsers').textContent = data.totalUsers || '0';
            document.getElementById('vvipUsers').textContent = data.vvipUsers || '0';
            document.getElementById('freeUsers').textContent = data.freeUsers || '0';
            document.getElementById('errorRate').textContent = (data.errorRate || 0) + '%';
            document.getElementById('systemHealth').textContent = data.healthy ? 'Healthy' : 'Issues Detected';
            document.getElementById('systemHealth').className = 'metric-value ' + (data.healthy ? 'status-healthy' : 'status-critical');
            
            // Update alerts
            const alertsContainer = document.getElementById('alerts');
            alertsContainer.innerHTML = '<h3>Recent Alerts</h3>';
            if (data.alerts && data.alerts.length > 0) {
                data.alerts.slice(-10).reverse().forEach(alert => {
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'alert-item alert-' + alert.level.toLowerCase();
                    alertDiv.innerHTML = '<strong>' + alert.check + '</strong>: ' + alert.message + 
                                       '<div class="timestamp">' + new Date(alert.timestamp).toLocaleString() + '</div>';
                    alertsContainer.appendChild(alertDiv);
                });
            } else {
                alertsContainer.innerHTML += '<p>No alerts</p>';
            }
            
            // Update last refresh
            document.getElementById('lastRefresh').textContent = new Date().toLocaleTimeString();
        }
        
        // Refresh every 30 seconds
        setInterval(refreshData, 30000);
        
        // Initial load
        window.onload = refreshData;
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TBAT Migration Monitoring Dashboard</h1>
            <p>Real-time monitoring of Freemium migration status</p>
            <p class="timestamp">Last refresh: <span id="lastRefresh">Loading...</span></p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Migration Status</div>
                <div class="metric-value" id="migrationStatus">Loading...</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">System Health</div>
                <div class="metric-value status-healthy" id="systemHealth">Loading...</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Users</div>
                <div class="metric-value" id="totalUsers">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">VVIP Users</div>
                <div class="metric-value" id="vvipUsers">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">FREE Users</div>
                <div class="metric-value" id="freeUsers">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Error Rate</div>
                <div class="metric-value" id="errorRate">0%</div>
            </div>
        </div>
        
        <div class="alerts" id="alerts">
            <h3>Recent Alerts</h3>
            <p>Loading...</p>
        </div>
    </div>
</body>
</html>`;

    // Save dashboard HTML
    const dashboardPath = path.join(process.cwd(), 'monitoring-dashboard.html');
    await fs.writeFile(dashboardPath, dashboardHtml);
    console.log(`  ✅ Dashboard created: ${dashboardPath}`);
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting migration monitoring...');
    console.log(`⏱️  Check interval: ${this.config.checkInterval / 1000} seconds`);
    console.log(`📊 Alert thresholds:`);
    console.log(`   - Error rate: ${this.config.alertThresholds.migrationErrorRate * 100}%`);
    console.log(`   - Max duration: ${this.config.alertThresholds.migrationDuration} seconds`);
    console.log(`   - Rollback trigger: ${this.config.alertThresholds.rollbackTriggerRate * 100}% errors`);

    // Initial health check
    const { healthy } = await this.runHealthChecks();
    
    if (!healthy) {
      await this.sendAlert({
        timestamp: new Date().toISOString(),
        level: 'CRITICAL',
        check: 'Initial Health Check',
        message: 'System not healthy at monitoring start'
      });
    }

    // Setup monitoring loop
    const monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitoringInterval);
        return;
      }

      const { healthy, checks } = await this.runHealthChecks();
      
      // Check if rollback should be triggered
      const criticalFailures = checks.filter(c => c.critical && !c.passed).length;
      const errorRate = criticalFailures / checks.length;
      
      if (errorRate >= this.config.alertThresholds.rollbackTriggerRate) {
        await this.sendAlert({
          timestamp: new Date().toISOString(),
          level: 'CRITICAL',
          check: 'Rollback Trigger',
          message: `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold. Rollback recommended!`,
          value: errorRate
        });
        
        // Could trigger automatic rollback here if configured
        console.log('\n🚨 ROLLBACK RECOMMENDED - Critical errors detected');
      }
    }, this.config.checkInterval);

    // Setup graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n📛 Stopping monitoring...');
      this.isMonitoring = false;
      clearInterval(monitoringInterval);
      this.generateReport();
      process.exit(0);
    });
  }

  private generateReport(): void {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 MONITORING REPORT');
    console.log('=' .repeat(50));
    
    const criticalAlerts = this.alerts.filter(a => a.level === 'CRITICAL').length;
    const errorAlerts = this.alerts.filter(a => a.level === 'ERROR').length;
    const warningAlerts = this.alerts.filter(a => a.level === 'WARNING').length;
    
    console.log(`\nTotal Alerts: ${this.alerts.length}`);
    console.log(`  🚨 Critical: ${criticalAlerts}`);
    console.log(`  ❌ Errors: ${errorAlerts}`);
    console.log(`  ⚠️  Warnings: ${warningAlerts}`);
    
    if (criticalAlerts > 0) {
      console.log('\n⚠️  Critical issues detected - review immediately!');
    } else if (errorAlerts > 0) {
      console.log('\n⚠️  Errors detected - investigation recommended');
    } else {
      console.log('\n✅ No critical issues detected');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const monitor = new MigrationMonitoring();
  
  const command = process.argv[2];
  
  if (command === 'setup') {
    monitor.setupDashboard()
      .then(() => {
        console.log('\n✅ Monitoring setup completed');
      })
      .catch(error => {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
      });
  } else if (command === 'check') {
    monitor.runHealthChecks()
      .then(({ healthy }) => {
        console.log(`\n${healthy ? '✅' : '❌'} System health: ${healthy ? 'Healthy' : 'Issues detected'}`);
        process.exit(healthy ? 0 : 1);
      })
      .catch(error => {
        console.error('\n❌ Health check failed:', error);
        process.exit(1);
      });
  } else {
    monitor.startMonitoring()
      .catch(error => {
        console.error('\n❌ Monitoring failed:', error);
        process.exit(1);
      });
  }
}

export { MigrationMonitoring };