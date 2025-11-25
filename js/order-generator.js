// ================================
// ORDER GENERATOR - COMPATIBLE VERSION
// ================================

class OrderGenerator {
    constructor() {
        this.orderCounter = this.loadOrderCounter();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmission();
            });
        }
    }

    async handleOrderSubmission() {
        const formData = this.getFormData();
        
        // Basic validation
        if (!formData.customerName || !formData.customerPhone) {
            alert('Please fill in required fields');
            return;
        }

        try {
            this.showLoading();
            
            // Create order
            const order = this.createOrder(formData);
            
            // Save to storage
            this.saveOrder(order);
            
            // Show success
            this.showSuccess(order);
            
            // Send WhatsApp
            this.sendWhatsAppMessages(order);
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating order');
        } finally {
            this.hideLoading();
        }
    }

    getFormData() {
        return {
            customerName: document.getElementById('customerName').value.trim(),
            customerPhone: document.getElementById('customerPhone').value.trim(),
            customerEmail: document.getElementById('customerEmail').value.trim(),
            customerHostel: document.getElementById('customerHostel').value.trim(),
            deviceBrand: document.getElementById('deviceBrand').value,
            deviceModel: document.getElementById('deviceModel').value.trim(),
            repairType: document.getElementById('repairTypeGen').value,
            urgencyLevel: document.getElementById('urgencyLevel').value,
            issueDescription: document.getElementById('issueDescription').value.trim()
        };
    }

    createOrder(formData) {
        this.orderCounter++;
        localStorage.setItem('campusFixOrderCounter', this.orderCounter);
        
        const orderCode = `CF-${new Date().getFullYear()}-${this.orderCounter.toString().padStart(4, '0')}`;
        
        return {
            // STANDARDIZED PROPERTY NAMES - Admin dashboard expects these
            id: Date.now().toString(),
            order_code: orderCode,
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            customer_email: formData.customerEmail,
            customer_hostel: formData.customerHostel,
            device_brand: formData.deviceBrand,
            device_model: formData.deviceModel,
            repair_type: formData.repairType,
            urgency_level: formData.urgencyLevel,
            issue_description: formData.issueDescription,
            status: 'Order Received',
            progress: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            estimated_completion: this.getCompletionTime(formData.urgencyLevel),
            steps: {
                received: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                diagnosis: 'Pending',
                repair: 'Pending',
                quality: 'Pending',
                ready: 'Pending'
            },
            updates: [
                {
                    message: 'Order received and queued for diagnosis',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            ],
            technician: {
                name: 'Abdul Latif Bright (Spice BlaQ)',
                role: 'Founder & Repair Specialist'
            }
        };
    }

    saveOrder(order) {
        // Get existing orders
        const existingOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        
        // Add new order
        existingOrders[order.order_code] = order;
        
        // Save back to localStorage
        localStorage.setItem('campusFixOrders', JSON.stringify(existingOrders));
        
        // DEBUG: Verify save
        console.log('💾 ORDER SAVED:', {
            code: order.order_code,
            allOrders: Object.keys(existingOrders),
            storageKey: 'campusFixOrders'
        });
    }

    showSuccess(order) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
            justify-content: center; z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: #1e293b; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; width: 90%;">
                <div style="color: #10b981; font-size: 3rem; margin-bottom: 15px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="margin-bottom: 15px;">Order Created! 🎉</h3>
                <p><strong>Order Code:</strong> ${order.order_code}</p>
                <p style="margin: 20px 0; color: #94a3b8;">Check your WhatsApp for confirmation...</p>
                
                <div style="background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <button onclick="window.orderGenerator.sendCustomerMessage('${order.order_code}')" 
                            style="background: #6366f1; color: white; border: none; padding: 12px 20px; border-radius: 8px; margin: 5px; cursor: pointer;">
                        <i class="fab fa-whatsapp"></i> Send to Customer
                    </button>
                    <button onclick="window.orderGenerator.sendAdminMessage('${order.order_code}')" 
                            style="background: #475569; color: white; border: none; padding: 12px 20px; border-radius: 8px; margin: 5px; cursor: pointer;">
                        <i class="fab fa-whatsapp"></i> Send to Admin
                    </button>
                </div>
                
                <button onclick="this.closest('.success-modal').remove(); document.getElementById('orderIdInput').value='${order.order_code}'; document.getElementById('tracker').scrollIntoView();" 
                        style="background: transparent; color: #6366f1; border: 2px solid #6366f1; padding: 10px 20px; border-radius: 8px; margin-top: 10px; cursor: pointer;">
                    Close & Track Order
                </button>
            </div>
        `;
        
        modal.className = 'success-modal';
        document.body.appendChild(modal);
    }

    sendWhatsAppMessages(order) {
        const customerMsg = `✅ *CampusFix UENR - Order Confirmation*

📦 Order: ${order.order_code}
👤 Customer: ${order.customer_name}
📱 Device: ${order.device_brand} ${order.device_model}
🔧 Repair: ${order.repair_type}

I'll contact you within 30 minutes!`;

        const adminMsg = `🆕 *NEW ORDER - ${order.order_code}*
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Device: ${order.device_brand} ${order.device_model}`;

        // Open WhatsApp
        window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(customerMsg)}`, '_blank');
        setTimeout(() => {
            window.open(`https://wa.me/233246912468?text=${encodeURIComponent(adminMsg)}`, '_blank');
        }, 1000);
    }

    sendCustomerMessage(orderCode) {
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        if (order) {
            const msg = `Order ${orderCode} confirmation - CampusFix UENR`;
            window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
        }
    }

    sendAdminMessage(orderCode) {
        const orders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = orders[orderCode];
        if (order) {
            const msg = `New order: ${orderCode} - ${order.customer_name} - ${order.device_brand} ${order.device_model}`;
            window.open(`https://wa.me/233246912468?text=${encodeURIComponent(msg)}`, '_blank');
        }
    }

    getCompletionTime(urgency) {
        const now = new Date();
        const hours = urgency === 'Emergency' ? 6 : urgency === 'Express' ? 24 : 72;
        return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    }

    showLoading() {
        const btn = document.querySelector('#orderForm button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        }
    }

    hideLoading() {
        const btn = document.querySelector('#orderForm button[type="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Generate Order Code';
        }
    }

    loadOrderCounter() {
        return parseInt(localStorage.getItem('campusFixOrderCounter')) || 2580;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderGenerator();
});