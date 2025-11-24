// ===== LIVE ORDER TRACKER SYSTEM =====

// Enhanced sample orders with real-time progression
const sampleOrders = {
    'CF-2023-2581': {
        device: 'iPhone 13 Pro',
        repair: 'Screen Replacement',
        status: 'In Progress',
        completion: 'Today, 4:30 PM',
        progress: 60,
        steps: {
            received: '10:30 AM',
            diagnosis: '11:15 AM',
            repair: 'In Progress',
            quality: 'Pending',
            ready: 'Pending'
        },
        technician: {
            name: 'Emmanuel K.',
            role: 'Senior Repair Technician'
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
                message: 'Diagnosis completed - confirmed screen replacement needed',
                time: '11:15 AM'
            },
            {
                icon: 'fas fa-tools',
                color: 'text-amber-400',
                bgColor: 'bg-amber-400/10',
                message: 'Repair in progress - original screen removed',
                time: '12:45 PM'
            },
            {
                icon: 'fas fa-bolt',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10',
                message: 'New screen installed - running functionality tests',
                time: '1:30 PM'
            }
        ],
        estTime: '2 hours 15 minutes',
        readyTime: '4:30 PM'
    },
    'CF-2023-1924': {
        device: 'Samsung Galaxy S21',
        repair: 'Battery Replacement',
        status: 'Completed',
        completion: 'Completed at 3:15 PM',
        progress: 100,
        steps: {
            received: '9:00 AM',
            diagnosis: '9:45 AM',
            repair: '10:30 AM',
            quality: '2:15 PM',
            ready: '3:15 PM'
        },
        technician: {
            name: 'Sarah M.',
            role: 'Battery Specialist'
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
                icon: 'fas fa-search',
                color: 'text-blue-400',
                bgColor: 'bg-blue-400/10',
                message: 'Diagnosis completed - battery health at 63%',
                time: '9:45 AM'
            },
            {
                icon: 'fas fa-tools',
                color: 'text-amber-400',
                bgColor: 'bg-amber-400/10',
                message: 'Battery replacement in progress',
                time: '10:30 AM'
            },
            {
                icon: 'fas fa-check-circle',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10',
                message: 'Quality check passed - device functioning optimally',
                time: '2:15 PM'
            },
            {
                icon: 'fas fa-box',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10',
                message: 'Repair completed - ready for pickup',
                time: '3:15 PM'
            }
        ],
        estTime: 'Completed',
        readyTime: '3:15 PM'
    },
    'CF-2023-3157': {
        device: 'OnePlus 9',
        repair: 'Charging Port',
        status: 'Ready for Pickup',
        completion: 'Ready for Pickup',
        progress: 100,
        steps: {
            received: '11:00 AM',
            diagnosis: '11:40 AM',
            repair: '1:15 PM',
            quality: '2:30 PM',
            ready: '3:00 PM'
        },
        technician: {
            name: 'David A.',
            role: 'Hardware Technician'
        },
        updates: [
            {
                icon: 'fas fa-clipboard-check',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10',
                message: 'Order received and queued for diagnosis',
                time: '11:00 AM'
            },
            {
                icon: 'fas fa-search',
                color: 'text-blue-400',
                bgColor: 'bg-blue-400/10',
                message: 'Diagnosis completed - charging port needs replacement',
                time: '11:40 AM'
            },
            {
                icon: 'fas fa-tools',
                color: 'text-amber-400',
                bgColor: 'bg-amber-400/10',
                message: 'Charging port replacement in progress',
                time: '1:15 PM'
            },
            {
                icon: 'fas fa-check-circle',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10',
                message: 'Quality check passed - fast charging restored',
                time: '2:30 PM'
            },
            {
                icon: 'fas fa-box',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10',
                message: 'Repair completed - ready for pickup at hostel',
                time: '3:00 PM'
            }
        ],
        estTime: 'Ready for Pickup',
        readyTime: '3:00 PM'
    }
};

class LiveOrderTracker {
    constructor() {
        this.currentOrderId = null;
        this.autoRefreshInterval = null;
        this.isAutoRefreshEnabled = true;
        this.updateCallbacks = [];
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.startAutoRefresh();
        this.loadDemoOrders();
        console.log('Live Order Tracker initialized 📊');
    }

    initializeEventListeners() {
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        const toggleSlider = document.getElementById('toggleSlider');
        
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.isAutoRefreshEnabled = e.target.checked;
                if (toggleSlider) {
                    toggleSlider.style.transform = e.target.checked ? 'translateX(24px)' : 'translateX(0)';
                }
                
                if (this.isAutoRefreshEnabled) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }

        // Manual refresh
        const manualRefresh = document.getElementById('manualRefresh');
        if (manualRefresh) {
            manualRefresh.addEventListener('click', () => {
                this.manualRefresh();
            });
        }

        // Track order button
        const trackOrderBtn = document.getElementById('trackOrderBtn');
        if (trackOrderBtn) {
            trackOrderBtn.addEventListener('click', () => {
                this.trackOrder();
            });
        }

        // Enter key in search input
        const orderIdInput = document.getElementById('orderIdInput');
        if (orderIdInput) {
            orderIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackOrder();
                }
            });
        }

        // Try again button
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                this.showSearchInterface();
            });
        }
    }

    loadDemoOrders() {
        // Load saved orders from localStorage and merge with sample orders
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        window.allOrders = { ...sampleOrders, ...savedOrders };
    }

    trackOrder() {
        const orderIdInput = document.getElementById('orderIdInput');
        if (!orderIdInput) return;

        const orderId = orderIdInput.value.trim().toUpperCase();
        
        if (orderId && window.allOrders && window.allOrders[orderId]) {
            this.currentOrderId = orderId;
            this.updateOrderDisplay(orderId);
            this.simulateRealTimeProgress(orderId);
        } else {
            this.showOrderNotFound();
        }
    }

    updateOrderDisplay(orderId) {
        if (!window.allOrders || !window.allOrders[orderId]) return;

        const order = window.allOrders[orderId];

        // Update all display elements
        this.updateTextContent('displayOrderId', orderId);
        this.updateTextContent('displayDevice', order.device);
        this.updateTextContent('displayRepair', order.repair);
        this.updateTextContent('displayStatus', order.status);
        this.updateTextContent('displayCompletion', order.completion);
        
        // Update status badge
        this.updateStatusBadge(order.status);
        
        // Update progress bar
        this.updateProgressBar(order.progress);
        
        // Update step times and status
        this.updateProgressSteps(order);
        
        // Update estimated time
        this.updateTextContent('estTime', order.estTime);
        this.updateTextContent('readyTime', order.readyTime);
        
        // Update technician info
        this.updateTechnicianInfo(order.technician);
        
        // Update repair updates
        this.updateRepairUpdates(order);
        
        // Update last updated time
        this.updateLastUpdatedTime();
        
        // Show tracking section
        this.showTrackingInterface();
    }

    updateTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    updateStatusBadge(status) {
        const statusBadge = document.getElementById('displayStatus');
        if (!statusBadge) return;

        statusBadge.className = 'status-badge ';
        
        if (status === 'In Progress') {
            statusBadge.classList.add('status-in-progress');
        } else if (status === 'Completed') {
            statusBadge.classList.add('status-completed');
        } else if (status === 'Ready for Pickup') {
            statusBadge.classList.add('status-ready');
        } else {
            statusBadge.classList.add('status-pending');
        }
    }

    updateProgressBar(progress) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    updateProgressSteps(order) {
        const steps = document.querySelectorAll('.tracker-step');
        steps.forEach((step, index) => {
            step.classList.remove('step-completed', 'step-active');
            
            if (index < Math.floor(order.progress / 20)) {
                step.classList.add('step-completed');
            } else if (index === Math.floor(order.progress / 20)) {
                step.classList.add('step-active');
            }
        });

        // Update step times
        this.updateTextContent('step1Time', order.steps.received);
        this.updateTextContent('step2Time', order.steps.diagnosis);
        this.updateTextContent('step3Time', order.steps.repair);
        this.updateTextContent('step4Time', order.steps.quality);
        this.updateTextContent('step5Time', order.steps.ready);
    }

    updateTechnicianInfo(technician) {
        if (!technician) return;

        const technicianName = document.querySelector('.technician-name');
        const technicianRole = document.querySelector('.technician-role');
        
        if (technicianName) technicianName.textContent = technician.name;
        if (technicianRole) technicianRole.textContent = technician.role;
    }

    updateRepairUpdates(order) {
        const updatesContainer = document.getElementById('updatesContainer');
        if (!updatesContainer) return;

        updatesContainer.innerHTML = '';
        
        order.updates.forEach(update => {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item fade-in-up';
            updateElement.innerHTML = `
                <div class="update-icon ${update.bgColor} ${update.color}">
                    <i class="${update.icon}"></i>
                </div>
                <div class="update-content">
                    <div class="update-message">${update.message}</div>
                    <div class="update-time">${update.time}</div>
                </div>
            `;
            updatesContainer.appendChild(updateElement);
        });
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        this.updateTextContent('updateTime', timeString);
    }

    simulateRealTimeProgress(orderId) {
        if (!window.allOrders || !window.allOrders[orderId]) return;

        const order = window.allOrders[orderId];
        if (order.status === 'Completed' || order.status === 'Ready for Pickup') return;

        // Clear any existing interval
        if (order.progressInterval) {
            clearInterval(order.progressInterval);
        }

        // Simulate progress every 30 seconds for demo purposes
        order.progressInterval = setInterval(() => {
            if (order.progress < 100) {
                // Increment progress
                order.progress += Math.floor(Math.random() * 5) + 1;
                if (order.progress > 100) order.progress = 100;

                // Update status based on progress
                if (order.progress >= 80 && order.progress < 100) {
                    order.status = 'Quality Check';
                    order.steps.quality = 'In Progress';
                    order.steps.repair = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    });
                    
                    // Add quality check update
                    this.addUpdate(order, {
                        icon: 'fas fa-check-circle',
                        color: 'text-green-400',
                        bgColor: 'bg-green-400/10',
                        message: 'Quality check in progress - testing all functions'
                    });
                } else if (order.progress === 100) {
                    order.status = 'Ready for Pickup';
                    order.steps.quality = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    });
                    order.steps.ready = 'Ready Now';
                    order.completion = 'Ready for Pickup';
                    
                    // Add completion update
                    this.addUpdate(order, {
                        icon: 'fas fa-box',
                        color: 'text-purple-400',
                        bgColor: 'bg-purple-400/10',
                        message: 'Repair completed - ready for pickup at your hostel'
                    });
                    
                    // Stop the interval
                    clearInterval(order.progressInterval);
                }

                // Add new update if significant progress made
                if (Math.random() > 0.7 && order.progress < 100) {
                    this.addRandomUpdate(order);
                }

                // Save updated order
                this.saveOrder(order);

                // Update display
                this.updateOrderDisplay(orderId);
            }
        }, 30000); // Update every 30 seconds
    }

    addUpdate(order, update) {
        const newUpdate = {
            ...update,
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            })
        };
        
        order.updates.push(newUpdate);

        // Keep only last 6 updates
        if (order.updates.length > 6) {
            order.updates = order.updates.slice(-6);
        }
    }

    addRandomUpdate(order) {
        const updates = [
            {
                icon: 'fas fa-tools',
                color: 'text-amber-400',
                bgColor: 'bg-amber-400/10',
                message: 'Technician is calibrating the new display'
            },
            {
                icon: 'fas fa-battery-full',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10',
                message: 'Battery and functionality tests completed successfully'
            },
            {
                icon: 'fas fa-camera',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10',
                message: 'Camera and sensor calibration in progress'
            },
            {
                icon: 'fas fa-bolt',
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-400/10',
                message: 'Fast charging functionality verified'
            },
            {
                icon: 'fas fa-microchip',
                color: 'text-blue-400',
                bgColor: 'bg-blue-400/10',
                message: 'Running final software diagnostics'
            }
        ];

        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        this.addUpdate(order, randomUpdate);
    }

    saveOrder(order) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
        
        // Update global orders reference
        window.allOrders = { ...sampleOrders, ...savedOrders };
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        this.autoRefreshInterval = setInterval(() => {
            if (this.currentOrderId && this.isAutoRefreshEnabled) {
                this.updateOrderDisplay(this.currentOrderId);
            }
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    manualRefresh() {
        const refreshBtn = document.getElementById('manualRefresh');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

            if (this.currentOrderId) {
                this.updateOrderDisplay(this.currentOrderId);
            }

            setTimeout(() => {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Now';
            }, 1000);
        }
    }

    showTrackingInterface() {
        const orderTracking = document.getElementById('orderTracking');
        const noOrderMessage = document.getElementById('noOrderMessage');
        
        if (orderTracking) orderTracking.classList.remove('hidden');
        if (noOrderMessage) noOrderMessage.classList.add('hidden');
    }

    showOrderNotFound() {
        const orderTracking = document.getElementById('orderTracking');
        const noOrderMessage = document.getElementById('noOrderMessage');
        
        if (orderTracking) orderTracking.classList.add('hidden');
        if (noOrderMessage) noOrderMessage.classList.remove('hidden');
    }

    showSearchInterface() {
        const noOrderMessage = document.getElementById('noOrderMessage');
        const orderIdInput = document.getElementById('orderIdInput');
        
        if (noOrderMessage) noOrderMessage.classList.add('hidden');
        if (orderIdInput) {
            orderIdInput.value = '';
            orderIdInput.focus();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liveTracker = new LiveOrderTracker();

    // Demo order buttons
    document.querySelectorAll('.demo-order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-order');
            const orderIdInput = document.getElementById('orderIdInput');
            if (orderIdInput) {
                orderIdInput.value = orderId;
            }
            window.liveTracker.trackOrder();
        });
    });
});