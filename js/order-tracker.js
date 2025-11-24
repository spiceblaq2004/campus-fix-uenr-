// ================================
// ENHANCED ORDER TRACKER
// ================================

class OrderTracker {
    constructor() {
        this.currentOrder = null;
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.initializeEventListeners();
        this.startAutoRefresh();
    }

    initializeEventListeners() {
        // Track order button
        const trackBtn = document.getElementById('trackOrderBtn');
        if (trackBtn) {
            trackBtn.addEventListener('click', () => {
                this.trackOrder();
            });
        }

        // Enter key in search input
        const searchInput = document.getElementById('orderIdInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackOrder();
                }
            });
        }

        // Demo order buttons
        const demoButtons = document.querySelectorAll('.demo-btn');
        demoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-order');
                document.getElementById('orderIdInput').value = orderId;
                this.trackOrder();
            });
        });
    }

    async trackOrder() {
        const orderId = document.getElementById('orderIdInput').value.trim();
        
        if (!orderId) {
            this.showError('Please enter an order code');
            return;
        }

        // Validate order code format
        if (!this.isValidOrderCode(orderId)) {
            this.showError('Invalid order code format. Format: CF-YYYY-XXXX');
            return;
        }

        this.showLoading();

        try {
            let order = null;

            // Try JSONBin backend first
            if (window.jsonbinBackend) {
                try {
                    order = await window.jsonbinBackend.getOrder(orderId);
                } catch (error) {
                    console.warn('JSONBin backend failed:', error);
                }
            }

            // Fallback to local storage
            if (!order) {
                order = this.getOrderFromLocalStorage(orderId);
            }

            if (order) {
                this.currentOrder = order;
                this.displayOrderDetails(order);
                this.startProgressSimulation(orderId);
            } else {
                this.showOrderNotFound();
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            this.showError('Failed to track order. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    isValidOrderCode(code) {
        return /^CF-\d{4}-\d{4}$/.test(code);
    }

    getOrderFromLocalStorage(orderId) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const sampleOrders = this.getSampleOrders();
        return savedOrders[orderId] || sampleOrders[orderId];
    }

    getSampleOrders() {
        return {
            'CF-2024-2581': {
                order_code: 'CF-2024-2581',
                device_brand: 'iPhone',
                device_model: '13 Pro',
                repair_type: 'Screen Replacement',
                status: 'In Progress',
                progress: 60,
                estimated_completion: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                steps: {
                    received: '10:30 AM',
                    diagnosis: '11:15 AM',
                    repair: 'In Progress',
                    quality: 'Pending',
                    ready: 'Pending'
                },
                updates: [
                    {
                        icon: 'fas fa-clipboard-check',
                        color: 'text-green-400',
                        bgColor: 'bg-green-400/10',
                        message: 'Order received and queued for diagnosis',
                        time: '10:30 AM'
                    },
                    {
                        icon: 'fas fa-search',
                        color: 'text-blue-400',
                        bgColor: 'bg-blue-400/10',
                        message: 'Diagnosis completed - screen replacement needed',
                        time: '11:15 AM'
                    },
                    {
                        icon: 'fas fa-tools',
                        color: 'text-amber-400',
                        bgColor: 'bg-amber-400/10',
                        message: 'Repair in progress - original screen removed',
                        time: '12:45 PM'
                    }
                ],
                technician: {
                    name: 'Abdul Latif Bright (Spice BlaQ)',
                    role: 'Founder & Repair Specialist'
                }
            },
            'CF-2024-1924': {
                order_code: 'CF-2024-1924',
                device_brand: 'Samsung',
                device_model: 'Galaxy S21',
                repair_type: 'Battery Replacement',
                status: 'Completed',
                progress: 100,
                estimated_completion: new Date().toISOString(),
                steps: {
                    received: '9:00 AM',
                    diagnosis: '9:45 AM',
                    repair: '10:30 AM',
                    quality: '2:15 PM',
                    ready: '3:15 PM'
                },
                updates: [
                    {
                        icon: 'fas fa-clipboard-check',
                        color: 'text-green-400',
                        bgColor: 'bg-green-400/10',
                        message: 'Order received and queued for diagnosis',
                        time: '9:00 AM'
                    },
                    {
                        icon: 'fas fa-check-circle',
                        color: 'text-green-400',
                        bgColor: 'bg-green-400/10',
                        message: 'Repair completed - ready for pickup',
                        time: '3:15 PM'
                    }
                ],
                technician: {
                    name: 'Abdul Latif Bright (Spice BlaQ)',
                    role: 'Founder & Repair Specialist'
                }
            }
        };
    }

    displayOrderDetails(order) {
        const resultsContainer = document.getElementById('trackerResults');
        if (!resultsContainer) return;

        const completionTime = new Date(order.estimated_completion).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        resultsContainer.innerHTML = `
            <div class="tracker-card">
                <div class="tracker-header">
                    <div class="order-info">
                        <h3>Order: ${order.order_code}</h3>
                        <div class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                            ${order.status}
                        </div>
                    </div>
                    <div class="order-meta">
                        <div class="meta-item">
                            <strong>Device:</strong>
                            <span>${order.device_brand} ${order.device_model}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Repair:</strong>
                            <span>${order.repair_type}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Est. Completion:</strong>
                            <span>${completionTime}</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-header">
                        <span>Repair Progress</span>
                        <span>${order.progress}%</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${order.progress}%"></div>
                    </div>
                </div>

                <div class="timeline-section">
                    <h4>Repair Timeline</h4>
                    <div class="timeline">
                        ${this.generateTimelineHTML(order.steps)}
                    </div>
                </div>

                <div class="updates-section">
                    <h4>Recent Updates</h4>
                    <div class="updates-list">
                        ${this.generateUpdatesHTML(order.updates)}
                    </div>
                </div>

                <div class="technician-section">
                    <div class="technician-card">
                        <div class="tech-avatar">
                            ${order.technician.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="tech-info">
                            <strong>${order.technician.name}</strong>
                            <span>${order.technician.role}</span>
                        </div>
                    </div>
                </div>

                <div class="actions-section">
                    <button class="btn btn-primary" onclick="window.open('https://wa.me/233246912468', '_blank')">
                        <i class="fab fa-whatsapp"></i>
                        Message Technician
                    </button>
                    <button class="btn btn-outline" onclick="window.open('tel:+233246912468')">
                        <i class="fas fa-phone"></i>
                        Call Now
                    </button>
                </div>
            </div>
        `;

        // Add animation
        resultsContainer.classList.add('scaleIn');
        setTimeout(() => {
            resultsContainer.classList.remove('scaleIn');
        }, 600);
    }

    generateTimelineHTML(steps) {
        return `
            <div class="timeline-item completed">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>Order Received</strong>
                    <span>${steps.received}</span>
                </div>
            </div>
            <div class="timeline-item ${steps.diagnosis !== 'Pending' ? 'completed' : 'pending'}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>Diagnosis</strong>
                    <span>${steps.diagnosis}</span>
                </div>
            </div>
            <div class="timeline-item ${steps.repair !== 'Pending' ? 'completed' : steps.repair === 'In Progress' ? 'active' : 'pending'}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>Repair</strong>
                    <span>${steps.repair}</span>
                </div>
            </div>
            <div class="timeline-item ${steps.quality !== 'Pending' ? 'completed' : 'pending'}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>Quality Check</strong>
                    <span>${steps.quality}</span>
                </div>
            </div>
            <div class="timeline-item ${steps.ready !== 'Pending' ? 'completed' : 'pending'}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <strong>Ready for Pickup</strong>
                    <span>${steps.ready}</span>
                </div>
            </div>
        `;
    }

    generateUpdatesHTML(updates) {
        return updates.map(update => `
            <div class="update-item">
                <div class="update-icon ${update.bgColor}">
                    <i class="${update.icon} ${update.color}"></i>
                </div>
                <div class="update-content">
                    <p>${update.message}</p>
                    <span class="update-time">${update.time}</span>
                </div>
            </div>
        `).join('');
    }

    startProgressSimulation(orderId) {
        // Only simulate for demo orders
        if (!this.currentOrder || this.currentOrder.status === 'Completed') return;

        // Clear existing interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            const order = savedOrders[orderId];
            
            if (order && order.progress < 100) {
                // Simulate progress
                order.progress += Math.random() * 5;
                if (order.progress > 100) order.progress = 100;

                // Update status based on progress
                if (order.progress >= 80 && order.progress < 100) {
                    order.status = 'Quality Check';
                    order.steps.quality = 'In Progress';
                    order.steps.repair = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    });
                } else if (order.progress === 100) {
                    order.status = 'Completed';
                    order.steps.quality = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    });
                    order.steps.ready = 'Ready Now';
                    clearInterval(this.progressInterval);
                }

                // Save and update display
                savedOrders[orderId] = order;
                localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
                this.displayOrderDetails(order);
            }
        }, 10000); // Update every 10 seconds
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh && this.currentOrder) {
                this.trackOrder();
            }
        }, 30000); // Refresh every 30 seconds
    }

    showLoading() {
        const trackBtn = document.getElementById('trackOrderBtn');
        if (trackBtn) {
            trackBtn.disabled = true;
            trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
        }
    }

    hideLoading() {
        const trackBtn = document.getElementById('trackOrderBtn');
        if (trackBtn) {
            trackBtn.disabled = false;
            trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Order';
        }
    }

    showError(message) {
        const resultsContainer = document.getElementById('trackerResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Order Not Found</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.orderTracker.trackOrder()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    showOrderNotFound() {
        this.showError('We couldn\'t find an order with that code. Please check your order code and try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderTracker = new OrderTracker();
});