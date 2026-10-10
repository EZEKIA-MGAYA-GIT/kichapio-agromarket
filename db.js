const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Weka username ya MySQL yako (kawaida ni root)
    password: '',      // Weka password ya MySQL yako kama ipo
    database: 'kichapio_agromarket',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Imeshindikana kuunganisha na MySQL Database:', err.message);
    } else {
        console.log('✅ Imefanikiwa kuunganisha na MySQL Database!');
        connection.release();
    }
});

module.exports = db.promise();