// ================================
// ENHANCED ORDER GENERATOR - FIXED VERSION
// ================================

class OrderGenerator {
    constructor() {
        this.orderCounter = this.loadOrderCounter();
        this.currentOrder = null;
        this.initializeEventListeners();
        this.setupFormValidation();
    }

    initializeEventListeners() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmission();
            });
        }
        this.setupRealTimeValidation();
        this.setupPreviewUpdates();
    }

    setupFormValidation() {
        const style = document.createElement('style');
        style.textContent = `
            .form-group.error input { border-color: #ef4444 !important; }
            .success-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; }
            .success-content { background: var(--gray-800); border-radius: 20px; padding: 30px; max-width: 500px; width: 90%; text-align: center; }
        `;
        document.head.appendChild(style);
    }

    async handleOrderSubmission() {
        if (!this.validateAllFields()) {
            alert('Please fix the form errors');
            return;
        }

        const formData = this.getFormData();
        
        try {
            this.showLoading();
            
            // Create order - SIMPLIFIED: Use localStorage only for now
            const order = this.createLocalOrder(formData);
            this.currentOrder = order;
            
            // Show success modal
            this.showSuccessModal(order);
            
            // Send WhatsApp messages
            await this.sendWhatsAppMessages(order);
            
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to create order. Please try again.');
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

    createLocalOrder(formData) {
        this.orderCounter++;
        this.saveOrderCounter();
        
        const orderCode = `CF-${new Date().getFullYear()}-${this.orderCounter.toString().padStart(4, '0')}`;
        
        const order = {
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
            estimated_completion: this.calculateCompletionTime(formData.urgencyLevel),
            steps: {
                received: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                diagnosis: 'Pending',
                repair: 'Pending',
                quality: 'Pending',
                ready: 'Pending'
            },
            updates: [
                {
                    icon: 'fas fa-clipboard-check',
                    color: 'text-green-400',
                    bgColor: 'bg-green-400/10',
                    message: 'Order received and queued for diagnosis',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            ],
            technician: {
                name: 'Abdul Latif Bright (Spice BlaQ)',
                role: 'Founder & Repair Specialist'
            }
        };
        
        this.saveOrderToStorage(order);
        return order;
    }

    saveOrderToStorage(order) {
        // Save to localStorage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.order_code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
        
        // Try to save to JSONBin if available
        if (window.jsonbinBackend) {
            setTimeout(async () => {
                try {
                    await window.jsonbinBackend.createOrder(order);
                    console.log('Order saved to JSONBin');
                } catch (error) {
                    console.warn('JSONBin save failed:', error);
                }
            }, 1000);
        }
    }

    showSuccessModal(order) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-content">
                <div style="color: #10b981; font-size: 3rem; margin-bottom: 15px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Order Created Successfully! 🎉</h3>
                <p><strong>Order Code:</strong> ${order.order_code}</p>
                <p>Check your WhatsApp for confirmation messages...</p>
                <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin-bottom: 15px; color: var(--gray-300);">If WhatsApp didn't open automatically:</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" id="sendToCustomerBtn">
                            <i class="fab fa-whatsapp"></i> Send to Customer
                        </button>
                        <button class="btn btn-secondary" id="sendToAdminBtn">
                            <i class="fab fa-whatsapp"></i> Send to Admin
                        </button>
                    </div>
                </div>
                <button class="btn btn-outline" id="closeModalBtn">
                    Close & Track Order
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('sendToCustomerBtn').addEventListener('click', () => {
            this.sendCustomerMessage(order.order_code);
        });
        
        document.getElementById('sendToAdminBtn').addEventListener('click', () => {
            this.sendAdminMessage(order.order_code);
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeSuccessModal();
        });
    }

    closeSuccessModal() {
        const modal = document.querySelector('.success-modal');
        if (modal) modal.remove();
        
        // Auto-fill tracker and scroll to it
        if (this.currentOrder) {
            const orderIdInput = document.getElementById('orderIdInput');
            if (orderIdInput) {
                orderIdInput.value = this.currentOrder.order_code;
            }
            document.getElementById('tracker')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async sendWhatsAppMessages(order) {
        try {
            const customerMessage = this.generateCustomerMessage(order);
            const adminMessage = this.generateAdminMessage(order);
            
            const customerUrl = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(customerMessage)}`;
            const adminUrl = `https://wa.me/233246912468?text=${encodeURIComponent(adminMessage)}`;
            
            // Open customer WhatsApp
            window.open(customerUrl, '_blank');
            
            // Open admin WhatsApp after delay
            setTimeout(() => {
                window.open(adminUrl, '_blank');
            }, 1000);
            
        } catch (error) {
            console.error('WhatsApp error:', error);
        }
    }

    async sendCustomerMessage(orderCode) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = savedOrders[orderCode];
        
        if (order) {
            const message = this.generateCustomerMessage(order);
            const url = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            alert('Order not found!');
        }
    }

    async sendAdminMessage(orderCode) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const order = savedOrders[orderCode];
        
        if (order) {
            const message = this.generateAdminMessage(order);
            const url = `https://wa.me/233246912468?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            alert('Order not found!');
        }
    }

    generateCustomerMessage(order) {
        return `✅ *CampusFix UENR - Order Confirmation*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${order.customer_name}
📱 *Device:* ${order.device_brand} ${order.device_model}
🔧 *Repair:* ${order.repair_type}
⚡ *Urgency:* ${order.urgency_level}
🏠 *Hostel:* ${order.customer_hostel}

👨‍💼 *Repair Technician:* Abdul Latif Bright (Spice BlaQ)

📋 *Next Steps:*
1. I'll contact you within 30 minutes
2. Free hostel pickup will be arranged
3. Track progress using code: ${order.order_code}

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

💬 *Direct Contact:* https://wa.me/233246912468
📞 *Call:* 0246912468

– CampusFix UENR 🛠️`;
    }

    generateAdminMessage(order) {
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

💬 *Contact Customer:* https://wa.me/${order.customer_phone.replace(/\D/g, '')}

– New order received! Time to work your magic Spice! 💪`;
    }

    // Utility methods
    showLoading() {
        const btn = document.querySelector('#orderForm button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
        }
    }

    hideLoading() {
        const btn = document.querySelector('#orderForm button[type="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Generate Order Code';
        }
    }

    validateAllFields() {
        const required = document.querySelectorAll('#orderForm [required]');
        let valid = true;
        required.forEach(field => {
            if (!field.value.trim()) valid = false;
        });
        return valid;
    }

    setupRealTimeValidation() {
        // Simplified validation
        const inputs = document.querySelectorAll('#orderForm input, #orderForm select, #orderForm textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '';
                }
            });
        });
    }

    setupPreviewUpdates() {
        // Basic preview updates
    }

    calculateCompletionTime(urgency) {
        const now = new Date();
        switch (urgency) {
            case 'Emergency': return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
            case 'Express': return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            default: return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    loadOrderCounter() {
        return parseInt(localStorage.getItem('campusFixOrderCounter')) || 2580;
    }

    saveOrderCounter() {
        localStorage.setItem('campusFixOrderCounter', this.orderCounter);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderGenerator();
});