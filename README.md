# DataCenter Hardware Inventory Management System

A modern web application for managing server hardware and equipment inventory for data center operations. This application allows users to browse, add, update quantities, and delete products with an intuitive and responsive interface.

## Features

- 📦 **Browse Products**: View all server hardware products in an organized, card-based layout
- ➕ **Add Products**: Add new hardware items with detailed specifications
- 🗑️ **Delete Products**: Remove items from inventory
- 📊 **Update Quantities**: Quickly adjust stock levels for any product
- 🔍 **Filter by Category**: Filter products by hardware type (Servers, Storage, Networking, etc.)
- 💾 **Local Database**: SQLite database with 20 pre-populated server hardware products
- 🎨 **Modern UI**: Clean, responsive design that works on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant feedback on all operations

## Product Categories

- **Rack Server**: Enterprise-grade servers (Dell PowerEdge, HPE ProLiant, Lenovo ThinkSystem, etc.)
- **Storage**: High-capacity storage systems (NetApp, Dell EMC, Pure Storage, etc.)
- **Networking**: Switches and network equipment (Cisco, Arista, Juniper, etc.)
- **Power & Cooling**: UPS systems and power distribution units (APC, Eaton, CyberPower, etc.)
- **Rack & Accessories**: Server racks and related hardware

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Architecture**: RESTful API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MyVeli/vibecodingdemo.git
cd vibecodingdemo
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The application will automatically create a database with 20 sample server hardware products on first run.

## API Endpoints

### Get All Products
```
GET /api/products
```
Returns an array of all products.

### Get Single Product
```
GET /api/products/:id
```
Returns details of a specific product.

### Add New Product
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "category": "Category",
  "sku": "SKU-CODE",
  "quantity": 10,
  "price": 1000.00,
  "manufacturer": "Manufacturer Name",
  "specifications": "Product specifications"
}
```

### Update Product Quantity
```
PUT /api/products/:id/quantity
Content-Type: application/json

{
  "quantity": 15
}
```

### Update Full Product
```
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "category": "Category",
  "sku": "SKU-CODE",
  "quantity": 10,
  "price": 1000.00,
  "manufacturer": "Manufacturer Name",
  "specifications": "Updated specifications"
}
```

### Delete Product
```
DELETE /api/products/:id
```

## Project Structure

```
vibecodingdemo/
├── server.js           # Express server and API endpoints
├── package.json        # Project dependencies and scripts
├── inventory.db        # SQLite database (created automatically)
├── public/
│   ├── index.html     # Main HTML page
│   ├── style.css      # Styling and responsive design
│   └── app.js         # Frontend JavaScript logic
└── README.md          # This file
```

## Sample Data

The application comes pre-populated with 20 server hardware products including:
- 5 Rack Servers (Dell, HPE, Lenovo, Cisco, Supermicro)
- 5 Storage Systems (NetApp, Dell EMC, HPE, Pure Storage, Lenovo)
- 5 Networking Equipment (Cisco, Arista, Juniper, HPE, Dell)
- 4 Power & Cooling Systems (APC, Eaton, CyberPower, Vertiv)
- 1 Rack & Accessories (APC NetShelter)

## Development

To modify the application:
- Backend logic: Edit `server.js`
- Frontend UI: Edit `public/index.html` and `public/style.css`
- Frontend functionality: Edit `public/app.js`

## License

ISC

## Author

DataCenter Inventory Management System