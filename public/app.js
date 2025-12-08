// Global variables
let products = [];
let editingProductId = null;
let updatingQuantityProductId = null;

// DOM Elements
const productGrid = document.getElementById('productGrid');
const productModal = document.getElementById('productModal');
const quantityModal = document.getElementById('quantityModal');
const productForm = document.getElementById('productForm');
const quantityForm = document.getElementById('quantityForm');
const addProductBtn = document.getElementById('addProductBtn');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addProductBtn.addEventListener('click', () => openModal());
    
    categoryFilter.addEventListener('change', () => {
        renderProducts(categoryFilter.value);
    });
    
    productForm.addEventListener('submit', handleProductSubmit);
    quantityForm.addEventListener('submit', handleQuantitySubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
        if (e.target === quantityModal) {
            closeQuantityModal();
        }
    });
    
    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            if (this.closest('#productModal')) {
                closeModal();
            } else if (this.closest('#quantityModal')) {
                closeQuantityModal();
            }
        });
    });
}

// Load products from API
async function loadProducts() {
    try {
        productGrid.innerHTML = '<div class="loading">Loading products...</div>';
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products');
        
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<div class="empty-state"><h2>Error loading products</h2><p>Please refresh the page</p></div>';
    }
}

// Render products to the grid
function renderProducts(filterCategory = '') {
    const filteredProducts = filterCategory 
        ? products.filter(p => p.category === filterCategory)
        : products;
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<div class="empty-state"><h2>No products found</h2><p>Add your first product to get started</p></div>';
        return;
    }
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <span class="product-category">${product.category}</span>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-sku">SKU: ${product.sku}</div>
            ${product.manufacturer ? `<div class="product-manufacturer">🏭 ${product.manufacturer}</div>` : ''}
            ${product.specifications ? `<div class="product-specs">📋 ${product.specifications}</div>` : ''}
            
            <div class="product-info">
                <div class="product-quantity">
                    <div class="quantity-label">Stock:</div>
                    <div class="quantity-value ${product.quantity < 5 ? 'quantity-low' : ''}">${product.quantity}</div>
                </div>
                <div class="product-price">$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div class="product-actions">
                <button class="btn btn-warning" onclick="openQuantityModal(${product.id}, '${product.name}', ${product.quantity})">
                    📦 Update Qty
                </button>
                <button class="btn btn-info" onclick="editProduct(${product.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id}, '${product.name}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Open modal for adding/editing product
function openModal(product = null) {
    editingProductId = product ? product.id : null;
    const modalTitle = document.getElementById('modalTitle');
    
    if (product) {
        modalTitle.textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productManufacturer').value = product.manufacturer || '';
        document.getElementById('productSpecifications').value = product.specifications || '';
    } else {
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
    }
    
    productModal.style.display = 'block';
}

// Close product modal
function closeModal() {
    productModal.style.display = 'none';
    productForm.reset();
    editingProductId = null;
}

// Open quantity modal
function openQuantityModal(productId, productName, currentQuantity) {
    updatingQuantityProductId = productId;
    document.getElementById('quantityProductName').textContent = productName;
    document.getElementById('newQuantity').value = currentQuantity;
    quantityModal.style.display = 'block';
}

// Close quantity modal
function closeQuantityModal() {
    quantityModal.style.display = 'none';
    quantityForm.reset();
    updatingQuantityProductId = null;
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        sku: document.getElementById('productSku').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        price: parseFloat(document.getElementById('productPrice').value),
        manufacturer: document.getElementById('productManufacturer').value,
        specifications: document.getElementById('productSpecifications').value
    };
    
    try {
        const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save product');
        }
        
        closeModal();
        await loadProducts();
        
        // Reset filter if needed
        if (categoryFilter.value && categoryFilter.value !== productData.category) {
            categoryFilter.value = '';
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error: ' + error.message);
    }
}

// Handle quantity form submission
async function handleQuantitySubmit(e) {
    e.preventDefault();
    
    const newQuantity = parseInt(document.getElementById('newQuantity').value);
    
    try {
        const response = await fetch(`/api/products/${updatingQuantityProductId}/quantity`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update quantity');
        }
        
        closeQuantityModal();
        await loadProducts();
        
        // Re-apply filter if active
        if (categoryFilter.value) {
            renderProducts(categoryFilter.value);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Error: ' + error.message);
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Failed to load product');
        
        const product = await response.json();
        openModal(product);
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details');
    }
}

// Delete product
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete product');
        }
        
        await loadProducts();
        
        // Re-apply filter if active
        if (categoryFilter.value) {
            renderProducts(categoryFilter.value);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error: ' + error.message);
    }
}
