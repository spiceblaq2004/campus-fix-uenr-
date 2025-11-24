// ================================
// ORDER CODE GENERATION SYSTEM (ENHANCED)
// ================================

class OrderCodeGenerator {
    constructor() {
        this.orderCounter = this.loadOrderCounter();
        this.generatedOrders = this.loadSavedOrders();
        this.initializeEventListeners();
        this.initializeRealTimeValidation();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateOrderCode();
        });

        // Track this order button
        document.getElementById('trackThisOrder').addEventListener('click', () => {
            this.trackGeneratedOrder();
        });

        // Print order details
        document.getElementById('printOrderCode').addEventListener('click', () => {
            this.printOrderDetails();
        });

        // New order button
        document.getElementById('newOrder').addEventListener('click', () => {
            this.resetForm();
        });

        // Share buttons
        document.getElementById('shareWhatsApp').addEventListener('click', this.shareViaWhatsApp);
        document.getElementById('copyCode').addEventListener('click', this.copyOrderCode);
        document.getElementById('saveImage').addEventListener('click', this.saveAsImage);
    }

    initializeRealTimeValidation() {
        const inputs = document.querySelectorAll('#orderForm input, #orderForm select, #orderForm textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name') || field.id;
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'customerName':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;
                
            case 'customerPhone':
                if (!value) {
                    errorMessage = 'Phone number is required';
                    isValid = false;
                } else if (!/^(\+233|0)[235]\d{8}$/.test(value.replace(/\s/g, ''))) {
                    errorMessage = 'Please enter a valid Ghanaian phone number';
                    isValid = false;
                }
                break;
                
            case 'deviceModel':
                if (!value) {
                    errorMessage = 'Device model is required';
                    isValid = false;
                }
                break;
                
            case 'issueDescription':
                if (!value) {
                    errorMessage = 'Please describe the issue';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Please provide more details (at least 10 characters)';
                    isValid = false;
                }
                break;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error-shake', 'border-red-400');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-400 text-sm mt-1';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error-shake', 'border-red-400');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async generateOrderCode() {
        // Show loading state
        this.showLoading();
        
        try {
            // Get form data
            const formData = this.getFormData();
            
            // Validate all fields
            if (!this.validateAllFields()) {
                this.hideLoading();
                return;
            }

            // Use JSONBin backend for order creation
            const order = await window.jsonbinBackend.createOrder(formData);
            
            // Also save to localStorage for immediate tracking
            this.saveOrderToLocalStorage(order);
            
            // Send WhatsApp confirmations
            const whatsappUrls = await window.jsonbinBackend.sendOrderConfirmation(order);
            
            // Display order code
            this.displayOrderCode(order);
            
            // Open WhatsApp for customer
            setTimeout(() => {
                window.open(whatsappUrls.customerUrl, '_blank');
            }, 1000);
            
        } catch (error) {
            console.error('Error creating order:', error);
            alert('There was an issue creating your order. Please try again or contact us directly.');
        } finally {
            this.hideLoading();
        }
    }

    validateAllFields() {
        const fields = document.querySelectorAll('#orderForm input[required], #orderForm select[required], #orderForm textarea[required]');
        let allValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                allValid = false;
            }
        });
        
        return allValid;
    }

    showLoading() {
        const submitBtn = document.querySelector('#orderForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';
        
        document.body.classList.add('loading');
    }

    hideLoading() {
        const submitBtn = document.querySelector('#orderForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate Order Code';
        
        document.body.classList.remove('loading');
    }

    getFormData() {
        return {
            customer_name: document.getElementById('customerName').value.trim(),
            customer_phone: document.getElementById('customerPhone').value.trim(),
            customer_email: document.getElementById('customerEmail').value.trim(),
            customer_hostel: document.getElementById('customerHostel').value.trim(),
            device_brand: document.getElementById('deviceBrand').value,
            device_model: document.getElementById('deviceModel').value.trim(),
            repair_type: document.getElementById('repairTypeGen').value,
            urgency_level: document.getElementById('urgencyLevel').value,
            issue_description: document.getElementById('issueDescription').value.trim()
        };
    }

    saveOrderToLocalStorage(order) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.order_code] = {
            code: order.order_code,
            device: `${order.device_brand} ${order.device_model}`,
            repair: order.repair_type,
            status: order.status,
            completion: new Date(order.estimated_completion).toLocaleString(),
            progress: order.progress,
            steps: order.steps,
            technician: {
                name: "Abdul Latif Bright (Spice BlaQ)",
                role: "Founder & Repair Specialist"
            },
            updates: order.updates,
            estTime: this.calculateTimeRemaining(order.urgency_level),
            readyTime: this.calculateReadyTime(order.urgency_level)
        };
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
    }

    calculateTimeRemaining(urgency) {
        switch (urgency) {
            case 'Emergency': return '4-6 hours';
            case 'Express': return 'Same day';
            default: return '2-3 days';
        }
    }

    calculateReadyTime(urgency) {
        const now = new Date();
        let readyTime;

        switch (urgency) {
            case 'Emergency':
                readyTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
                break;
            case 'Express':
                readyTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                break;
            default:
                readyTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }

        return readyTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    displayOrderCode(order) {
        // Update display elements
        document.getElementById('generatedOrderCode').textContent = order.order_code;
        document.getElementById('displayCustomerName').textContent = order.customer_name;
        document.getElementById('displayDeviceInfo').textContent = `${order.device_brand} ${order.device_model}`;
        document.getElementById('displayRepairType').textContent = order.repair_type;
        document.getElementById('displayUrgency').textContent = order.urgency_level;

        // Generate simple QR code text
        this.generateQRCode(order.order_code);

        // Show order code display
        document.getElementById('generationForm').classList.add('hidden');
        document.getElementById('orderCodeDisplay').classList.remove('hidden');

        // Scroll to top of display
        document.getElementById('orderCodeDisplay').scrollIntoView({ behavior: 'smooth' });

        // Add success animation
        document.getElementById('orderCodeDisplay').classList.add('success-animation');
    }

    generateQRCode(orderCode) {
        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.innerHTML = `
            <div class="qr-content">
                <div class="qr-text">SCAN TO TRACK</div>
                <div class="qr-code-text">${orderCode}</div>
                <div class="qr-brand">CampusFix UENR</div>
            </div>
        `;
    }

    trackGeneratedOrder() {
        const orderCode = document.getElementById('generatedOrderCode').textContent;
        
        // Navigate to tracker section and auto-fill the code
        document.getElementById('orderIdInput').value = orderCode;
        
        // Scroll to tracker section
        document.getElementById('tracker').scrollIntoView({ behavior: 'smooth' });
        
        // Trigger track order
        setTimeout(() => {
            if (window.liveTracker) {
                window.liveTracker.trackOrder();
            }
        }, 1000);
    }

    printOrderDetails() {
        const printContent = `
            <div class="print-container">
                <h2>CampusFix UENR</h2>
                <h3>Order Confirmation</h3>
                <div class="order-code-print">
                    ${document.getElementById('generatedOrderCode').textContent}
                </div>
                <div class="order-details-print">
                    <p><strong>Customer:</strong> ${document.getElementById('displayCustomerName').textContent}</p>
                    <p><strong>Device:</strong> ${document.getElementById('displayDeviceInfo').textContent}</p>
                    <p><strong>Repair:</strong> ${document.getElementById('displayRepairType').textContent}</p>
                    <p><strong>Urgency:</strong> ${document.getElementById('displayUrgency').textContent}</p>
                    <p class="print-note">
                        Track your order at: campusfix-uenr.com/track
                    </p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CampusFix Order Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-container { text-align: center; max-width: 400px; margin: 0 auto; }
                    h2 { color: #00D8A7; margin-bottom: 10px; }
                    h3 { margin-bottom: 20px; }
                    .order-code-print { font-size: 24px; font-weight: bold; margin: 20px 0; color: #00D8A7; }
                    .order-details-print { text-align: left; margin-top: 20px; }
                    .print-note { margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    resetForm() {
        document.getElementById('orderForm').reset();
        document.getElementById('orderCodeDisplay').classList.add('hidden');
        document.getElementById('generationForm').classList.remove('hidden');
        
        // Clear any error messages
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.error-shake').forEach(field => field.classList.remove('error-shake', 'border-red-400'));
        
        // Scroll to form
        document.getElementById('generationForm').scrollIntoView({ behavior: 'smooth' });
    }

    // Local storage methods
    loadOrderCounter() {
        return parseInt(localStorage.getItem('campusFixOrderCounter')) || 2580;
    }

    saveOrderCounter() {
        localStorage.setItem('campusFixOrderCounter', this.orderCounter);
    }

    saveOrder(order) {
        this.generatedOrders[order.code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(this.generatedOrders));
    }

    loadSavedOrders() {
        const saved = localStorage.getItem('campusFixOrders');
        return saved ? JSON.parse(saved) : {};
    }
}

// Share functions
function shareViaWhatsApp() {
    const orderCode = document.getElementById('generatedOrderCode').textContent;
    const message = `My CampusFix UENR Order Code: ${orderCode}\nTrack my repair: campusfix-uenr.com/track`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function copyOrderCode() {
    const orderCode = document.getElementById('generatedOrderCode').textContent;
    navigator.clipboard.writeText(orderCode).then(() => {
        // Show copied notification
        const copyBtn = document.getElementById('copyCode');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(() => {
        alert('Failed to copy order code. Please copy manually: ' + orderCode);
    });
}

function saveAsImage() {
    alert('Screenshot this page to save your order details');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderCodeGenerator();
});