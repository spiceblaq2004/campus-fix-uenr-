// ================================
// ENHANCED ORDER GENERATOR
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
                
                // You could update preview elements here
                console.log('Preview updated:', { deviceBrand, repairType, estimatedTime });
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
            
            // Show success
            this.showOrderSuccess(order);
            
            // Send notifications
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
                const order = await window.jsonbinBackend.createOrder(formData);
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

    showOrderSuccess(order) {
        // You would typically show a success modal or redirect
        this.showNotification(`Order ${order.order_code} created successfully!`, 'success');
        
        // Scroll to tracker and auto-fill
        setTimeout(() => {
            document.getElementById('orderIdInput').value = order.order_code;
            document.getElementById('tracker').scrollIntoView({ behavior: 'smooth' });
            
            if (window.liveTracker) {
                window.liveTracker.trackOrder();
            }
        }, 1000);
    }

    async sendNotifications(order) {
        // Send WhatsApp message to customer
        const customerMessage = this.generateCustomerMessage(order);
        const customerUrl = `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(customerMessage)}`;
        
        // Send WhatsApp message to admin
        const adminMessage = this.generateAdminMessage(order);
        const adminUrl = `https://wa.me/233246912468?text=${encodeURIComponent(adminMessage)}`;
        
        // Open WhatsApp for customer
        setTimeout(() => {
            window.open(customerUrl, '_blank');
        }, 1500);
        
        // You could automatically send to admin via backend
        console.log('Admin notification:', adminUrl);
    }

    generateCustomerMessage(order) {
        return `✅ *CampusFix UENR - Order Confirmation*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${order.customerName}
📱 *Device:* ${order.deviceBrand} ${order.deviceModel}
🔧 *Repair:* ${order.repairType}
⚡ *Urgency:* ${order.urgencyLevel}
🏠 *Hostel:* ${order.customerHostel}

👨‍💼 *Repair Technician:* Abdul Latif Bright (Spice BlaQ)

📋 *Next Steps:*
1. I'll contact you within 30 minutes
2. Free hostel pickup will be arranged
3. Track progress using your order code

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
})}

💬 *Direct Contact:* https://wa.me/233246912468
📞 *Call:* 0246912468

*– CampusFix UENR 🛠️*`;
    }

    generateAdminMessage(order) {
        return `🆕 *NEW REPAIR ORDER - CampusFix*

📦 *Order Code:* ${order.order_code}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📱 *Device:* ${order.deviceBrand} ${order.deviceModel}
🔧 *Repair:* ${order.repairType}
⚡ *Urgency:* ${order.urgencyLevel}
🏠 *Hostel:* ${order.customerHostel}

📝 *Issue Description:*
${order.issueDescription}

⏰ *Estimated Completion:* ${new Date(order.estimated_completion).toLocaleDateString('en-GB')}

💬 *Contact Customer:* https://wa.me/${order.customerPhone.replace(/\D/g, '')}

*– New order received!*`;
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
        if (window.campusFixApp && window.campusFixApp.showNotification) {
            window.campusFixApp.showNotification(message, type);
        } else {
            alert(message); // Fallback
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