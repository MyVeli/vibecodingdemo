const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database schema and sample data
function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    manufacturer TEXT,
    specifications TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      // Check if we need to populate sample data
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (!err && row.count === 0) {
          populateSampleData();
        }
      });
    }
  });
}

// Populate with 20 sample server hardware products
function populateSampleData() {
  const sampleProducts = [
    { name: 'PowerEdge R750 Server', category: 'Rack Server', sku: 'SVR-PE-R750', quantity: 15, price: 4500.00, manufacturer: 'Dell', specifications: '2x Intel Xeon Gold, 128GB RAM, 4TB Storage' },
    { name: 'ProLiant DL380 Gen10', category: 'Rack Server', sku: 'SVR-HP-DL380', quantity: 12, price: 5200.00, manufacturer: 'HPE', specifications: '2x Intel Xeon Platinum, 256GB RAM, 8TB Storage' },
    { name: 'ThinkSystem SR650', category: 'Rack Server', sku: 'SVR-LN-SR650', quantity: 8, price: 4800.00, manufacturer: 'Lenovo', specifications: '2x Intel Xeon Gold, 192GB RAM, 6TB Storage' },
    { name: 'Cisco UCS C240 M6', category: 'Rack Server', sku: 'SVR-CS-C240', quantity: 10, price: 6500.00, manufacturer: 'Cisco', specifications: '2x Intel Xeon Platinum, 512GB RAM, 12TB Storage' },
    { name: 'Supermicro 2U Twin', category: 'Rack Server', sku: 'SVR-SM-2U', quantity: 20, price: 3200.00, manufacturer: 'Supermicro', specifications: '2x Intel Xeon Silver, 64GB RAM, 2TB Storage' },
    { name: 'NetApp AFF A400', category: 'Storage', sku: 'STG-NA-A400', quantity: 5, price: 45000.00, manufacturer: 'NetApp', specifications: 'All-Flash Array, 200TB capacity, NVMe' },
    { name: 'Dell EMC PowerStore 500', category: 'Storage', sku: 'STG-DL-PS500', quantity: 7, price: 38000.00, manufacturer: 'Dell EMC', specifications: 'Hybrid Storage, 150TB capacity' },
    { name: 'HPE Nimble Storage', category: 'Storage', sku: 'STG-HP-NMB', quantity: 6, price: 42000.00, manufacturer: 'HPE', specifications: 'All-Flash, 180TB capacity, AI-predictive' },
    { name: 'Pure Storage FlashArray', category: 'Storage', sku: 'STG-PR-FA', quantity: 4, price: 52000.00, manufacturer: 'Pure Storage', specifications: 'All-Flash, 250TB capacity, DirectFlash' },
    { name: 'Lenovo ThinkSystem DM7100', category: 'Storage', sku: 'STG-LN-DM7100', quantity: 8, price: 35000.00, manufacturer: 'Lenovo', specifications: 'Hybrid, 120TB capacity, SAN' },
    { name: 'Cisco Nexus 9300', category: 'Networking', sku: 'NET-CS-NX9300', quantity: 25, price: 12000.00, manufacturer: 'Cisco', specifications: '48x 10GbE ports, Layer 3 switch' },
    { name: 'Arista 7050X3 Switch', category: 'Networking', sku: 'NET-AR-7050', quantity: 18, price: 15000.00, manufacturer: 'Arista', specifications: '32x 100GbE ports, Low latency' },
    { name: 'Juniper QFX5120', category: 'Networking', sku: 'NET-JN-QFX5120', quantity: 15, price: 13500.00, manufacturer: 'Juniper', specifications: '48x 25GbE ports, Data center switch' },
    { name: 'HPE FlexFabric 5945', category: 'Networking', sku: 'NET-HP-FF5945', quantity: 20, price: 11000.00, manufacturer: 'HPE', specifications: '48x 10GbE ports, Stackable' },
    { name: 'Dell PowerSwitch S5248', category: 'Networking', sku: 'NET-DL-S5248', quantity: 22, price: 9500.00, manufacturer: 'Dell', specifications: '48x 25GbE + 8x 100GbE ports' },
    { name: 'APC Smart-UPS 5000VA', category: 'Power & Cooling', sku: 'PWR-APC-5000', quantity: 30, price: 3500.00, manufacturer: 'APC', specifications: '5000VA/4000W, LCD display, Network card' },
    { name: 'Eaton 9PX 6000i UPS', category: 'Power & Cooling', sku: 'PWR-ET-9PX6K', quantity: 25, price: 4200.00, manufacturer: 'Eaton', specifications: '6000VA/5400W, Hot-swappable batteries' },
    { name: 'CyberPower OR2200PFCRT2U', category: 'Power & Cooling', sku: 'PWR-CP-2200', quantity: 35, price: 1800.00, manufacturer: 'CyberPower', specifications: '2200VA/1980W, Sine wave, LCD' },
    { name: 'Vertiv Liebert PDU', category: 'Power & Cooling', sku: 'PWR-VT-PDU32', quantity: 40, price: 850.00, manufacturer: 'Vertiv', specifications: '32A, Intelligent PDU, 24 outlets' },
    { name: 'APC NetShelter Rack 42U', category: 'Rack & Accessories', sku: 'RCK-APC-42U', quantity: 12, price: 2400.00, manufacturer: 'APC', specifications: '42U, 600mm wide, Cable management' }
  ];

  const stmt = db.prepare(`INSERT INTO products (name, category, sku, quantity, price, manufacturer, specifications) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)`);
  
  sampleProducts.forEach(product => {
    stmt.run(product.name, product.category, product.sku, product.quantity, product.price, product.manufacturer, product.specifications);
  });
  
  stmt.finalize();
  console.log('Sample data populated successfully');
}

// REST API Endpoints

// GET all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(row);
    }
  });
});

// POST new product
app.post('/api/products', (req, res) => {
  const { name, category, sku, quantity, price, manufacturer, specifications } = req.body;
  
  if (!name || !category || !sku || quantity === undefined || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO products (name, category, sku, quantity, price, manufacturer, specifications) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, sku, quantity, price, manufacturer || '', specifications || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: 'Product added successfully' });
      }
    }
  );
});

// PUT update product quantity
app.put('/api/products/:id/quantity', (req, res) => {
  const { quantity } = req.body;
  
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  
  db.run(
    'UPDATE products SET quantity = ? WHERE id = ?',
    [quantity, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ message: 'Quantity updated successfully' });
      }
    }
  );
});

// PUT update entire product
app.put('/api/products/:id', (req, res) => {
  const { name, category, sku, quantity, price, manufacturer, specifications } = req.body;
  
  if (!name || !category || !sku || quantity === undefined || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `UPDATE products SET name = ?, category = ?, sku = ?, quantity = ?, price = ?, 
     manufacturer = ?, specifications = ? WHERE id = ?`,
    [name, category, sku, quantity, price, manufacturer || '', specifications || '', req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ message: 'Product updated successfully' });
      }
    }
  );
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
