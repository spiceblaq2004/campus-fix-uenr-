// ================================
// ADMIN DASHBOARD FUNCTIONALITY
// ================================

class AdminDashboard {
    constructor() {
        this.currentOrder = null;
        this.initializeDashboard();
    }

    initializeDashboard() {
        // Check authentication
        if (!localStorage.getItem('adminAuthenticated')) {
            window.location.href = 'admin-login.html';
            return;
        }

        this.loadOrders();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }
    }

    loadOrders() {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const ordersArray = Object.values(savedOrders).sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        this.displayOrders(ordersArray);
        this.updateStats(ordersArray);
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.order_code}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.deviceBrand} ${order.deviceModel}</td>
                <td>${order.repairType}</td>
                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminDashboard.viewOrder('${order.order_code}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    viewOrder(orderCode) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        this.currentOrder = savedOrders[orderCode];
        
        if (this.currentOrder) {
            this.showOrderModal(this.currentOrder);
        }
    }

    showOrderModal(order) {
        document.getElementById('modalOrderCode').textContent = order.order_code;
        document.getElementById('detailCustomerName').textContent = order.customerName;
        document.getElementById('detailCustomerPhone').textContent = order.customerPhone;
        document.getElementById('detailCustomerHostel').textContent = order.customerHostel;
        document.getElementById('detailDevice').textContent = `${order.deviceBrand} ${order.deviceModel}`;
        document.getElementById('detailRepair').textContent = order.repairType;
        document.getElementById('detailIssue').textContent = order.issueDescription;

        this.updateProgressTimeline(order);
        document.getElementById('orderModal').style.display = 'block';
    }

    updateProgressTimeline(order) {
        const timeline = document.getElementById('progressTimeline');
        if (!timeline) return;

        const steps = [
            { name: 'Order Received', time: order.steps.received, completed: true },
            { name: 'Diagnosis', time: order.steps.diagnosis, completed: order.steps.diagnosis !== 'Pending' },
            { name: 'Repair', time: order.steps.repair, completed: order.steps.repair !== 'Pending' },
            { name: 'Quality Check', time: order.steps.quality, completed: order.steps.quality !== 'Pending' },
            { name: 'Ready for Pickup', time: order.steps.ready, completed: order.steps.ready !== 'Pending' }
        ];

        timeline.innerHTML = steps.map(step => `
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

        const orderCode = this.currentOrder.order_code;
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = savedOrders[orderCode];

        if (!order) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        switch (action) {
            case 'diagnosis_complete':
                order.status = 'Diagnosis Complete';
                order.progress = 30;
                order.steps.diagnosis = timeString;
                order.steps.repair = 'Next';
                this.addOrderUpdate(order, 'fas fa-search', 'Diagnosis completed - ready for repair', timeString);
                break;

            case 'repair_started':
                order.status = 'Repair In Progress';
                order.progress = 50;
                order.steps.repair = 'In Progress';
                this.addOrderUpdate(order, 'fas fa-tools', 'Repair work started', timeString);
                break;

            case 'repair_complete':
                order.status = 'Repair Complete';
                order.progress = 80;
                order.steps.repair = timeString;
                order.steps.quality = 'In Progress';
                this.addOrderUpdate(order, 'fas fa-check', 'Repair completed - quality check in progress', timeString);
                break;

            case 'ready_pickup':
                order.status = 'Ready for Pickup';
                order.progress = 100;
                order.steps.quality = timeString;
                order.steps.ready = 'Ready Now';
                this.addOrderUpdate(order, 'fas fa-box', 'Repair completed and ready for pickup!', timeString);
                break;
        }

        order.updated_at = now.toISOString();
        savedOrders[orderCode] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));

        // Send WhatsApp notification to customer
        await this.sendStatusUpdateToCustomer(order, action);

        // Update UI
        this.updateProgressTimeline(order);
        this.loadOrders();
        
        this.showNotification('Status updated successfully!', 'success');
    }

    addOrderUpdate(order, icon, message, time) {
        if (!order.updates) order.updates = [];
        
        order.updates.push({
            icon: icon,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            message: message,
            time: time
        });
    }

    async sendStatusUpdateToCustomer(order, action) {
        let message = '';
        
        switch (action) {
            case 'diagnosis_complete':
                message = `🔍 *Diagnosis Complete - CampusFix UENR*

📦 Order: ${order.order_code}
✅ Diagnosis completed successfully
🔧 Ready to begin repair

We'll start the repair process now. Estimated completion: ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

Track your order: https://campusfix-uenr.netlify.app/#tracker`;
                break;

            case 'repair_started':
                message = `🛠️ *Repair Started - CampusFix UENR*

📦 Order: ${order.order_code}
🔧 Repair work has begun
⏰ Making good progress

Your ${order.deviceBrand} ${order.deviceModel} is now being repaired.`;
                break;

            case 'ready_pickup':
                message = `🎉 *Repair Complete! - CampusFix UENR*

📦 Order: ${order.order_code}
✅ Your device is ready for pickup!
🏠 Free delivery available

Your ${order.deviceBrand} ${order.deviceModel} has been successfully repaired and is ready for pickup.

💬 Contact me for delivery: https://wa.me/233246912468`;
                break;
        }

        if (message) {
            const url = `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    contactCustomer() {
        if (this.currentOrder) {
            const url = `https://wa.me/${this.currentOrder.customerPhone.replace(/\D/g, '')}`;
            window.open(url, '_blank');
        }
    }

    updateStats(orders = null) {
        if (!orders) {
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            orders = Object.values(savedOrders);
        }

        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => o.status.includes('Progress') || o.status === 'Diagnosis Complete').length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('progressCount').textContent = inProgress;
        document.getElementById('completedCount').textContent = completed;
    }

    filterOrders(searchTerm) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const ordersArray = Object.values(savedOrders);
        
        const filtered = ordersArray.filter(order => 
            order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.repairType.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.displayOrders(filtered);
    }

    showNotification(message, type = 'info') {
        alert(message); // You can replace with better notifications
    }
}

// Global functions for HTML onclick
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'admin-login.html';
}

function updateOrderStatus(action) {
    window.adminDashboard.updateOrderStatus(action);
}

function contactCustomer() {
    window.adminDashboard.contactCustomer();
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});