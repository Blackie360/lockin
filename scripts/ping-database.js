const postgres = require('postgres');

async function pingDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');

  try {
    // Create a connection
    const sql = postgres(connectionString, {
      max: 1, // Use minimal connections for ping
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Execute a simple query to ping the database
    const result = await sql`SELECT NOW() as current_time, 1 as status`;
    
    const timestamp = new Date().toISOString();
    console.log('✅ Database ping successful!');
    console.log('📅 Timestamp:', timestamp);
    console.log('🕐 Server time:', result[0]?.current_time || 'N/A');
    
    // Close the connection
    await sql.end();
    
    console.log('✨ Database ping completed successfully - Database kept alive');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database ping failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

pingDatabase();

