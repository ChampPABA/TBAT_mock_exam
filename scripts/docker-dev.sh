#!/bin/bash
# Docker development environment management script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to clean up containers and volumes
cleanup() {
    log_info "Cleaning up containers and volumes..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    log_info "Cleanup completed"
}

# Function to start development environment
start_dev() {
    log_info "Starting TBAT development environment..."
    
    # Check if .env file exists
    if [[ ! -f ".env" ]]; then
        log_warn ".env file not found. Creating from template..."
        cp .env.example .env || {
            log_error "Failed to create .env file. Please create it manually."
            exit 1
        }
    fi
    
    # Build and start containers
    docker-compose -f docker-compose.dev.yml up --build -d
    
    log_info "Development environment started!"
    log_info "Services available at:"
    log_info "  - Next.js app: http://localhost:3000"
    log_info "  - PostgreSQL: localhost:5432"
    log_info "  - Redis: localhost:6379"
    log_info "  - pgAdmin: http://localhost:8080"
    log_info "  - cAdvisor (monitoring): http://localhost:8081"
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    timeout 120 sh -c 'until docker-compose -f docker-compose.dev.yml ps | grep healthy; do sleep 2; done' || {
        log_error "Services did not become healthy within 120 seconds"
        docker-compose -f docker-compose.dev.yml logs
        exit 1
    }
    
    log_info "All services are healthy!"
}

# Function to stop development environment
stop_dev() {
    log_info "Stopping TBAT development environment..."
    docker-compose -f docker-compose.dev.yml down
    log_info "Development environment stopped"
}

# Function to show logs
show_logs() {
    service=${1:-""}
    if [[ -n "$service" ]]; then
        log_info "Showing logs for service: $service"
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        log_info "Showing logs for all services"
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# Function to show service status
status() {
    log_info "Service status:"
    docker-compose -f docker-compose.dev.yml ps
    
    log_info "\nContainer resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
}

# Function to run performance tests against Docker environment
test_performance() {
    log_info "Running performance tests against Docker environment..."
    
    # Check if services are running
    if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        log_error "Development environment is not running. Start it first with: $0 start"
        exit 1
    fi
    
    # Wait for web service to be ready
    log_info "Waiting for web service to be ready..."
    timeout 60 sh -c 'until curl -f http://localhost:3000/api/health > /dev/null 2>&1; do sleep 2; done' || {
        log_error "Web service is not responding"
        exit 1
    }
    
    # Run load tests if k6 is available
    if command -v k6 >/dev/null 2>&1; then
        log_info "Running k6 load tests..."
        cd apps/web/tests/load
        k6 run baseline-load.js
        cd - > /dev/null
    else
        log_warn "k6 not found. Install k6 to run performance tests."
        log_info "You can test manually by visiting http://localhost:3000"
    fi
}

# Function to backup database
backup_db() {
    log_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"
    
    docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U postgres tbat_mock_exam > "$backup_file"
    log_info "Database backup saved to: $backup_file"
}

# Function to restore database
restore_db() {
    backup_file=$1
    if [[ -z "$backup_file" ]]; then
        log_error "Please specify a backup file: $0 restore-db <backup_file>"
        exit 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_info "Restoring database from: $backup_file"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d tbat_mock_exam < "$backup_file"
    log_info "Database restored successfully"
}

# Function to show help
show_help() {
    echo "TBAT Docker Development Environment Manager"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start           Start the development environment"
    echo "  stop            Stop the development environment"
    echo "  restart         Restart the development environment"
    echo "  logs [service]  Show logs for all services or a specific service"
    echo "  status          Show service status and resource usage"
    echo "  cleanup         Remove containers, volumes, and unused images"
    echo "  test            Run performance tests against the environment"
    echo "  backup-db       Create a database backup"
    echo "  restore-db      Restore database from backup file"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start development environment"
    echo "  $0 logs web                 # Show logs for web service only"
    echo "  $0 restore-db backup.sql    # Restore from backup file"
}

# Main script logic
case "$1" in
    start)
        check_docker
        start_dev
        ;;
    stop)
        check_docker
        stop_dev
        ;;
    restart)
        check_docker
        stop_dev
        start_dev
        ;;
    logs)
        check_docker
        show_logs "$2"
        ;;
    status)
        check_docker
        status
        ;;
    cleanup)
        check_docker
        cleanup
        ;;
    test)
        check_docker
        test_performance
        ;;
    backup-db)
        check_docker
        backup_db
        ;;
    restore-db)
        check_docker
        restore_db "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        log_error "No command specified"
        show_help
        exit 1
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac