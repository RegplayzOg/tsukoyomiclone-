const { Pool } = require('pg');

async function testConnection(useSsl) {
  const pool = new Pool({
    host: 'r9.zenix.sg',
    port: 25606,
    user: 'Regplayz',
    password: 'Regtoosigma',
    database: 'rzanime_db',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log(`Connection successful (SSL: ${useSsl})`);
    client.release();
  } catch (err) {
    console.error(`Connection failed (SSL: ${useSsl}):`, err.message);
  } finally {
    await pool.end();
  }
}

async function runDiagnostics() {
  console.log("Testing unencrypted...");
  await testConnection(false);
  console.log("\nTesting encrypted...");
  await testConnection(true);
}

runDiagnostics();
