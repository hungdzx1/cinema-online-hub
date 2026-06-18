const mysql = require('mysql2/promise');
const fs = require('fs');

const CA_PATH = '/workspaces/cinema-online-hub/server/ca.pem';

async function test() {
  console.log('=== KIEM TRA ca.pem ===');
  try {
    const ca = fs.readFileSync(CA_PATH).toString();
    console.log('Do dai ca.pem:', ca.length, 'ky tu');
    console.log('Dong dau:', ca.split('\n')[0]);
    console.log('Dong cuoi:', ca.trim().split('\n').pop());
    console.log('');

    console.log('=== THU KET NOI AIVEN ===');
    const conn = await mysql.createConnection({
      host: 'mysql-webphim-loct63636-960f.c.aivencloud.com',
      port: 16014,
      user: 'avnadmin',
      password: 'AVNS_OqKny6CdwgG88u0z3qq',
      database: 'defaultdb',
      ssl: { ca },
    });
    console.log('KET NOI THANH CONG!');

    const [rows] = await conn.query('SELECT COUNT(*) as c FROM genres');
    console.log('So the loai:', rows[0].c);
    await conn.end();
  } catch (err) {
    console.error('LOI:', err.code || '', '-', err.message);
  }
}
test();
