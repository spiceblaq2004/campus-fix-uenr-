// ================================
// SIMPLE ORDER GENERATOR - NO AUTO WHATSAPP
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
        if (!formData.customerName || !formData.customerPhone || !formData.deviceModel) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            this.showLoading();
            
            // Create order
            const order = this.createOrder(formData);
            
            // Save to storage
            this.saveOrder(order);
            
            // Show success (NO AUTO WHATSAPP)
            this.showSuccess(order);
            
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
        
        console.log('✅ ORDER SAVED:', order.order_code);
        console.log('📊 TOTAL ORDERS:', Object.keys(existingOrders).length);
    }

    showSuccess(order) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
            justify-content: center; z-index: 10000; font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: #1e293b; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; width: 90%; color: white; border: 2px solid #334155;">
                <div style="color: #10b981; font-size: 3rem; margin-bottom: 15px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="margin-bottom: 15px; color: white;">Order Created Successfully! 🎉</h3>
                <p style="margin-bottom: 10px;"><strong>Order Code:</strong></p>
                <div style="background: #0f172a; padding: 15px; border-radius: 10px; margin: 15px 0; border: 1px solid #334155;">
                    <span style="font-size: 1.5rem; font-weight: bold; color: #6366f1;">${order.order_code}</span>
                </div>
                
                <p style="margin: 20px 0; color: #94a3b8; line-height: 1.5;">
                    Your repair order has been created successfully! 
                    You can now track your repair progress using the order code above.
                </p>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 25px;">
                    <button onclick="window.orderGenerator.closeSuccessModal('${order.order_code}')" 
                            style="background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Track My Repair
                    </button>
                    <button onclick="window.orderGenerator.closeModal()" 
                            style="background: transparent; color: #94a3b8; border: 1px solid #94a3b8; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                        Close
                    </button>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
                    <small style="color: #94a3b8;">
                        <strong>Next Steps:</strong> Go to "Track Repair" section and enter your order code to see real-time updates.
                    </small>
                </div>
            </div>
        `;
        
        modal.className = 'success-modal';
        document.body.appendChild(modal);
    }

    closeSuccessModal(orderCode) {
        // Close modal
        const modal = document.querySelector('.success-modal');
        if (modal) modal.remove();
        
        // Auto-fill tracker input
        const orderIdInput = document.getElementById('orderIdInput');
        if (orderIdInput) {
            orderIdInput.value = orderCode;
        }
        
        // Scroll to tracker section
        const trackerSection = document.getElementById('tracker');
        if (trackerSection) {
            trackerSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Auto-track the order
        setTimeout(() => {
            if (window.orderTracker) {
                window.orderTracker.trackOrder();
            }
        }, 500);
    }

    closeModal() {
        const modal = document.querySelector('.success-modal');
        if (modal) modal.remove();
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

    loadOrderCounter() {
        return parseInt(localStorage.getItem('campusFixOrderCounter')) || 2580;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.orderGenerator = new OrderGenerator();
    console.log('✅ Order Generator Initialized');
});