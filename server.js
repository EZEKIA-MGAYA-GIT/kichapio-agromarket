const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MUUNGANISHO WA DATABASE
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'kichapio_agromarket',
    waitForConnections: true,
    connectionLimit: 10
});

// 1. USAJILI (REGISTER)
app.post('/api/register', async (req, res) => {
    const { fullName, contact, nida, location, role, password } = req.body;
    const id = (role.substring(0, 3).toUpperCase()) + '-' + Date.now();
    try {
        await db.query(
            'INSERT INTO users (id, full_name, contact, nida, location, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, fullName, contact, nida || 'N/A', location, role.toLowerCase(), password]
        );
        res.status(201).json({ message: 'Usajili umefanikiwa!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGGING IN (LOGIN)
app.post('/api/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT id, full_name AS fullName, contact, location, role, password FROM users WHERE contact = ? AND role = ?',
            [username, role.toLowerCase()]
        );
        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(401).json({ error: 'Taarifa ulizoingiza sio sahihi.' });
        }
        res.json({ message: 'Login successful', user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. PATA MEMBERS WOTE (ADMIN)
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, full_name AS fullName, contact, nida, location, role FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. MTOE MEMBER (DELETE)
app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member ameondolewa!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. TUMA & PATA ANNOUNCEMENTS
app.post('/api/announcements', async (req, res) => {
    const { title, body } = req.body;
    const id = 'MSG-' + Date.now();
    try {
        await db.query('INSERT INTO announcements (id, title, body) VALUES (?, ?, ?)', [id, title, body]);
        res.status(201).json({ message: 'Ujumbe umetumwa!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/announcements', async (req, res) => {
    try {
        const [list] = await db.query('SELECT id, title, body, DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") AS date FROM announcements ORDER BY created_at DESC');
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. ONGEZA & PATA BEI ZA MAZAO
app.post('/api/prices', async (req, res) => {
    const { cropName, location, price } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM crop_prices WHERE LOWER(crop_name) = LOWER(?) AND LOWER(location) = LOWER(?)', [cropName, location]);
        if (existing.length > 0) {
            await db.query('UPDATE crop_prices SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [price, existing[0].id]);
        } else {
            await db.query('INSERT INTO crop_prices (crop_name, location, price) VALUES (?, ?, ?)', [cropName, location, price]);
        }
        res.json({ message: 'Bei imesasishwa!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/prices', async (req, res) => {
    try {
        const [prices] = await db.query('SELECT crop_name AS cropName, location, price, DATE_FORMAT(updated_at, "%d/%m/%Y") AS updatedAt FROM crop_prices ORDER BY updated_at DESC');
        res.json(prices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server inaingiza data kwenye port 5000...'));