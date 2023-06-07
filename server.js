import express from 'express';
import fetch from 'node-fetch';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5500;

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Hodlin',
  password: 'Ankit@1122',
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database');
  })
  .catch((error) => {
    console.error('Error connecting to the PostgreSQL database', error);
  });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fetch data from API and store in database
app.get('/fetch-data', (req, res) => {
  fetch('https://api.wazirx.com/api/v2/tickers')
    .then(response => response.json())
    .then(data => {
      const top10 = Object.values(data).slice(0, 10).map(item => ({
        name: item.symbol,
        last: item.last,
        buy: item.buy,
        sell: item.sell,
        volume: item.volume,
        base_unit: item.base_unit,
      }));

      // Store data in the database
      const insertQuery = `
        INSERT INTO crypto_data (name, last, buy, sell, volume, base_unit)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE
        SET last = EXCLUDED.last,
            buy = EXCLUDED.buy,
            sell = EXCLUDED.sell,
            volume = EXCLUDED.volume,
            base_unit = EXCLUDED.base_unit
      `;

      top10.forEach(item => {
        const values = [
          item.name,
          item.last,
          item.buy,
          item.sell,
          item.volume,
          item.base_unit
        ];

        pool.query(insertQuery, values)
          .catch((error) => {
            console.error('Error storing data in the database', error);
          });
      });

      // Retrieve data from the database
      const selectQuery = `
        SELECT name, last, buy, sell, volume, base_unit
        FROM crypto_data
        LIMIT 10
      `;

      pool.query(selectQuery)
        .then(result => {
          const cryptoData = result.rows;
          res.json(cryptoData);
        })
        .catch(error => {
          console.error('Error retrieving data from the database', error);
          res.status(500).json({ error: 'Failed to retrieve data from the database' });
        });
    })
    .catch((error) => {
      console.error('Error fetching data from the API', error);
      res.status(500).json({ error: 'Failed to fetch data from the API' });
    });
});


// Retrieve data from the database
app.get('/api/crypto-data', (req, res) => {
  const selectQuery = `
    SELECT name, last, buy, sell, volume, base_unit
    FROM crypto_data
    LIMIT 10
  `;

  pool.query(selectQuery)
    .then(result => {
      const cryptoData = result.rows;
      res.json(cryptoData);
    })
    .catch(error => {
      console.error('Error retrieving data from the database', error);
      res.status(500).json({ error: 'Failed to retrieve data from the database' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
