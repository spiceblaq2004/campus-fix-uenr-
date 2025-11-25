// ================================
// SIMPLE ADMIN DASHBOARD
// ================================

class AdminDashboard {
    constructor() {
        // Simple auth check
        if (!localStorage.getItem('adminAuthenticated')) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        this.init();
    }

    init() {
        console.log('🛠️ ADMIN: Starting dashboard...');
        this.loadOrders();
        this.setupAutoRefresh();
    }

    loadOrders() {
        try {
            console.log('🛠️ ADMIN: Checking localStorage...');
            
            // Read from localStorage
            const ordersData = localStorage.getItem('campusFixOrders');
            console.log('🛠️ ADMIN: Raw data:', ordersData);
            
            if (!ordersData || ordersData === '{}' || ordersData === 'null') {
                console.log('🛠️ ADMIN: No orders found');
                this.showNoOrders();
                return;
            }
            
            const orders = JSON.parse(ordersData);
            const ordersArray = Object.values(orders);
            
            console.log('🛠️ ADMIN: Found orders:', ordersArray);
            
            if (ordersArray.length === 0) {
                this.showNoOrders();
                return;
            }
            
            // Sort by date (newest first)
            ordersArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);
            
        } catch (error) {
            console.error('❌ ADMIN: Error:', error);
            this.showError('Error loading orders');
        }
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) {
            console.error('❌ ADMIN: Table body not found');
            return;
        }

        console.log('✅ ADMIN: Showing', orders.length, 'orders');
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.order_code}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.customer_phone}</td>
                <td>${order.device_brand} ${order.device_model}</td>
                <td>${order.repair_type}</td>
                <td>
                    <span class="status-badge" style="
                        background: ${this.getStatusColor(order.status)}; 
                        color: white; 
                        padding: 6px 12px; 
                        border-radius: 20px; 
                        font-size: 12px; 
                        font-weight: 600;
                    ">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button onclick="adminDashboard.manageOrder('${order.order_code}')" 
                            style="background: #6366f1; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                        Manage
                    </button>
                </td>
            </tr>
        `).join('');
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

    manageOrder(orderCode) {
        console.log('🛠️ ADMIN: Managing order:', orderCode);
        
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (!order) {
            alert('Order not found: ' + orderCode);
            return;
        }

        // Simple status update
        const newStatus = prompt(`Current status: ${order.status}\n\nEnter new status:\n- Diagnosis Complete\n- Repair In Progress\n- Repair Complete\n- Ready for Pickup`, order.status);
        
        if (newStatus && newStatus !== order.status) {
            order.status = newStatus;
            order.updated_at = new Date().toISOString();
            
            // Update progress
            const progressMap = {
                'Order Received': 10,
                'Diagnosis Complete': 30,
                'Repair In Progress': 50,
                'Repair Complete': 80,
                'Ready for Pickup': 100
            };
            order.progress = progressMap[newStatus] || 10;
            
            // Save changes
            orders[orderCode] = order;
            localStorage.setItem('campusFixOrders', JSON.stringify(orders));
            
            // Reload
            this.loadOrders();
            alert('✅ Status updated to: ' + newStatus);
        }
    }

    updateStats(orders) {
        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => o.status.includes('Progress') || o.status === 'Diagnosis Complete').length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        // Update stats
        if (document.getElementById('pendingCount')) {
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('progressCount').textContent = inProgress;
            document.getElementById('completedCount').textContent = completed;
        }
    }

    setupAutoRefresh() {
        // Refresh every 3 seconds
        setInterval(() => {
            this.loadOrders();
        }, 3000);
    }

    showNoOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                        <h3 style="color: #94a3b8; margin-bottom: 15px;">No Orders Found</h3>
                        <p>Orders will appear here when customers create them on the main website.</p>
                        <button onclick="adminDashboard.loadOrders()" 
                                style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px;">
                            Refresh
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    showError(message) {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                        <strong>Error:</strong> ${message}
                    </td>
                </tr>
            `;
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'admin-login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ADMIN: Starting dashboard...');
    window.adminDashboard = new AdminDashboard();
});