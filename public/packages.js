// Global variables
let packages = [];
let allProducts = [];
let editingPackageId = null;
let currentManagingPackageId = null;
let updateQtyPackageId = null;
let updateQtyProductId = null;

// DOM Elements
const packageGrid = document.getElementById('packageGrid');
const packageModal = document.getElementById('packageModal');
const manageProductsModal = document.getElementById('manageProductsModal');
const updateProductQtyModal = document.getElementById('updateProductQtyModal');
const packageForm = document.getElementById('packageForm');
const updateQtyForm = document.getElementById('updateQtyForm');
const addPackageBtn = document.getElementById('addPackageBtn');
const productSearch = document.getElementById('productSearch');
const categoryFilterModal = document.getElementById('categoryFilterModal');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadPackages();
    loadAllProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addPackageBtn.addEventListener('click', () => openModal());
    
    packageForm.addEventListener('submit', handlePackageSubmit);
    updateQtyForm.addEventListener('submit', handleUpdateQtySubmit);
    
    if (productSearch) {
        productSearch.addEventListener('input', () => {
            filterAvailableProducts();
        });
    }
    
    if (categoryFilterModal) {
        categoryFilterModal.addEventListener('change', () => {
            filterAvailableProducts();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === packageModal) {
            closeModal();
        }
        if (e.target === manageProductsModal) {
            closeManageProductsModal();
        }
        if (e.target === updateProductQtyModal) {
            closeUpdateQtyModal();
        }
    });
    
    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            if (this.closest('#packageModal')) {
                closeModal();
            } else if (this.closest('#manageProductsModal')) {
                closeManageProductsModal();
            } else if (this.closest('#updateProductQtyModal')) {
                closeUpdateQtyModal();
            }
        });
    });
}

// Load all packages from API
async function loadPackages() {
    try {
        packageGrid.innerHTML = '<div class="loading">Loading packages...</div>';
        const response = await fetch('/api/packages');
        if (!response.ok) throw new Error('Failed to load packages');
        
        packages = await response.json();
        renderPackages();
    } catch (error) {
        console.error('Error loading packages:', error);
        packageGrid.innerHTML = '<div class="empty-state"><h2>Error loading packages</h2><p>Please refresh the page</p></div>';
    }
}

// Load all products for the product picker
async function loadAllProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render packages to the grid
function renderPackages() {
    if (packages.length === 0) {
        packageGrid.innerHTML = '<div class="empty-state"><h2>No packages found</h2><p>Create your first package to get started</p></div>';
        return;
    }
    
    packageGrid.innerHTML = packages.map(pkg => {
        const productCount = pkg.products ? pkg.products.length : 0;
        const totalItems = pkg.products ? pkg.products.reduce((sum, p) => sum + p.package_quantity, 0) : 0;
        
        return `
            <div class="package-card">
                <div class="package-header">
                    <h3 class="package-name">${pkg.name}</h3>
                    <div class="package-price">$${pkg.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                
                ${pkg.description ? `<p class="package-description">${pkg.description}</p>` : ''}
                
                <div class="package-stats">
                    <div class="stat">
                        <span class="stat-label">Products:</span>
                        <span class="stat-value">${productCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Items:</span>
                        <span class="stat-value">${totalItems}</span>
                    </div>
                </div>
                
                ${pkg.products && pkg.products.length > 0 ? `
                    <div class="package-products-preview">
                        <h4>📦 Included Products:</h4>
                        <ul class="product-preview-list">
                            ${pkg.products.slice(0, 5).map(p => `
                                <li>
                                    <span class="product-qty">${p.package_quantity}x</span>
                                    <span class="product-name-preview">${p.name}</span>
                                </li>
                            `).join('')}
                            ${pkg.products.length > 5 ? `<li class="more-products">+ ${pkg.products.length - 5} more...</li>` : ''}
                        </ul>
                    </div>
                ` : '<div class="empty-package">No products added yet</div>'}
                
                <div class="package-actions">
                    <button class="btn btn-info" onclick="openManageProductsModal(${pkg.id})">
                        📋 Manage Products
                    </button>
                    <button class="btn btn-warning" onclick="editPackage(${pkg.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="deletePackage(${pkg.id}, '${pkg.name.replace(/'/g, "\\'")}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open modal for adding/editing package
function openModal(pkg = null) {
    editingPackageId = pkg ? pkg.id : null;
    const modalTitle = document.getElementById('modalTitle');
    
    if (pkg) {
        modalTitle.textContent = 'Edit Package';
        document.getElementById('packageName').value = pkg.name;
        document.getElementById('packageDescription').value = pkg.description || '';
        document.getElementById('packagePrice').value = pkg.price;
    } else {
        modalTitle.textContent = 'Create New Package';
        packageForm.reset();
    }
    
    packageModal.style.display = 'block';
}

// Close package modal
function closeModal() {
    packageModal.style.display = 'none';
    packageForm.reset();
    editingPackageId = null;
}

// Handle package form submission
async function handlePackageSubmit(e) {
    e.preventDefault();
    
    const packageData = {
        name: document.getElementById('packageName').value,
        description: document.getElementById('packageDescription').value,
        price: parseFloat(document.getElementById('packagePrice').value)
    };
    
    try {
        const url = editingPackageId ? `/api/packages/${editingPackageId}` : '/api/packages';
        const method = editingPackageId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save package');
        }
        
        closeModal();
        await loadPackages();
    } catch (error) {
        console.error('Error saving package:', error);
        alert('Error: ' + error.message);
    }
}

// Edit package
async function editPackage(packageId) {
    try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) throw new Error('Failed to load package');
        
        const pkg = await response.json();
        openModal(pkg);
    } catch (error) {
        console.error('Error loading package:', error);
        alert('Error loading package details');
    }
}

// Delete package
async function deletePackage(packageId, packageName) {
    if (!confirm(`Are you sure you want to delete "${packageName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/packages/${packageId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete package');
        }
        
        await loadPackages();
    } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error: ' + error.message);
    }
}

// Open manage products modal
async function openManageProductsModal(packageId) {
    currentManagingPackageId = packageId;
    
    try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) throw new Error('Failed to load package');
        
        const pkg = await response.json();
        document.getElementById('currentPackageName').textContent = pkg.name;
        
        renderCurrentProducts(pkg.products || []);
        renderAvailableProducts(pkg.products || []);
        
        manageProductsModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading package:', error);
        alert('Error loading package details');
    }
}

// Close manage products modal
function closeManageProductsModal() {
    manageProductsModal.style.display = 'none';
    currentManagingPackageId = null;
    productSearch.value = '';
    categoryFilterModal.value = '';
    loadPackages(); // Refresh packages after managing products
}

// Render current products in package
function renderCurrentProducts(products) {
    const currentProductsList = document.getElementById('currentProductsList');
    
    if (products.length === 0) {
        currentProductsList.innerHTML = '<div class="empty-state-small">No products in this package yet</div>';
        return;
    }
    
    currentProductsList.innerHTML = products.map(product => `
        <div class="current-product-item">
            <div class="product-info-compact">
                <div class="product-name-compact">${product.name}</div>
                <div class="product-sku-compact">SKU: ${product.sku}</div>
                <div class="product-category-compact">${product.category}</div>
            </div>
            <div class="product-qty-section">
                <span class="qty-label">Qty:</span>
                <span class="qty-value">${product.package_quantity}</span>
            </div>
            <div class="product-actions-compact">
                <button class="btn-icon btn-edit" onclick="openUpdateQtyModal(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.package_quantity})" title="Update quantity">
                    ✏️
                </button>
                <button class="btn-icon btn-remove" onclick="removeProductFromPackage(${product.id}, '${product.name.replace(/'/g, "\\'")}'))" title="Remove">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Render available products
function renderAvailableProducts(currentProducts) {
    const availableProductsList = document.getElementById('availableProductsList');
    const currentProductIds = currentProducts.map(p => p.id);
    
    const availableProducts = allProducts.filter(p => !currentProductIds.includes(p.id));
    
    if (availableProducts.length === 0) {
        availableProductsList.innerHTML = '<div class="empty-state-small">All products are already in this package</div>';
        return;
    }
    
    availableProductsList.innerHTML = availableProducts.map(product => `
        <div class="available-product-item" data-name="${product.name.toLowerCase()}" data-sku="${product.sku.toLowerCase()}" data-category="${product.category}">
            <div class="product-info-compact">
                <div class="product-name-compact">${product.name}</div>
                <div class="product-sku-compact">SKU: ${product.sku}</div>
                <div class="product-category-compact">${product.category}</div>
                <div class="product-price-compact">$${product.price.toFixed(2)}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addProductToPackage(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                ➕ Add
            </button>
        </div>
    `).join('');
}

// Filter available products
function filterAvailableProducts() {
    const searchTerm = productSearch.value.toLowerCase();
    const category = categoryFilterModal.value;
    const items = document.querySelectorAll('.available-product-item');
    
    items.forEach(item => {
        const name = item.dataset.name;
        const sku = item.dataset.sku;
        const itemCategory = item.dataset.category;
        
        const matchesSearch = !searchTerm || name.includes(searchTerm) || sku.includes(searchTerm);
        const matchesCategory = !category || itemCategory === category;
        
        item.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
    });
}

// Add product to package
async function addProductToPackage(productId, productName) {
    const quantity = prompt(`How many units of "${productName}" to add?`, '1');
    
    if (quantity === null) return;
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
        alert('Please enter a valid quantity (minimum 1)');
        return;
    }
    
    try {
        const response = await fetch(`/api/packages/${currentManagingPackageId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: qty })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add product');
        }
        
        // Refresh the manage products modal
        await openManageProductsModal(currentManagingPackageId);
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error: ' + error.message);
    }
}

// Remove product from package
async function removeProductFromPackage(productId, productName) {
    if (!confirm(`Remove "${productName}" from this package?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/packages/${currentManagingPackageId}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to remove product');
        }
        
        // Refresh the manage products modal
        await openManageProductsModal(currentManagingPackageId);
    } catch (error) {
        console.error('Error removing product:', error);
        alert('Error: ' + error.message);
    }
}

// Open update quantity modal
function openUpdateQtyModal(productId, productName, currentQty) {
    updateQtyPackageId = currentManagingPackageId;
    updateQtyProductId = productId;
    document.getElementById('updateQtyProductName').textContent = productName;
    document.getElementById('productQtyInput').value = currentQty;
    updateProductQtyModal.style.display = 'block';
}

// Close update quantity modal
function closeUpdateQtyModal() {
    updateProductQtyModal.style.display = 'none';
    updateQtyPackageId = null;
    updateQtyProductId = null;
    updateQtyForm.reset();
}

// Handle update quantity form submission
async function handleUpdateQtySubmit(e) {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('productQtyInput').value);
    
    try {
        const response = await fetch(`/api/packages/${updateQtyPackageId}/products/${updateQtyProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update quantity');
        }
        
        closeUpdateQtyModal();
        // Refresh the manage products modal
        await openManageProductsModal(currentManagingPackageId);
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Error: ' + error.message);
    }
}
