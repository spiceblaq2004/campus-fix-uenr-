// ================================
// LOCAL STORAGE BACKEND - CAMPUSFIX UENR
// ================================

class LocalStorageBackend {
    constructor() {
        this.storageKey = 'campusfix_orders';
        this.adminPhone = '233246912468';
        this.yourName = 'Abdul Latif Bright (Spice BlaQ)';
        this.yourTitle = 'Founder & Repair Specialist';
        this.initializeData();
        console.log('✅ Local Storage Backend initialized!');
    }

    // Initialize or load data
    initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            console.log('📁 Creating new data structure...');
            const defaultData = this.getDefaultData();
            this.saveData(defaultData);
        } else {
            console.log('📁 Loading existing data...');
        }
    }

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            console.error('Error reading data:', error);
            return this.getDefaultData();
        }
    }

    // Save all data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('💾 Data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Default data structure
    getDefaultData() {
        return {
            orders: [],
            order_updates: [],
            order_steps: [],
            technicians: [
                {
                    id: "1",
                    name: "Abdul Latif Bright (Spice BlaQ)",
                    role: "Founder & Repair Specialist",
                    avatar_initials: "AB",
                    is_active: true
                }
            ],
            order_technicians: [],
            message_logs: [],
            settings: {
                order_counter: 2580
            }
        };
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // ================= ORDER MANAGEMENT =================

    async createOrder(orderData) {
        console.log('🆕 Creating new order...', orderData);
        
        const data = this.getData();
        
        // Generate order code
        data.settings.order_counter++;
        const orderCode = `CF-${new Date().getFullYear()}-${data.settings.order_counter.toString().padStart(4, '0')}`;
        const estimatedCompletion = this.calculateCompletionTime(orderData.urgency_level);

        const order = {
            id: this.generateId(),
            order_code: orderCode,
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            customer_email: orderData.customer_email || '',
            customer_hostel: orderData.customer_hostel || '',
            device_brand: orderData.device_brand,
            device_model: orderData.device_model,
            repair_type: orderData.repair_type,
            urgency_level: orderData.urgency_level,
            issue_description: orderData.issue_description,
            status: 'Order Received',
            progress: 10,
            estimated_completion: estimatedCompletion,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Add to orders
        data.orders.push(order);
        console.log('✅ Order created:', orderCode);

        // Create initial update
        await this.createOrderUpdate(order.id, {
            message: 'Order received and queued for diagnosis',
            icon: 'fas fa-clipboard-check',
            color: 'text-green-400',
            bg_color: 'bg-green-400/10'
        });

        // Create initial steps
        await this.createOrderSteps(order.id);

        // Assign technician (you!)
        await this.assignTechnician(order.id);

        // Save everything
        this.saveData(data);

        return order;
    }

    async getOrder(orderCode) {
        console.log('🔍 Searching for order:', orderCode);
        const data = this.getData();
        const order = data.orders.find(o => o.order_code === orderCode);
        
        if (!order) {
            console.log('❌ Order not found:', orderCode);
            return null;
        }

        console.log('✅ Order found:', orderCode);
        
        // Get related data
        const updates = data.order_updates.filter(update => update.order_id === order.id)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        const steps = data.order_steps.filter(step => step.order_id === order.id);

        const technicianAssignment = data.order_technicians.find(ot => ot.order_id === order.id);
        const technician = technicianAssignment ? data.technicians.find(t => t.id === technicianAssignment.technician_id) : null;

        // Format steps object
        const stepsObj = {};
        steps.forEach(step => {
            const stepKey = step.step_name.toLowerCase().replace(/ /g, '_');
            stepsObj[stepKey] = step.step_time;
        });

        return {
            ...order,
            updates,
            steps: stepsObj,
            technician,
            progress: order.progress || 10
        };
    }

    async createOrderUpdate(orderId, updateData) {
        const data = this.getData();
        
        const update = {
            id: this.generateId(),
            order_id: orderId,
            message: updateData.message,
            icon: updateData.icon,
            color: updateData.color,
            bg_color: updateData.bg_color,
            created_at: new Date().toISOString()
        };

        data.order_updates.push(update);
        this.saveData(data);
        return update;
    }

    async createOrderSteps(orderId) {
        const data = this.getData();
        
        const steps = [
            {
                id: this.generateId(),
                order_id: orderId,
                step_name: 'Order Received',
                step_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                is_completed: 'true',
                is_active: 'false'
            },
            {
                id: this.generateId(),
                order_id: orderId,
                step_name: 'Diagnosis',
                step_time: 'Pending',
                is_completed: 'false',
                is_active: 'true'
            },
            {
                id: this.generateId(),
                order_id: orderId,
                step_name: 'Repair in Progress',
                step_time: 'Pending',
                is_completed: 'false',
                is_active: 'false'
            },
            {
                id: this.generateId(),
                order_id: orderId,
                step_name: 'Quality Check',
                step_time: 'Pending',
                is_completed: 'false',
                is_active: 'false'
            },
            {
                id: this.generateId(),
                order_id: orderId,
                step_name: 'Ready for Pickup',
                step_time: 'Pending',
                is_completed: 'false',
                is_active: 'false'
            }
        ];

        data.order_steps.push(...steps);
        this.saveData(data);
    }

    async assignTechnician(orderId) {
        const data = this.getData();
        
        // Always assign to you (Spice BlaQ)
        data.order_technicians.push({
            id: this.generateId(),
            order_id: orderId,
            technician_id: "1",
            assigned_at: new Date().toISOString()
        });

        this.saveData(data);
        return data.technicians[0]; // Return your info
    }

    // ================= MESSAGING SYSTEM =================

    generateWhatsAppUrl(phone, message) {
        const formattedPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }

    async sendOrderConfirmation(order) {
        console.log('📱 Preparing WhatsApp messages...');
        
        // Customer message
        const customerMessage = this.generateCustomerConfirmation(order);
        const customerWhatsAppUrl = this.generateWhatsAppUrl(order.customer_phone, customerMessage);
        
        // Admin message (to you)
        const adminMessage = this.generateAdminNotification(order);
        const adminWhatsAppUrl = this.generateWhatsAppUrl(this.adminPhone, adminMessage);

        // Store message logs
        const data = this.getData();
        data.message_logs.push({
            id: this.generateId(),
            order_id: order.id,
            to: order.customer_phone,
            message: customerMessage,
            type: 'confirmation',
            sent_at: new Date().toISOString()
        });

        data.message_logs.push({
            id: this.generateId(),
            order_id: order.id,
            to: this.adminPhone,
            message: adminMessage,
            type: 'admin_notification',
            sent_at: new Date().toISOString()
        });

        this.saveData(data);

        console.log('✅ Messages prepared for order:', order.order_code);
        
        return {
            customerUrl: customerWhatsAppUrl,
            adminUrl: adminWhatsAppUrl
        };
    }

    generateCustomerConfirmation(order) {
        return `✅ *CampusFix UENR - Order Confirmation*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${order.customer_name}
📱 *Device:* ${order.device_brand} ${order.device_model}
🔧 *Repair:* ${order.repair_type}
⚡ *Urgency:* ${order.urgency_level}
🏠 *Hostel:* ${order.customer_hostel}

👨‍💼 *Repair Technician:* ${this.yourName}
🎯 *Specialist:* ${this.yourTitle}

📋 *Next Steps:*
1. I'll contact you personally within 30 minutes
2. Free hostel pickup will be arranged
3. Track progress: campusfix-uenr.com#tracker

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

🔍 *Track Your Order:*
Use Order Code: *${order.order_code}*

💬 *Direct Contact:* https://wa.me/${this.adminPhone}
📞 *Call Me:* 0246912468

*– Spice BlaQ 🛠️*`;
    }

    generateAdminNotification(order) {
        return `🆕 *NEW REPAIR ORDER - CampusFix*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${order.customer_name}
📞 *Phone:* ${order.customer_phone}
📱 *Device:* ${order.device_brand} ${order.device_model}
🔧 *Repair:* ${order.repair_type}
⚡ *Urgency:* ${order.urgency_level}
🏠 *Hostel:* ${order.customer_hostel}

📝 *Issue Description:*
${order.issue_description}

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB')}

🎯 *Assigned To:* YOU (${this.yourName})

💬 *Contact Customer:* https://wa.me/${order.customer_phone.replace(/\D/g, '')}

*– Get to work, Spice! 💪*`;
    }

    // ================= UTILITIES =================

    calculateCompletionTime(urgency) {
        const now = new Date();
        let completionTime;

        switch (urgency) {
            case 'Emergency':
                completionTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
                break;
            case 'Express':
                completionTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            default:
                completionTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        }

        return completionTime.toISOString();
    }

    // ================= DATA MANAGEMENT =================

    // Get all orders (for admin view)
    getAllOrders() {
        const data = this.getData();
        return data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Update order status
    async updateOrderStatus(orderId, newStatus, progress, message = '') {
        const data = this.getData();
        const order = data.orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = newStatus;
            order.progress = progress;
            order.updated_at = new Date().toISOString();

            // Create update record
            await this.createOrderUpdate(orderId, {
                message: message || `Status updated to: ${newStatus}`,
                icon: 'fas fa-sync-alt',
                color: 'text-blue-400',
                bg_color: 'bg-blue-400/10'
            });

            this.saveData(data);
            return order;
        }
        return null;
    }

    // Export data (backup)
    exportData() {
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campusfix-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data (restore)
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.saveData(data);
                alert('✅ Data imported successfully!');
                location.reload();
            } catch (error) {
                alert('❌ Error importing data. Invalid file format.');
            }
        };
        reader.readAsText(file);
    }

    // Clear all data (reset)
    clearAllData() {
        if (confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
            localStorage.removeItem(this.storageKey);
            this.initializeData();
            alert('✅ All data cleared!');
            location.reload();
        }
    }
}

// Initialize the backend
window.backend = new LocalStorageBackend();