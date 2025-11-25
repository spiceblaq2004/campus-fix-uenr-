// ================================
// ADMIN DASHBOARD - COMPATIBLE VERSION
// ================================

class AdminDashboard {
    constructor() {
        if (!localStorage.getItem('adminAuthenticated')) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupAutoRefresh();
        this.setupSearch();
    }

    loadOrders() {
        try {
            // DEBUG: Check storage
            console.log('🛠️ ADMIN: Loading orders from localStorage...');
            
            const ordersJSON = localStorage.getItem('campusFixOrders');
            console.log('🛠️ ADMIN: Raw localStorage data:', ordersJSON);
            
            const ordersObj = JSON.parse(ordersJSON || '{}');
            const ordersArray = Object.values(ordersObj);
            
            console.log('🛠️ ADMIN: Found orders:', ordersArray);
            
            // Sort by date (newest first)
            ordersArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);
            
        } catch (error) {
            console.error('❌ ADMIN: Error loading orders:', error);
            this.displayError('Failed to load orders: ' + error.message);
        }
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) {
            console.error('❌ ADMIN: ordersTableBody not found!');
            return;
        }

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No orders found. Orders will appear here when customers create them.
                        <br><br>
                        <button onclick="location.reload()" class="btn btn-outline">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.order_code}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.device_brand} ${order.device_model}</td>
                <td>${order.repair_type}</td>
                <td>
                    <span class="status-badge" style="
                        background: ${this.getStatusColor(order.status)}; 
                        color: white; 
                        padding: 4px 12px; 
                        border-radius: 20px; 
                        font-size: 12px; 
                        font-weight: 600;
                    ">
                        ${order.status}
                    </span>
                </td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminDashboard.viewOrder('${order.order_code}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ ADMIN: Displayed', orders.length, 'orders');
    }

    getStatusColor(status) {
        const colors = {
            'Order Received': '#f59e0b',
            'Diagnosis Complete': '#3b82f6', 
            'Repair In Progress': '#8b5cf6',
            'Repair Complete': '#10b981',
            'Ready for Pickup': '#059669'
        };
        return colors[status] || '#6b7280';
    }

    viewOrder(orderCode) {
        console.log('🛠️ ADMIN: Viewing order:', orderCode);
        
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (!order) {
            alert('Order not found: ' + orderCode);
            return;
        }

        this.showOrderModal(order);
    }

    showOrderModal(order) {
        // Create modal HTML
        const modalHTML = `
            <div id="orderModal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
                align-items: center; justify-content: center;
            ">
                <div style="
                    background: #1e293b; border-radius: 15px; padding: 0; 
                    max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;
                ">
                    <div style="padding: 20px; border-bottom: 1px solid #334155; display: flex; justify-content: between; align-items: center;">
                        <h3 style="margin: 0;">Order: ${order.order_code}</h3>
                        <button onclick="document.getElementById('orderModal').remove()" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div style="padding: 20px;">
                        <!-- Customer Info -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px;">Customer Information</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div><strong>Name:</strong> ${order.customer_name}</div>
                                <div><strong>Phone:</strong> ${order.customer_phone}</div>
                                <div><strong>Hostel:</strong> ${order.customer_hostel}</div>
                                <div><strong>Email:</strong> ${order.customer_email || 'Not provided'}</div>
                            </div>
                        </div>
                        
                        <!-- Device Info -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px;">Device Information</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div><strong>Device:</strong> ${order.device_brand} ${order.device_model}</div>
                                <div><strong>Repair:</strong> ${order.repair_type}</div>
                                <div><strong>Urgency:</strong> ${order.urgency_level}</div>
                                <div><strong>Status:</strong> ${order.status}</div>
                            </div>
                        </div>
                        
                        <!-- Issue -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px;">Issue Description</h4>
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                                ${order.issue_description}
                            </div>
                        </div>
                        
                        <!-- Status Update -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px;">Update Status</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                                ${this.getStatusButtons(order.status)}
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div>
                            <h4 style="color: #6366f1; margin-bottom: 15px;">Quick Actions</h4>
                            <button onclick="adminDashboard.contactCustomer('${order.order_code}')" class="btn btn-primary">
                                <i class="fab fa-whatsapp"></i> Contact Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal and add new one
        const existingModal = document.getElementById('orderModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    getStatusButtons(currentStatus) {
        const buttons = {
            'Order Received': '<button onclick="adminDashboard.updateStatus(\'diagnosis_complete\')" class="btn btn-primary">Diagnosis Complete</button>',
            'Diagnosis Complete': '<button onclick="adminDashboard.updateStatus(\'repair_started\')" class="btn btn-primary">Start Repair</button>',
            'Repair In Progress': '<button onclick="adminDashboard.updateStatus(\'repair_complete\')" class="btn btn-primary">Repair Complete</button>',
            'Repair Complete': '<button onclick="adminDashboard.updateStatus(\'ready_pickup\')" class="btn btn-primary">Ready for Pickup</button>'
        };
        
        return buttons[currentStatus] || '<button disabled class="btn btn-outline">Completed</button>';
    }

    updateStatus(action) {
        const modal = document.getElementById('orderModal');
        const orderCode = modal.querySelector('h3').textContent.replace('Order: ', '');
        
        console.log('🛠️ ADMIN: Updating status:', orderCode, action);
        
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (!order) {
            alert('Order not found!');
            return;
        }

        // Update status based on action
        const statusMap = {
            'diagnosis_complete': { status: 'Diagnosis Complete', progress: 30 },
            'repair_started': { status: 'Repair In Progress', progress: 50 },
            'repair_complete': { status: 'Repair Complete', progress: 80 },
            'ready_pickup': { status: 'Ready for Pickup', progress: 100 }
        };

        const update = statusMap[action];
        if (update) {
            order.status = update.status;
            order.progress = update.progress;
            order.updated_at = new Date().toISOString();
            
            // Save updated order
            orders[orderCode] = order;
            localStorage.setItem('campusFixOrders', JSON.stringify(orders));
            
            // Reload orders
            this.loadOrders();
            
            // Close modal
            modal.remove();
            
            alert(`✅ Status updated to: ${update.status}`);
        }
    }

    contactCustomer(orderCode) {
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (order) {
            const url = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}`;
            window.open(url, '_blank');
        }
    }

    updateStats(orders) {
        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => o.status.includes('Progress') || o.status === 'Diagnosis Complete').length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        // Update DOM if elements exist
        ['pendingCount', 'progressCount', 'completedCount'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                const values = [pending, inProgress, completed];
                element.textContent = values[index];
            }
        });
    }

    setupAutoRefresh() {
        setInterval(() => {
            this.loadOrders();
        }, 5000); // Refresh every 5 seconds
    }

    setupSearch() {
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#ordersTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    displayError(message) {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        ${message}
                    </td>
                </tr>
            `;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});