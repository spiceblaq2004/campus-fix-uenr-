// ================================
// ENHANCED ORDER GENERATOR - FIXED VERSION WITH JSONBIN
// ================================

class OrderGenerator {
    constructor() {
        this.orderCounter = this.loadOrderCounter();
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

        // Real-time form validation
        this.setupRealTimeValidation();
        
        // Preview updates
        this.setupPreviewUpdates();
    }

    setupFormValidation() {
        // Add custom validation styles
        this.injectValidationStyles();
    }

    injectValidationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .form-group.error input,
            .form-group.error select,
            .form-group.error textarea {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }
            
            .form-group.success input,
            .form-group.success select,
            .form-group.success textarea {
                border-color: #10b981 !important;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
            }
            
            .validation-message {
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .validation-error {
                color: #ef4444;
            }
            
            .validation-success {
                color: #10b981;
            }

            .manual-send-buttons {
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                text-align: center;
            }

            .manual-send-buttons p {
                margin-bottom: 15px;
                color: var(--gray-300);
            }

            .send-buttons-container {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }

            .success-content {
                background: var(--gray-800);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                border: 1px solid rgba(99, 102, 241, 0.3);
                box-shadow: var(--shadow-xl);
            }

            .success-icon {
                font-size: 3rem;
                color: var(--success);
                margin-bottom: 15px;
            }
        `;
        document.head.appendChild(style);
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('#orderForm input, #orderForm select, #orderForm textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch (field.id) {
            case 'customerName':
                if (!value) {
                    isValid = false;
                    message = 'Name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters';
                }
                break;
                
            case 'customerPhone':
                if (!value) {
                    isValid = false;
                    message = 'Phone number is required';
                } else if (!/^(\+233|0)[235]\d{8}$/.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    message = 'Please enter a valid Ghanaian phone number';
                }
                break;
                
            case 'deviceModel':
                if (!value) {
                    isValid = false;
                    message = 'Device model is required';
                }
                break;
                
            case 'issueDescription':
                if (!value) {
                    isValid = false;
                    message = 'Please describe the issue';
                } else if (value.length < 10) {
                    isValid = false;
                    message = 'Please provide more details (at least 10 characters)';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, message);
        } else {
            this.showFieldSuccess(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldStatus(field);
        field.parentNode.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-message validation-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        field.parentNode.appendChild(errorDiv);
        
        field.classList.add('error-shake');
        setTimeout(() => {
            field.classList.remove('error-shake');
        }, 500);
    }

    showFieldSuccess(field) {
        this.clearFieldStatus(field);
        field.parentNode.classList.add('success');
    }

    clearFieldError(field) {
        this.clearFieldStatus(field);
    }

    clearFieldStatus(field) {
        field.parentNode.classList.remove('error', 'success');
        const message = field.parentNode.querySelector('.validation-message');
        if (message) {
            message.remove();
        }
    }

    setupPreviewUpdates() {
        const form = document.getElementById('orderForm');
        if (!form) return;

        const updatePreview = this.debounce(() => {
            const deviceBrand = document.getElementById('deviceBrand').value;
            const repairType = document.getElementById('repairTypeGen').value;
            
            if (deviceBrand && repairType) {
                // Update preview with estimated time based on repair type
                let estimatedTime = '2-4 hours';
                if (repairType === 'Screen Replacement') {
                    estimatedTime = '3-5 hours';
                } else if (repairType === 'Battery Replacement') {
                    estimatedTime = '1-2 hours';
                } else if (repairType === 'Charging Port') {
                    estimatedTime = '2-3 hours';
                }
                
                // Update preview elements
                const previewElement = document.querySelector('.order-code-preview');
                if (previewElement) {
                    previewElement.textContent = `CF-${new Date().getFullYear()}-XXXX`;
                }
            }
        }, 300);

        // Listen to form changes
        form.addEventListener('input', updatePreview);
        form.addEventListener('change', updatePreview);
    }

    async handleOrderSubmission() {
        if (!this.validateAllFields()) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        const formData = this.getFormData();
        
        try {
            // Show loading state
            this.showLoading();
            
            // Generate order
            const order = await this.createOrder(formData);
            
            // Show success with WhatsApp sending
            await this.showOrderSuccess(order);
            
            // Send notifications immediately
            await this.sendNotifications(order);
            
        } catch (error) {
            console.error('Order creation failed:', error);
            this.showNotification('Failed to create order. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    validateAllFields() {
        const requiredFields = document.querySelectorAll('#orderForm [required]');
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                allValid = false;
            }
        });
        
        return allValid;
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

    async createOrder(formData) {
        // Try JSONBin backend first
        if (window.jsonbinBackend) {
            try {
                // Convert form data to JSONBin format
                const jsonBinData = {
                    customer_name: formData.customerName,
                    customer_phone: formData.customerPhone,
                    customer_email: formData.customerEmail,
                    customer_hostel: formData.customerHostel,
                    device_brand: formData.deviceBrand,
                    device_model: formData.deviceModel,
                    repair_type: formData.repairType,
                    urgency_level: formData.urgencyLevel,
                    issue_description: formData.issueDescription
                };
                
                const order = await window.jsonbinBackend.createOrder(jsonBinData);
                this.saveOrderToLocalStorage(order);
                return order;
            } catch (error) {
                console.warn('JSONBin backend failed, using local storage:', error);
            }
        }
        
        // Fallback to local storage
        return this.createLocalOrder(formData);
    }

    createLocalOrder(formData) {
        this.orderCounter++;
        this.saveOrderCounter();
        
        const orderCode = `CF-${new Date().getFullYear()}-${this.orderCounter.toString().padStart(4, '0')}`;
        
        const order = {
            id: Date.now().toString(),
            order_code: orderCode,
            ...formData,
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
        
        this.saveOrderToLocalStorage(order);
        return order;
    }

    saveOrderToLocalStorage(order) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.order_code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
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

    async showOrderSuccess(order) {
        // Show success modal with order details
        this.showSuccessModal(order);
    }

    showSuccessModal(order) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Order Created Successfully! 🎉</h3>
                <p><strong>Order Code:</strong> ${order.order_code}</p>
                <p>We're now opening WhatsApp to send your order confirmation...</p>
                <div class="manual-send-buttons">
                    <p>If WhatsApp doesn't open automatically, click below:</p>
                    <div class="send-buttons-container">
                        <button class="btn btn-primary" onclick="window.orderGenerator.sendCustomerMessage('${order.order_code}')">
                            <i class="fab fa-whatsapp"></i> Send to Customer
                        </button>
                        <button class="btn btn-secondary" onclick="window.orderGenerator.sendAdminMessage('${order.order_code}')">
                            <i class="fab fa-whatsapp"></i> Send to Admin
                        </button>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-outline" onclick="window.orderGenerator.closeSuccessModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto-close after 30 seconds
        setTimeout(() => {
            this.closeSuccessModal();
        }, 30000);
    }

    closeSuccessModal() {
        const modal = document.querySelector('.success-modal');
        if (modal) {
            modal.remove();
        }
    }

    async sendNotifications(order) {
        try {
            // Generate messages
            const customerMessage = this.generateCustomerMessage(order);
            const adminMessage = this.generateAdminMessage(order);
            
            // Create WhatsApp URLs
            const customerUrl = `https://wa.me/${order.customerPhone ? order.customerPhone.replace(/\D/g, '') : order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(customerMessage)}`;
            const adminUrl = `https://wa.me/233246912468?text=${encodeURIComponent(adminMessage)}`;
            
            // Send customer message immediately
            console.log('Opening customer WhatsApp...');
            window.open(customerUrl, '_blank');
            
            // Send admin message after short delay
            setTimeout(() => {
                console.log('Opening admin WhatsApp...');
                window.open(adminUrl, '_blank');
            }, 1000);

            // Store message logs
            this.saveMessageLogs(order, customerMessage, adminMessage);

        } catch (error) {
            console.error('Error sending notifications:', error);
            this.showNotification('Messages failed to send automatically. Please use the manual buttons.', 'error');
        }
    }

    // Manual send methods for the buttons
    async sendCustomerMessage(orderCode) {
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
            const message = this.generateCustomerMessage(order);
            const phone = order.customerPhone || order.customer_phone;
            const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    async sendAdminMessage(orderCode) {
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
            const message = this.generateAdminMessage(order);
            const url = `https://wa.me/233246912468?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    saveMessageLogs(order, customerMessage, adminMessage) {
        const messageLogs = JSON.parse(localStorage.getItem('campusFixMessageLogs') || '[]');
        
        messageLogs.push({
            orderCode: order.order_code,
            customerMessage: customerMessage,
            adminMessage: adminMessage,
            sentAt: new Date().toISOString(),
            customerPhone: order.customerPhone || order.customer_phone
        });
        
        localStorage.setItem('campusFixMessageLogs', JSON.stringify(messageLogs));
    }

    generateCustomerMessage(order) {
        const customerName = order.customerName || order.customer_name;
        const deviceBrand = order.deviceBrand || order.device_brand;
        const deviceModel = order.deviceModel || order.device_model;
        const repairType = order.repairType || order.repair_type;
        const urgencyLevel = order.urgencyLevel || order.urgency_level;
        const customerHostel = order.customerHostel || order.customer_hostel;

        return `✅ *CampusFix UENR - Order Confirmation*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${customerName}
📱 *Device:* ${deviceBrand} ${deviceModel}
🔧 *Repair:* ${repairType}
⚡ *Urgency:* ${urgencyLevel}
🏠 *Hostel:* ${customerHostel}

👨‍💼 *Repair Technician:* Abdul Latif Bright (Spice BlaQ)

📋 *Next Steps:*
1. I'll contact you within 30 minutes
2. Free hostel pickup will be arranged
3. Track progress using your order code: ${order.order_code}

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

🔍 *Track Your Order:*
https://campusfix-uenr.netlify.app/#tracker

💬 *Direct Contact:* https://wa.me/233246912468
📞 *Call:* 0246912468

*– CampusFix UENR 🛠️*`;
    }

    generateAdminMessage(order) {
        const customerName = order.customerName || order.customer_name;
        const deviceBrand = order.deviceBrand || order.device_brand;
        const deviceModel = order.deviceModel || order.device_model;
        const repairType = order.repairType || order.repair_type;
        const urgencyLevel = order.urgencyLevel || order.urgency_level;
        const customerHostel = order.customerHostel || order.customer_hostel;
        const customerPhone = order.customerPhone || order.customer_phone;
        const issueDescription = order.issueDescription || order.issue_description;

        return `🆕 *NEW REPAIR ORDER - CampusFix*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📱 *Device:* ${deviceBrand} ${deviceModel}
🔧 *Repair:* ${repairType}
⚡ *Urgency:* ${urgencyLevel}
🏠 *Hostel:* ${customerHostel}

📝 *Issue Description:*
${issueDescription}

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB')}

🎯 *Action Required:*
• Contact customer within 30 minutes
• Schedule hostel pickup
• Begin diagnosis process

💬 *Contact Customer:* https://wa.me/${customerPhone.replace(/\D/g, '')}

*– New order received! Time to work your magic Spice! 💪*`;
    }

    showLoading() {
        const submitBtn = document.querySelector('#orderForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
        }
    }

    hideLoading() {
        const submitBtn = document.querySelector('#orderForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate Order Code';
        }
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system from main.js
        if (window.campusFixApp && window.campusFixApp.showNotification) {
            window.campusFixApp.showNotification(message, type);
        } else {
            // Fallback
            alert(message);
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    loadOrderCounter() {
        return parseInt(localStorage.getItem('campusFixOrderCounter')) || 2580;
    }

    saveOrderCounter() {
        localStorage.setItem('campusFixOrderCounter', this.orderCounter);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderGenerator();
});