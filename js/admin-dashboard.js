// ================================
// ADMIN DASHBOARD - TRACKER COMPATIBLE VERSION
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
        console.log('🛠️ ADMIN: Initializing dashboard...');
        this.loadOrders();
        this.setupAutoRefresh();
        this.setupEventListeners();
    }

    loadOrders() {
        try {
            console.log('🛠️ ADMIN: Loading orders...');
            
            // Read from the SAME source as tracker
            const ordersData = localStorage.getItem('campusFixOrders');
            console.log('🛠️ ADMIN: Raw data from localStorage:', ordersData);
            
            if (!ordersData || ordersData === '{}') {
                console.log('🛠️ ADMIN: No orders found in localStorage');
                this.showNoOrders();
                return;
            }
            
            const orders = JSON.parse(ordersData);
            const ordersArray = Object.values(orders);
            
            console.log('🛠️ ADMIN: Processed orders:', ordersArray);
            
            if (ordersArray.length === 0) {
                this.showNoOrders();
                return;
            }
            
            // Sort by date (newest first)
            ordersArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);
            
        } catch (error) {
            console.error('❌ ADMIN: Error loading orders:', error);
            this.showError('Failed to load orders');
        }
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) {
            console.error('❌ ADMIN: ordersTableBody element not found!');
            return;
        }

        console.log('✅ ADMIN: Displaying', orders.length, 'orders');
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.order_code}</strong></td>
                <td>${order.customer_name || order.customerName}</td>
                <td>${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}</td>
                <td>${order.repair_type || order.repairType}</td>
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
                <td>${new Date(order.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewOrderDetails('${order.order_code}')">
                        <i class="fas fa-edit"></i> Manage
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        const colors = {
            'Order Received': '#f59e0b',      // Yellow
            'Diagnosis Complete': '#3b82f6',  // Blue
            'Repair In Progress': '#8b5cf6',  // Purple
            'Repair Complete': '#10b981',     // Green
            'Ready for Pickup': '#059669'     // Dark Green
        };
        return colors[status] || '#6b7280';   // Gray for unknown
    }

    viewOrderDetails(orderCode) {
        console.log('🛠️ ADMIN: Managing order:', orderCode);
        
        // Get order from localStorage
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (!order) {
            alert('❌ Order not found: ' + orderCode);
            return;
        }

        this.showManagementModal(order);
    }

    showManagementModal(order) {
        const modalHTML = `
            <div class="modal-backdrop" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
                align-items: center; justify-content: center; padding: 20px;
            ">
                <div style="
                    background: #1e293b; border-radius: 15px; padding: 0; 
                    max-width: 600px; width: 100%; max-height: 90vh; 
                    overflow-y: auto; border: 1px solid #334155;
                ">
                    <!-- Header -->
                    <div style="padding: 20px; border-bottom: 1px solid #334155; background: #0f172a;">
                        <div style="display: flex; justify-content: between; align-items: center;">
                            <h3 style="margin: 0; color: white;">Manage Order: ${order.order_code}</h3>
                            <button onclick="this.closest('.modal-backdrop').remove()" 
                                    style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; padding: 5px;">
                                &times;
                            </button>
                        </div>
                        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">
                            Created: ${new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 25px;">
                        <!-- Customer Info -->
                        <div style="margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user"></i> Customer Information
                            </h4>
                            <div style="display: grid; gap: 10px;">
                                <div><strong>Name:</strong> ${order.customer_name || order.customerName}</div>
                                <div><strong>Phone:</strong> ${order.customer_phone || order.customerPhone}</div>
                                <div><strong>Hostel:</strong> ${order.customer_hostel || order.customerHostel}</div>
                            </div>
                        </div>
                        
                        <!-- Device Info -->
                        <div style="margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-mobile-alt"></i> Device Information
                            </h4>
                            <div style="display: grid; gap: 10px;">
                                <div><strong>Device:</strong> ${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}</div>
                                <div><strong>Repair Type:</strong> ${order.repair_type || order.repairType}</div>
                                <div><strong>Urgency:</strong> ${order.urgency_level || order.urgencyLevel}</div>
                            </div>
                        </div>
                        
                        <!-- Status Management -->
                        <div style="margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                            <h4 style="color: #6366f1; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-sync-alt"></i> Update Repair Status
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <button onclick="adminDashboard.updateOrderStatus('${order.order_code}', 'Diagnosis Complete')" 
                                        class="status-btn" ${order.status !== 'Order Received' ? 'disabled' : ''}>
                                    <i class="fas fa-search"></i> Diagnosis Complete
                                </button>
                                <button onclick="adminDashboard.updateOrderStatus('${order.order_code}', 'Repair In Progress')" 
                                        class="status-btn" ${order.status !== 'Diagnosis Complete' ? 'disabled' : ''}>
                                    <i class="fas fa-tools"></i> Start Repair
                                </button>
                                <button onclick="adminDashboard.updateOrderStatus('${order.order_code}', 'Repair Complete')" 
                                        class="status-btn" ${order.status !== 'Repair In Progress' ? 'disabled' : ''}>
                                    <i class="fas fa-check"></i> Repair Complete
                                </button>
                                <button onclick="adminDashboard.updateOrderStatus('${order.order_code}', 'Ready for Pickup')" 
                                        class="status-btn" ${order.status !== 'Repair Complete' ? 'disabled' : ''}>
                                    <i class="fas fa-box"></i> Ready for Pickup
                                </button>
                            </div>
                            <div style="margin-top: 15px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
                                <strong>Current Status:</strong> <span style="color: #6366f1;">${order.status}</span>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button onclick="adminDashboard.contactCustomer('${order.order_code}')" 
                                    class="action-btn" style="background: #10b981;">
                                <i class="fab fa-whatsapp"></i> WhatsApp Customer
                            </button>
                            <button onclick="adminDashboard.viewInTracker('${order.order_code}')" 
                                    class="action-btn" style="background: #6366f1;">
                                <i class="fas fa-external-link-alt"></i> Open in Tracker
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const styles = `
            <style>
                .status-btn {
                    background: #374151;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .status-btn:hover:not(:disabled) {
                    background: #4b5563;
                }
                .status-btn:disabled {
                    background: #1f2937;
                    color: #6b7280;
                    cursor: not-allowed;
                }
                .action-btn {
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .action-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
            </style>
        `;

        // Remove existing modal and add new one
        document.querySelector('.modal-backdrop')?.remove();
        document.body.insertAdjacentHTML('beforeend', styles + modalHTML);
    }

    async updateOrderStatus(orderCode, newStatus) {
        console.log('🛠️ ADMIN: Updating order', orderCode, 'to', newStatus);
        
        try {
            // Get current orders
            const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            const order = orders[orderCode];
            
            if (!order) {
                alert('❌ Order not found!');
                return;
            }

            // Update order status and progress
            order.status = newStatus;
            order.updated_at = new Date().toISOString();
            
            // Update progress based on status
            const progressMap = {
                'Order Received': 10,
                'Diagnosis Complete': 30,
                'Repair In Progress': 50,
                'Repair Complete': 80,
                'Ready for Pickup': 100
            };
            order.progress = progressMap[newStatus] || 10;

            // Update steps timeline
            const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            if (!order.steps) order.steps = {};
            
            switch (newStatus) {
                case 'Diagnosis Complete':
                    order.steps.diagnosis = now;
                    order.steps.repair = 'Next';
                    break;
                case 'Repair In Progress':
                    order.steps.repair = 'In Progress';
                    break;
                case 'Repair Complete':
                    order.steps.repair = now;
                    order.steps.quality = 'In Progress';
                    break;
                case 'Ready for Pickup':
                    order.steps.quality = now;
                    order.steps.ready = 'Ready Now';
                    break;
            }

            // Save updated order
            orders[orderCode] = order;
            localStorage.setItem('campusFixOrders', JSON.stringify(orders));
            
            console.log('✅ ADMIN: Order updated successfully');
            
            // Send WhatsApp notification
            this.sendStatusUpdate(order, newStatus);
            
            // Close modal and refresh
            document.querySelector('.modal-backdrop')?.remove();
            this.loadOrders();
            
            alert(`✅ Status updated to: ${newStatus}\n\nWhatsApp message sent to customer.`);
            
        } catch (error) {
            console.error('❌ ADMIN: Error updating order:', error);
            alert('❌ Failed to update order status');
        }
    }

    sendStatusUpdate(order, newStatus) {
        let message = '';
        const customerName = order.customer_name || order.customerName;
        const device = `${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}`;

        switch (newStatus) {
            case 'Diagnosis Complete':
                message = `🔍 *Diagnosis Complete - CampusFix UENR*\n\nOrder: ${order.order_code}\nHello ${customerName}! Diagnosis completed. Your ${device} is ready for repair. We'll begin shortly!`;
                break;
            case 'Repair In Progress':
                message = `🛠️ *Repair Started - CampusFix UENR*\n\nOrder: ${order.order_code}\nHello ${customerName}! Repair work has begun on your ${device}. Making good progress!`;
                break;
            case 'Ready for Pickup':
                message = `🎉 *Ready for Pickup! - CampusFix UENR*\n\nOrder: ${order.order_code}\nHello ${customerName}! Your ${device} is ready for pickup! 🎉\n\n💬 Contact me for delivery: https://wa.me/233246912468`;
                break;
        }

        if (message) {
            const phone = order.customer_phone || order.customerPhone;
            const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    contactCustomer(orderCode) {
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        
        if (order) {
            const phone = order.customer_phone || order.customerPhone;
            const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
            window.open(url, '_blank');
        }
    }

    viewInTracker(orderCode) {
        // Open the main site tracker with this order code
        const trackerUrl = `${window.location.origin}${window.location.pathname.replace('admin-dashboard.html', 'index.html')}#tracker`;
        window.open(trackerUrl, '_blank');
        
        // You could also auto-fill the tracker
        setTimeout(() => {
            localStorage.setItem('autoTrackOrder', orderCode);
        }, 1000);
    }

    updateStats(orders) {
        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => o.status.includes('Progress') || o.status === 'Diagnosis Complete').length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        // Update the stats cards
        const elements = {
            'pendingCount': pending,
            'progressCount': inProgress, 
            'completedCount': completed,
            'revenueCount': completed * 150 // GH₵150 per completed order
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = id === 'revenueCount' ? `GH₵ ${elements[id]}` : elements[id];
            }
        });
    }

    setupAutoRefresh() {
        // Refresh every 5 seconds to catch new orders
        setInterval(() => {
            this.loadOrders();
        }, 5000);
    }

    setupEventListeners() {
        // Search functionality
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

    showNoOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                        <h3 style="color: #94a3b8; margin-bottom: 15px;">No Orders Yet</h3>
                        <p style="margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">
                            When customers create repair orders on the main website, they will appear here automatically.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="adminDashboard.loadOrders()" class="btn btn-primary">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                            <button onclick="window.open('index.html', '_blank')" class="btn btn-outline">
                                <i class="fas fa-external-link-alt"></i> View Main Site
                            </button>
                        </div>
                        <div style="margin-top: 25px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; display: inline-block;">
                            <small>💡 <strong>Tip:</strong> Open the main site and create a test order to see how it works!</small>
                        </div>
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
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                        <strong>Error:</strong> ${message}
                    </td>
                </tr>
            `;
        }
    }
}

// Global function for logout
function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'admin-login.html';
}

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ADMIN: Starting admin dashboard...');
    window.adminDashboard = new AdminDashboard();
});