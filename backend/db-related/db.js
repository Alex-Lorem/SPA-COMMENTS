const Pool = require('pg').Pool
require('dotenv').config()
const pool = new Pool({
    ssl: true,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
})



module.exports = pool