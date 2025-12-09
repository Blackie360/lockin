import postgres from 'postgres';

async function pingDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please make sure DATABASE_URL is set in GitHub Secrets');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  console.log('📍 Connection string:', connectionString.substring(0, 20) + '...');

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    // Create a connection
    sql = postgres(connectionString, {
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
    
    console.log('✨ Database ping completed successfully - Database kept alive');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database ping failed!');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  } finally {
    // Always close the connection
    if (sql) {
      try {
        await sql.end();
        console.log('🔌 Database connection closed');
      } catch (closeError) {
        console.error('⚠️ Error closing connection:', closeError);
      }
    }
  }
}

pingDatabase();

