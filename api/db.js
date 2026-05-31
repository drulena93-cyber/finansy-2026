const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { query, params } = req.body || {};
    if (!query) return res.status(400).json({ error: 'No query' });
    const result = await pool.query(query, params || []);
    return res.status(200).json({ rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
