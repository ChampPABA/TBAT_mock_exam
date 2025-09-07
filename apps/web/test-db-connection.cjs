const { Client } = require('pg')

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'tbat_mock_exam',
    user: 'postgres',
    password: 'password',
  })

  try {
    await client.connect()
    console.log('✅ Database connection successful!')
    
    const result = await client.query('SELECT version()')
    console.log('Database version:', result.rows[0].version)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await client.end()
  }
}

testConnection()