// ================================
// ORDER CODE GENERATION SYSTEM
// ================================

class OrderCodeGenerator {
    constructor() {
        this.orderCounter = this.loadOrderCounter();
        this.generatedOrders = this.loadSavedOrders();
        this.initializeEventListeners();
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
    }

    generateOrderCode() {
        // Get form data
        const formData = this.getFormData();
        
        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Generate unique order code
        const orderCode = this.createOrderCode();
        
        // Create order object
        const order = {
            code: orderCode,
            ...formData,
            timestamp: new Date().toISOString(),
            status: 'Order Received',
            progress: 10,
            steps: {
                received: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                }),
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
                    time: new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    })
                }
            ],
            estimatedCompletion: this.calculateCompletionTime(formData.urgencyLevel),
            estTime: this.calculateTimeRemaining(formData.urgencyLevel),
            readyTime: this.calculateReadyTime(formData.urgencyLevel)
        };

        // Save order to local storage
        this.saveOrder(order);

        // Display order code
        this.displayOrderCode(order);

        // Send confirmation (simulated)
        this.sendConfirmation(order);
    }

    getFormData() {
        return {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerEmail: document.getElementById('customerEmail').value,
            customerHostel: document.getElementById('customerHostel').value,
            deviceBrand: document.getElementById('deviceBrand').value,
            deviceModel: document.getElementById('deviceModel').value,
            repairType: document.getElementById('repairTypeGen').value,
            urgencyLevel: document.getElementById('urgencyLevel').value,
            issueDescription: document.getElementById('issueDescription').value
        };
    }

    validateForm(data) {
        // Basic validation
        if (!data.customerName.trim()) {
            alert('Please enter your name');
            return false;
        }

        if (!data.customerPhone.trim() || data.customerPhone.length < 10) {
            alert('Please enter a valid phone number');
            return false;
        }

        if (!data.deviceBrand || !data.deviceModel.trim()) {
            alert('Please provide device information');
            return false;
        }

        return true;
    }

    createOrderCode() {
        this.orderCounter++;
        this.saveOrderCounter();
        
        const year = new Date().getFullYear();
        const paddedCounter = this.orderCounter.toString().padStart(4, '0');
        
        return `CF-${year}-${paddedCounter}`;
    }

    calculateCompletionTime(urgency) {
        const now = new Date();
        let completionTime;

        switch (urgency) {
            case 'Emergency':
                completionTime = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
                break;
            case 'Express':
                completionTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                break;
            default:
                completionTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        }

        return completionTime.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        document.getElementById('generatedOrderCode').textContent = order.code;
        document.getElementById('displayCustomerName').textContent = order.customerName;
        document.getElementById('displayDeviceInfo').textContent = `${order.deviceBrand} ${order.deviceModel}`;
        document.getElementById('displayRepairType').textContent = order.repairType;
        document.getElementById('displayUrgency').textContent = order.urgencyLevel;

        // Generate simple QR code text
        this.generateQRCode(order.code);

        // Show order code display
        document.getElementById('generationForm').classList.add('hidden');
        document.getElementById('orderCodeDisplay').classList.remove('hidden');

        // Scroll to top of display
        document.getElementById('orderCodeDisplay').scrollIntoView({ behavior: 'smooth' });
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
        
        // Scroll to form
        document.getElementById('generationForm').scrollIntoView({ behavior: 'smooth' });
    }

    sendConfirmation(order) {
        // Simulate sending confirmation
        const message = `Hi ${order.customerName}! Your CampusFix order ${order.code} has been received. We'll contact you soon about your ${order.deviceBrand} ${order.deviceModel} ${order.repairType}. Track: campusfix-uenr.com/track`;
        
        // In production, this would make an API call to send SMS/Email
        console.log('Confirmation sent:', message);
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
        
        // Also update the sampleOrders for tracking
        if (window.sampleOrders) {
            window.sampleOrders[order.code] = order;
        }
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
        alert('Order code copied to clipboard!');
    });
}

function saveAsImage() {
    alert('Screenshot this page to save your order details');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderCodeGenerator();
});