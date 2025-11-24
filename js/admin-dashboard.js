// ================================
// ADMIN DASHBOARD WITH JSONBIN INTEGRATION
// ================================

class AdminDashboard {
    constructor() {
        this.currentOrder = null;
        this.initializeDashboard();
    }

    async initializeDashboard() {
        // Check authentication
        if (!localStorage.getItem('adminAuthenticated')) {
            window.location.href = 'admin-login.html';
            return;
        }

        await this.loadOrders();
        this.setupEventListeners();
        this.updateStats();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadOrders();
        }, 30000);
    }

    setupEventListeners() {
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }
    }

    async loadOrders() {
        try {
            let ordersArray = [];
            
            // Try JSONBin first
            if (window.jsonbinBackend) {
                const data = await window.jsonbinBackend.getData();
                ordersArray = data.orders || [];
            } else {
                // Fallback to localStorage
                const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
                ordersArray = Object.values(savedOrders);
            }

            // Sort by creation date (newest first)
            ordersArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);

        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Failed to load orders. Using local data.', 'error');
            
            // Fallback to localStorage
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            const ordersArray = Object.values(savedOrders);
            this.displayOrders(ordersArray);
            this.updateStats(ordersArray);
        }
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

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

        orders.forEach(order => {
            const statusClass = order.status.toLowerCase().replace(/ /g, '-');
            const createdDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.order_code}</strong></td>
                <td>${order.customer_name || order.customerName}</td>
                <td>${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}</td>
                <td>${order.repair_type || order.repairType}</td>
                <td><span class="status-badge status-${statusClass}">${order.status}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminDashboard.viewOrder('${order.order_code}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async viewOrder(orderCode) {
        try {
            let order = null;
            
            // Try JSONBin first
            if (window.jsonbinBackend) {
                order = await window.jsonbinBackend.getOrder(orderCode);
            }
            
            // Fallback to localStorage
            if (!order) {
                const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
                order = savedOrders[orderCode];
            }

            if (order) {
                this.currentOrder = order;
                this.showOrderModal(order);
            } else {
                this.showNotification('Order not found!', 'error');
            }
        } catch (error) {
            console.error('Error loading order:', error);
            this.showNotification('Failed to load order details.', 'error');
        }
    }

    showOrderModal(order) {
        document.getElementById('modalOrderCode').textContent = order.order_code;
        document.getElementById('detailCustomerName').textContent = order.customer_name || order.customerName;
        document.getElementById('detailCustomerPhone').textContent = order.customer_phone || order.customerPhone;
        document.getElementById('detailCustomerHostel').textContent = order.customer_hostel || order.customerHostel;
        document.getElementById('detailDevice').textContent = `${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}`;
        document.getElementById('detailRepair').textContent = order.repair_type || order.repairType;
        document.getElementById('detailIssue').textContent = order.issue_description || order.issueDescription;

        this.updateProgressTimeline(order);
        
        // Update action buttons based on current status
        this.updateActionButtons(order.status);
        
        document.getElementById('orderModal').style.display = 'block';
    }

    updateActionButtons(currentStatus) {
        const statusButtons = document.querySelector('.status-buttons');
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

        // Handle both JSONBin and localStorage data structures
        const steps = order.steps || {};
        const updates = order.updates || [];

        const timelineSteps = [
            { 
                name: 'Order Received', 
                time: steps.received || steps.order_received || 'Pending',
                completed: true // Always completed once order exists
            },
            { 
                name: 'Diagnosis', 
                time: steps.diagnosis || 'Pending',
                completed: steps.diagnosis && steps.diagnosis !== 'Pending'
            },
            { 
                name: 'Repair', 
                time: steps.repair || steps.repair_in_progress || 'Pending',
                completed: (steps.repair && steps.repair !== 'Pending') || 
                          (steps.repair_in_progress && steps.repair_in_progress !== 'Pending')
            },
            { 
                name: 'Quality Check', 
                time: steps.quality || steps.quality_check || 'Pending',
                completed: (steps.quality && steps.quality !== 'Pending') ||
                          (steps.quality_check && steps.quality_check !== 'Pending')
            },
            { 
                name: 'Ready for Pickup', 
                time: steps.ready || steps.ready_for_pickup || 'Pending',
                completed: (steps.ready && steps.ready !== 'Pending') ||
                          (steps.ready_for_pickup && steps.ready_for_pickup !== 'Pending')
            }
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
            let order = this.currentOrder;
            
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Update order based on action
            switch (action) {
                case 'diagnosis_complete':
                    order.status = 'Diagnosis Complete';
                    order.progress = 30;
                    order.steps = order.steps || {};
                    order.steps.diagnosis = timeString;
                    order.steps.repair = 'Next';
                    this.addOrderUpdate(order, 'fas fa-search', 'Diagnosis completed - ready for repair', timeString);
                    break;

                case 'repair_started':
                    order.status = 'Repair In Progress';
                    order.progress = 50;
                    order.steps = order.steps || {};
                    order.steps.repair = 'In Progress';
                    this.addOrderUpdate(order, 'fas fa-tools', 'Repair work started', timeString);
                    break;

                case 'repair_complete':
                    order.status = 'Repair Complete';
                    order.progress = 80;
                    order.steps = order.steps || {};
                    order.steps.repair = timeString;
                    order.steps.quality = 'In Progress';
                    this.addOrderUpdate(order, 'fas fa-check', 'Repair completed - quality check in progress', timeString);
                    break;

                case 'ready_pickup':
                    order.status = 'Ready for Pickup';
                    order.progress = 100;
                    order.steps = order.steps || {};
                    order.steps.quality = timeString;
                    order.steps.ready = 'Ready Now';
                    this.addOrderUpdate(order, 'fas fa-box', 'Repair completed and ready for pickup!', timeString);
                    break;
            }

            order.updated_at = now.toISOString();

            // Save to JSONBin
            if (window.jsonbinBackend) {
                await this.saveOrderToJSONBin(order);
            } else {
                // Fallback to localStorage
                this.saveOrderToLocalStorage(order);
            }

            // Send WhatsApp notification to customer
            await this.sendStatusUpdateToCustomer(order, action);

            // Update UI
            this.updateProgressTimeline(order);
            this.updateActionButtons(order.status);
            await this.loadOrders();
            
            this.showNotification('Status updated successfully! Customer notified via WhatsApp.', 'success');

        } catch (error) {
            console.error('Error updating order:', error);
            this.showNotification('Failed to update order. Please try again.', 'error');
        }
    }

    async saveOrderToJSONBin(order) {
        try {
            const data = await window.jsonbinBackend.getData();
            
            // Find and update the order in the array
            const orderIndex = data.orders.findIndex(o => o.order_code === order.order_code);
            if (orderIndex !== -1) {
                data.orders[orderIndex] = order;
            } else {
                data.orders.push(order);
            }

            // Update order steps in JSONBin structure
            await this.updateOrderStepsInJSONBin(order);
            
            // Save the updated data
            await window.jsonbinBackend.updateData(data);

        } catch (error) {
            console.error('Error saving to JSONBin:', error);
            throw error;
        }
    }

    async updateOrderStepsInJSONBin(order) {
        try {
            const data = await window.jsonbinBackend.getData();
            
            // Update order_steps array
            const existingSteps = data.order_steps.filter(step => step.order_id === order.id);
            
            // Remove existing steps for this order
            data.order_steps = data.order_steps.filter(step => step.order_id !== order.id);
            
            // Add updated steps based on current status
            const steps = [];
            const now = new Date().toISOString();

            // Order Received (always completed)
            steps.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                step_name: 'Order Received',
                step_time: order.steps.received,
                is_completed: true,
                is_active: false,
                updated_at: now
            });

            // Diagnosis
            steps.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                step_name: 'Diagnosis',
                step_time: order.steps.diagnosis,
                is_completed: order.steps.diagnosis !== 'Pending',
                is_active: order.status === 'Order Received',
                updated_at: now
            });

            // Repair
            steps.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                step_name: 'Repair',
                step_time: order.steps.repair,
                is_completed: order.steps.repair !== 'Pending' && order.steps.repair !== 'Next',
                is_active: order.status === 'Diagnosis Complete' || order.status === 'Repair In Progress',
                updated_at: now
            });

            // Quality Check
            steps.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                step_name: 'Quality Check',
                step_time: order.steps.quality,
                is_completed: order.steps.quality !== 'Pending',
                is_active: order.status === 'Repair Complete',
                updated_at: now
            });

            // Ready for Pickup
            steps.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                step_name: 'Ready for Pickup',
                step_time: order.steps.ready,
                is_completed: order.steps.ready !== 'Pending',
                is_active: order.status === 'Ready for Pickup',
                updated_at: now
            });

            // Add new steps to data
            data.order_steps.push(...steps);

            await window.jsonbinBackend.updateData(data);

        } catch (error) {
            console.error('Error updating order steps:', error);
        }
    }

    saveOrderToLocalStorage(order) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.order_code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
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

        // Also add to JSONBin order_updates array
        this.addUpdateToJSONBin(order, icon, message, time);
    }

    async addUpdateToJSONBin(order, icon, message, time) {
        try {
            if (!window.jsonbinBackend) return;

            const data = await window.jsonbinBackend.getData();
            
            data.order_updates.push({
                id: window.jsonbinBackend.generateId(),
                order_id: order.id,
                message: message,
                icon: icon,
                color: 'text-blue-400',
                bg_color: 'bg-blue-400/10',
                created_at: new Date().toISOString()
            });

            await window.jsonbinBackend.updateData(data);

        } catch (error) {
            console.error('Error adding update to JSONBin:', error);
        }
    }

    async sendStatusUpdateToCustomer(order, action) {
        let message = '';
        const customerName = order.customer_name || order.customerName;
        const device = `${order.device_brand || order.deviceBrand} ${order.device_model || order.deviceModel}`;
        
        switch (action) {
            case 'diagnosis_complete':
                message = `🔍 *Diagnosis Complete - CampusFix UENR*

📦 Order: ${order.order_code}
👋 Hello ${customerName}!
✅ Diagnosis completed successfully
📱 Your ${device} is ready for repair
🔧 We'll begin the repair process now

⏰ Estimated Completion: ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

🔍 Track your order: 
https://campusfix-uenr.netlify.app/#tracker

💬 Questions? Reply to this message!

– Spice BlaQ 🛠️`;
                break;

            case 'repair_started':
                message = `🛠️ *Repair Started - CampusFix UENR*

📦 Order: ${order.order_code}
👋 Hello ${customerName}!
🔧 Repair work has begun on your ${device}
⏰ Making good progress
✅ We're working efficiently to fix your device

We'll update you when the repair is complete!

– Spice BlaQ 🛠️`;
                break;

            case 'repair_complete':
                message = `✅ *Repair Complete - CampusFix UENR*

📦 Order: ${order.order_code}
👋 Hello ${customerName}!
🎉 Great news! Your ${device} repair is complete!
🔍 Now undergoing quality check
📱 We're testing everything to ensure perfect function

Almost ready for pickup/delivery!

– Spice BlaQ 🛠️`;
                break;

            case 'ready_pickup':
                message = `🎉 *Ready for Pickup! - CampusFix UENR*

📦 Order: ${order.order_code}
👋 Hello ${customerName}!
✅ Your ${device} is ready for pickup!
🏠 Free delivery available to your hostel
📱 Device is fully repaired and tested

📍 *Pickup Options:*
1. Free hostel delivery (recommended)
2. Pick up from my workshop

💬 Reply to arrange delivery: 
https://wa.me/233246912468

💰 *Payment:* GH₵ [Amount will be confirmed]

– Spice BlaQ 🛠️`;
                break;
        }

        if (message) {
            const phone = order.customer_phone || order.customerPhone;
            const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    contactCustomer() {
        if (this.currentOrder) {
            const phone = this.currentOrder.customer_phone || this.currentOrder.customerPhone;
            const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
            window.open(url, '_blank');
        }
    }

    updateStats(orders = null) {
        if (!orders) return;

        const pending = orders.filter(o => o.status === 'Order Received').length;
        const inProgress = orders.filter(o => 
            o.status.includes('Progress') || 
            o.status === 'Diagnosis Complete' ||
            o.status === 'Repair Complete'
        ).length;
        const completed = orders.filter(o => o.status === 'Ready for Pickup').length;

        // Calculate today's revenue (simplified)
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => 
            new Date(o.updated_at || o.created_at).toDateString() === today && 
            o.status === 'Ready for Pickup'
        );
        const revenue = todayOrders.length * 150; // Average GH₵150 per repair

        if (document.getElementById('pendingCount')) {
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('progressCount').textContent = inProgress;
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('revenueCount').textContent = `GH₵ ${revenue}`;
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

    showNotification(message, type = 'info') {
        // Use sweetalert or similar for better notifications
        alert(`📢 ${message}`);
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
    if (window.adminDashboard) {
        window.adminDashboard.updateOrderStatus(action);
    }
}

function contactCustomer() {
    if (window.adminDashboard) {
        window.adminDashboard.contactCustomer();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});