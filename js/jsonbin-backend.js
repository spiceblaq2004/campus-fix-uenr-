// ================================
// JSONBIN BACKEND - COMPLETELY FREE
// ================================

// 🔧 CONFIGURATION
const JSONBIN_BIN_ID = '69249d53ae596e708f6e3f11'; // From Step 3
const JSONBIN_API_KEY = '$2a$10$o7tsthfWwEV7NcxhtUKFJuKGGFLsIMNFkYvLrnTWijDLRLgtnryG2'; // From Step 3

class JsonBinBackend {
    constructor() {
        this.binId = JSONBIN_BIN_ID;
        this.apiKey = JSONBIN_API_KEY;
        this.baseURL = 'https://api.jsonbin.io/v3/b';
        this.adminPhone = '233246912468';
        this.yourName = 'Abdul Latif Bright (Spice BlaQ)';
        this.yourTitle = 'Founder & Repair Specialist';
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Get all data
    async getData() {
        try {
            const response = await fetch(`${this.baseURL}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }
            
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('Error fetching data:', error);
            // Return default structure if fetch fails
            return this.getDefaultData();
        }
    }

    // Update all data
    async updateData(newData) {
        try {
            const response = await fetch(`${this.baseURL}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(newData)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to update data: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }

    // Get default data structure
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

    // Order Management Methods
    async createOrder(orderData) {
        try {
            const data = await this.getData();
            
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

            // Create initial update
            data.order_updates.push({
                id: this.generateId(),
                order_id: order.id,
                message: 'Order received and queued for diagnosis',
                icon: 'fas fa-clipboard-check',
                color: 'text-green-400',
                bg_color: 'bg-green-400/10',
                created_at: new Date().toISOString()
            });

            // Create initial steps
            const steps = [
                {
                    step_name: 'Order Received',
                    step_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    is_completed: true,
                    is_active: false
                },
                {
                    step_name: 'Diagnosis',
                    step_time: 'Pending',
                    is_completed: false,
                    is_active: true
                },
                {
                    step_name: 'Repair in Progress',
                    step_time: 'Pending',
                    is_completed: false,
                    is_active: false
                },
                {
                    step_name: 'Quality Check',
                    step_time: 'Pending',
                    is_completed: false,
                    is_active: false
                },
                {
                    step_name: 'Ready for Pickup',
                    step_time: 'Pending',
                    is_completed: false,
                    is_active: false
                }
            ];

            steps.forEach(step => {
                data.order_steps.push({
                    id: this.generateId(),
                    order_id: order.id,
                    ...step
                });
            });

            // Assign technician (you!)
            data.order_technicians.push({
                id: this.generateId(),
                order_id: order.id,
                technician_id: "1",
                assigned_at: new Date().toISOString()
            });

            // Save everything
            await this.updateData(data);

            return order;

        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async getOrder(orderCode) {
        try {
            const data = await this.getData();
            const order = data.orders.find(o => o.order_code === orderCode);
            
            if (!order) return null;

            // Get related data
            const updates = data.order_updates.filter(update => update.order_id === order.id)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            const steps = data.order_steps.filter(step => step.order_id === order.id)
                .sort((a, b) => a.id - b.id);

            const technicianAssignment = data.order_technicians.find(ot => ot.order_id === order.id);
            const technician = technicianAssignment ? data.technicians.find(t => t.id === technicianAssignment.technician_id) : null;

            // Format steps object for frontend
            const stepsObj = {};
            steps.forEach(step => {
                const stepKey = step.step_name.toLowerCase().replace(/ /g, '_');
                stepsObj[stepKey] = step.step_time;
            });

            return {
                ...order,
                updates: updates.map(update => ({
                    icon: update.icon,
                    color: update.color,
                    bgColor: update.bg_color,
                    message: update.message,
                    time: new Date(update.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                })),
                steps: stepsObj,
                technician,
                progress: order.progress || 10
            };
        } catch (error) {
            console.error('Error getting order:', error);
            return null;
        }
    }

    // Admin: Update order status
    async updateOrderStatus(orderCode, updates) {
        try {
            const data = await this.getData();
            const orderIndex = data.orders.findIndex(o => o.order_code === orderCode);
            
            if (orderIndex !== -1) {
                // Update the order
                data.orders[orderIndex] = {
                    ...data.orders[orderIndex],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                
                await this.updateData(data);
                return data.orders[orderIndex];
            }
            return null;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Admin: Add order update
    async addOrderUpdate(orderCode, updateData) {
        try {
            const data = await this.getData();
            const order = data.orders.find(o => o.order_code === orderCode);
            
            if (order) {
                data.order_updates.push({
                    id: this.generateId(),
                    order_id: order.id,
                    message: updateData.message,
                    icon: updateData.icon,
                    color: updateData.color,
                    bg_color: updateData.bg_color,
                    created_at: new Date().toISOString()
                });

                await this.updateData(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding order update:', error);
            throw error;
        }
    }

    // Admin: Update order steps
    async updateOrderSteps(orderCode, stepsData) {
        try {
            const data = await this.getData();
            const order = data.orders.find(o => o.order_code === orderCode);
            
            if (order) {
                // Remove existing steps for this order
                data.order_steps = data.order_steps.filter(step => step.order_id !== order.id);
                
                // Add new steps
                stepsData.forEach(step => {
                    data.order_steps.push({
                        id: this.generateId(),
                        order_id: order.id,
                        ...step
                    });
                });

                await this.updateData(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating order steps:', error);
            throw error;
        }
    }

    // Admin: Get all orders with filters
    async getOrders(filter = {}) {
        try {
            const data = await this.getData();
            let orders = data.orders || [];

            // Apply filters
            if (filter.status) {
                orders = orders.filter(order => order.status === filter.status);
            }

            if (filter.search) {
                const searchTerm = filter.search.toLowerCase();
                orders = orders.filter(order => 
                    order.order_code.toLowerCase().includes(searchTerm) ||
                    order.customer_name.toLowerCase().includes(searchTerm) ||
                    order.device_brand.toLowerCase().includes(searchTerm) ||
                    order.repair_type.toLowerCase().includes(searchTerm)
                );
            }

            return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }

    // WhatsApp messaging
    generateWhatsAppUrl(phone, message) {
        const formattedPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }

    async sendOrderConfirmation(order) {
        // Customer message
        const customerMessage = this.generateCustomerConfirmation(order);
        const customerWhatsAppUrl = this.generateWhatsAppUrl(order.customer_phone, customerMessage);
        
        // Admin message (to you)
        const adminMessage = this.generateAdminNotification(order);
        const adminWhatsAppUrl = this.generateWhatsAppUrl(this.adminPhone, adminMessage);

        // Store message logs
        const data = await this.getData();
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

        await this.updateData(data);

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
3. Track progress at our website

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

🔍 *Track Your Order Using Your Order Code:* ${order.order_code}

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

    // Utility method to get dashboard statistics
    async getDashboardStats() {
        try {
            const data = await this.getData();
            const orders = data.orders || [];
            
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
                new Date(o.updated_at).toDateString() === today && 
                o.status === 'Ready for Pickup'
            );
            const revenue = todayOrders.length * 150; // Average GH₵150 per repair

            return {
                pending,
                inProgress,
                completed,
                revenue,
                totalOrders: orders.length
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return {
                pending: 0,
                inProgress: 0,
                completed: 0,
                revenue: 0,
                totalOrders: 0
            };
        }
    }
}

// Initialize the backend
window.jsonbinBackend = new JsonBinBackend();
console.log('✅ JSONBin Backend initialized with admin features!');