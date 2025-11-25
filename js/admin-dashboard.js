// ================================
// SIMPLIFIED ADMIN DASHBOARD
// ================================

class AdminDashboard {
    constructor() {
        this.currentOrder = null;
        this.checkAuth();
        this.initializeDashboard();
    }

    checkAuth() {
        if (!localStorage.getItem('adminAuthenticated')) {
            window.location.href = 'admin-login.html';
            return;
        }
    }

    initializeDashboard() {
        this.loadOrders();
        this.setupEventListeners();
        
        // Auto-refresh every 10 seconds
        setInterval(() => {
            this.loadOrders();
        }, 10000);
    }

    setupEventListeners() {
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }
    }

    loadOrders() {
        try {
            // Load from localStorage (primary source)
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            const ordersArray = Object.values(savedOrders).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);

        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-400);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No orders yet. New orders will appear here automatically.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => {
            const statusClass = order.status.toLowerCase().replace(/ /g, '-');
            const createdDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <tr>
                    <td><strong>${order.order_code}</strong></td>
                    <td>${order.customer_name}</td>
                    <td>${order.device_brand} ${order.device_model}</td>
                    <td>${order.repair_type}</td>
                    <td><span class="status-badge status-${statusClass}">${order.status}</span></td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="adminDashboard.viewOrder('${order.order_code}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewOrder(orderCode) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        this.currentOrder = savedOrders[orderCode];
        
        if (this.currentOrder) {
            this.showOrderModal(this.currentOrder);
        } else {
            alert('Order not found!');
        }
    }

    showOrderModal(order) {
        // Create or update modal
        let modal = document.getElementById('orderModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orderModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Order Details - <span id="modalOrderCode"></span></h3>
                        <button class="close-btn" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="order-details-grid">
                            <div class="detail-group">
                                <h4>Customer Information</h4>
                                <p><strong>Name:</strong> <span id="detailCustomerName"></span></p>
                                <p><strong>Phone:</strong> <span id="detailCustomerPhone"></span></p>
                                <p><strong>Hostel:</strong> <span id="detailCustomerHostel"></span></p>
                            </div>
                            <div class="detail-group">
                                <h4>Device Information</h4>
                                <p><strong>Device:</strong> <span id="detailDevice"></span></p>
                                <p><strong>Repair:</strong> <span id="detailRepair"></span></p>
                                <p><strong>Issue:</strong> <span id="detailIssue"></span></p>
                            </div>
                        </div>

                        <div class="status-update-section">
                            <h4>Update Repair Status</h4>
                            <div class="status-buttons" id="statusButtons">
                                <!-- Buttons will be added dynamically -->
                            </div>
                        </div>

                        <div class="progress-timeline">
                            <h4>Repair Progress</h4>
                            <div id="progressTimeline"></div>
                        </div>

                        <div class="quick-actions">
                            <h4>Quick Actions</h4>
                            <div class="action-buttons">
                                <button class="btn btn-secondary" onclick="contactCustomer()">
                                    <i class="fab fa-whatsapp"></i> Contact Customer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Update modal content
        document.getElementById('modalOrderCode').textContent = order.order_code;
        document.getElementById('detailCustomerName').textContent = order.customer_name;
        document.getElementById('detailCustomerPhone').textContent = order.customer_phone;
        document.getElementById('detailCustomerHostel').textContent = order.customer_hostel;
        document.getElementById('detailDevice').textContent = `${order.device_brand} ${order.device_model}`;
        document.getElementById('detailRepair').textContent = order.repair_type;
        document.getElementById('detailIssue').textContent = order.issue_description;

        this.updateProgressTimeline(order);
        this.updateActionButtons(order.status);
        
        modal.style.display = 'block';
    }

    updateActionButtons(currentStatus) {
        const statusButtons = document.getElementById('statusButtons');
        if (!statusButtons) return;

        let buttonsHTML = '';

        if (currentStatus === 'Order Received') {
            buttonsHTML = `
                <button class="btn btn-primary" onclick="updateOrderStatus('diagnosis_complete')">
                    <i class="fas fa-search"></i> Diagnosis Complete
                </button>
            `;
        } else if (currentStatus === 'Diagnosis Complete') {
            buttonsHTML = `
                <button class="btn btn-primary" onclick="updateOrderStatus('repair_started')">
                    <i class="fas fa-tools"></i> Start Repair
                </button>
            `;
        } else if (currentStatus === 'Repair In Progress') {
            buttonsHTML = `
                <button class="btn btn-primary" onclick="updateOrderStatus('repair_complete')">
                    <i class="fas fa-check"></i> Repair Complete
                </button>
            `;
        } else if (currentStatus === 'Repair Complete') {
            buttonsHTML = `
                <button class="btn btn-primary" onclick="updateOrderStatus('ready_pickup')">
                    <i class="fas fa-box"></i> Ready for Pickup
                </button>
            `;
        } else {
            buttonsHTML = `
                <button class="btn btn-outline" disabled>
                    <i class="fas fa-check-circle"></i> Order Completed
                </button>
            `;
        }

        statusButtons.innerHTML = buttonsHTML;
    }

    updateProgressTimeline(order) {
        const timeline = document.getElementById('progressTimeline');
        if (!timeline) return;

        const steps = order.steps || {};

        const timelineSteps = [
            { name: 'Order Received', time: steps.received || 'Pending', completed: true },
            { name: 'Diagnosis', time: steps.diagnosis || 'Pending', completed: steps.diagnosis && steps.diagnosis !== 'Pending' },
            { name: 'Repair', time: steps.repair || 'Pending', completed: steps.repair && steps.repair !== 'Pending' },
            { name: 'Quality Check', time: steps.quality || 'Pending', completed: steps.quality && steps.quality !== 'Pending' },
            { name: 'Ready for Pickup', time: steps.ready || 'Pending', completed: steps.ready && steps.ready !== 'Pending' }
        ];

        timeline.innerHTML = timelineSteps.map(step => `
            <div class="timeline-step ${step.completed ? 'completed' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>${step.name}</strong>
                    <span>${step.time}</span>
                </div>
            </div>
        `).join('');
    }

    async updateOrderStatus(action) {
        if (!this.currentOrder) return;

        try {
            const orderCode = this.currentOrder.order_code;
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            const order = savedOrders[orderCode];

            if (!order) return;

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Update order status
            switch (action) {
                case 'diagnosis_complete':
                    order.status = 'Diagnosis Complete';
                    order.progress = 30;
                    order.steps.diagnosis = timeString;
                    order.steps.repair = 'Next';
                    this.addOrderUpdate(order, 'Diagnosis completed - ready for repair', timeString);
                    break;

                case 'repair_started':
                    order.status = 'Repair In Progress';
                    order.progress = 50;
                    order.steps.repair = 'In Progress';
                    this.addOrderUpdate(order, 'Repair work started', timeString);
                    break;

                case 'repair_complete':
                    order.status = 'Repair Complete';
                    order.progress = 80;
                    order.steps.repair = timeString;
                    order.steps.quality = 'In Progress';
                    this.addOrderUpdate(order, 'Repair completed - quality check in progress', timeString);
                    break;

                case 'ready_pickup':
                    order.status = 'Ready for Pickup';
                    order.progress = 100;
                    order.steps.quality = timeString;
                    order.steps.ready = 'Ready Now';
                    this.addOrderUpdate(order, 'Repair completed and ready for pickup!', timeString);
                    break;
            }

            order.updated_at = now.toISOString();
            savedOrders[orderCode] = order;
            localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));

            // Send WhatsApp update to customer
            this.sendStatusUpdateToCustomer(order, action);

            // Update UI
            this.updateProgressTimeline(order);
            this.updateActionButtons(order.status);
            this.loadOrders();
            
            alert('Status updated successfully! Customer notified via WhatsApp.');

        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order. Please try again.');
        }
    }

    addOrderUpdate(order, message, time) {
        if (!order.updates) order.updates = [];
        
        order.updates.push({
            icon: 'fas fa-info-circle',
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            message: message,
            time: time
        });
    }

    sendStatusUpdateToCustomer(order, action) {
        let message = '';
        
        switch (action) {
            case 'diagnosis_complete':
                message = `🔍 *Diagnosis Complete - CampusFix UENR*

📦 Order: ${order.order_code}
✅ Diagnosis completed successfully
🔧 Ready to begin repair

We'll start the repair process now.`;
                break;

            case 'repair_started':
                message = `🛠️ *Repair Started - CampusFix UENR*

📦 Order: ${order.order_code}
🔧 Repair work has begun on your ${order.device_brand} ${order.device_model}
⏰ Making good progress`;
                break;

            case 'ready_pickup':
                message = `🎉 *Ready for Pickup! - CampusFix UENR*

📦 Order: ${order.order_code}
✅ Your ${order.device_brand} ${order.device_model} is ready for pickup!
🏠 Free delivery available

💬 Contact me for delivery: https://wa.me/233246912468`;
                break;
        }

        if (message) {
            const url = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    updateStats(orders) {
        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => 
            o.status.includes('Progress') || 
            o.status === 'Diagnosis Complete' ||
            o.status === 'Repair Complete'
        ).length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        // Update DOM elements if they exist
        if (document.getElementById('pendingCount')) {
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('progressCount').textContent = inProgress;
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('revenueCount').textContent = `GH₵ ${completed * 150}`;
        }
    }

    filterOrders(searchTerm) {
        const tbody = document.getElementById('ordersTableBody');
        const rows = tbody.getElementsByTagName('tr');
        
        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        }
    }
}

// Global functions
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'admin-login.html';
}

function updateOrderStatus(action) {
    if (window.adminDashboard) {
        window.adminDashboard.updateOrderStatus(action);
    }
}

function contactCustomer() {
    if (window.adminDashboard && window.adminDashboard.currentOrder) {
        const url = `https://wa.me/${window.adminDashboard.currentOrder.customer_phone.replace(/\D/g, '')}`;
        window.open(url, '_blank');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});