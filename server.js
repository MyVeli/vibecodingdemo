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
  // Create products table
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
      console.error('Error creating products table:', err);
    }
  });

  // Create packages table
  db.run(`CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating packages table:', err);
    }
  });

  // Create junction table for package-product relationships
  db.run(`CREATE TABLE IF NOT EXISTS package_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(package_id, product_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating package_products table:', err);
    } else {
      // Check if we need to populate sample data
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (!err && row.count === 0) {
          populateSampleData();
        }
      });
      // Check if we need to populate sample packages
      db.get('SELECT COUNT(*) as count FROM packages', (err, row) => {
        if (!err && row.count === 0) {
          populateSamplePackages();
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

// Populate sample packages
function populateSamplePackages() {
  const samplePackages = [
    { 
      name: 'Basic Web Server Bundle', 
      description: 'Perfect starter package for small web hosting needs. Includes 1 rack server, basic networking, and power backup.',
      price: 15800.00 
    },
    { 
      name: 'Enterprise Storage Solution', 
      description: 'Complete enterprise storage setup with high-capacity arrays, redundant networking, and comprehensive power protection.',
      price: 128000.00 
    },
    { 
      name: 'High-Performance Data Center Rack', 
      description: 'Fully equipped rack with premium servers, redundant switches, enterprise storage, and complete power management. Ready for production deployment.',
      price: 89500.00 
    }
  ];

  const stmt = db.prepare(`INSERT INTO packages (name, description, price) VALUES (?, ?, ?)`);
  
  samplePackages.forEach(pkg => {
    stmt.run(pkg.name, pkg.description, pkg.price);
  });
  
  stmt.finalize(() => {
    // Add products to packages
    db.get('SELECT id FROM packages WHERE name = ?', ['Basic Web Server Bundle'], (err, pkg) => {
      if (!err && pkg) {
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 1, 1)', [pkg.id]); // 1 PowerEdge Server
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 11, 1)', [pkg.id]); // 1 Cisco Nexus Switch
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 16, 2)', [pkg.id]); // 2 APC UPS
      }
    });

    db.get('SELECT id FROM packages WHERE name = ?', ['Enterprise Storage Solution'], (err, pkg) => {
      if (!err && pkg) {
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 6, 2)', [pkg.id]); // 2 NetApp Storage
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 8, 1)', [pkg.id]); // 1 HPE Nimble
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 12, 2)', [pkg.id]); // 2 Arista Switches
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 17, 3)', [pkg.id]); // 3 Eaton UPS
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 20, 1)', [pkg.id]); // 1 Rack
      }
    });

    db.get('SELECT id FROM packages WHERE name = ?', ['High-Performance Data Center Rack'], (err, pkg) => {
      if (!err && pkg) {
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 2, 2)', [pkg.id]); // 2 ProLiant Servers
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 4, 1)', [pkg.id]); // 1 Cisco UCS
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 7, 1)', [pkg.id]); // 1 Dell EMC Storage
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 11, 2)', [pkg.id]); // 2 Cisco Nexus
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 13, 1)', [pkg.id]); // 1 Juniper Switch
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 16, 4)', [pkg.id]); // 4 APC UPS
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 19, 2)', [pkg.id]); // 2 PDU
        db.run('INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, 20, 1)', [pkg.id]); // 1 Rack
      }
    });

    console.log('Sample packages populated successfully');
  });
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

// ===== PACKAGE API ENDPOINTS =====

// GET all packages with their products
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM packages ORDER BY name', (err, packages) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Get products for each package
      const packagesWithProducts = [];
      let completed = 0;

      if (packages.length === 0) {
        return res.json([]);
      }

      packages.forEach(pkg => {
        db.all(`
          SELECT p.*, pp.quantity as package_quantity 
          FROM products p
          JOIN package_products pp ON p.id = pp.product_id
          WHERE pp.package_id = ?
        `, [pkg.id], (err, products) => {
          if (!err) {
            packagesWithProducts.push({ ...pkg, products: products || [] });
          }
          completed++;
          if (completed === packages.length) {
            res.json(packagesWithProducts);
          }
        });
      });
    }
  });
});

// GET single package by ID with products
app.get('/api/packages/:id', (req, res) => {
  db.get('SELECT * FROM packages WHERE id = ?', [req.params.id], (err, pkg) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
    } else {
      // Get products for this package
      db.all(`
        SELECT p.*, pp.quantity as package_quantity 
        FROM products p
        JOIN package_products pp ON p.id = pp.product_id
        WHERE pp.package_id = ?
      `, [pkg.id], (err, products) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ ...pkg, products: products || [] });
        }
      });
    }
  });
});

// POST new package
app.post('/api/packages', (req, res) => {
  const { name, description, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO packages (name, description, price) VALUES (?, ?, ?)`,
    [name, description || '', price],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: 'Package added successfully' });
      }
    }
  );
});

// PUT update package
app.put('/api/packages/:id', (req, res) => {
  const { name, description, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `UPDATE packages SET name = ?, description = ?, price = ? WHERE id = ?`,
    [name, description || '', price, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Package not found' });
      } else {
        res.json({ message: 'Package updated successfully' });
      }
    }
  );
});

// DELETE package
app.delete('/api/packages/:id', (req, res) => {
  db.run('DELETE FROM packages WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Package not found' });
    } else {
      res.json({ message: 'Package deleted successfully' });
    }
  });
});

// POST add product to package
app.post('/api/packages/:id/products', (req, res) => {
  const { product_id, quantity } = req.body;
  
  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid product_id or quantity' });
  }
  
  db.run(
    `INSERT INTO package_products (package_id, product_id, quantity) VALUES (?, ?, ?)
     ON CONFLICT(package_id, product_id) DO UPDATE SET quantity = excluded.quantity`,
    [req.params.id, product_id, quantity],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Product added to package successfully' });
      }
    }
  );
});

// PUT update product quantity in package
app.put('/api/packages/:packageId/products/:productId', (req, res) => {
  const { quantity } = req.body;
  
  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  
  db.run(
    'UPDATE package_products SET quantity = ? WHERE package_id = ? AND product_id = ?',
    [quantity, req.params.packageId, req.params.productId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found in package' });
      } else {
        res.json({ message: 'Product quantity updated successfully' });
      }
    }
  );
});

// DELETE remove product from package
app.delete('/api/packages/:packageId/products/:productId', (req, res) => {
  db.run(
    'DELETE FROM package_products WHERE package_id = ? AND product_id = ?',
    [req.params.packageId, req.params.productId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found in package' });
      } else {
        res.json({ message: 'Product removed from package successfully' });
      }
    }
  );
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
