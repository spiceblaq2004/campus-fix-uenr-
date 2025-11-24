// ================================
// LIVE ORDER TRACKER SYSTEM
// ================================

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
        
        this.initializeEventListeners();
        this.startAutoRefresh();
    }

    initializeEventListeners() {
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        const toggleSlider = document.getElementById('toggleSlider');
        
        autoRefreshToggle.addEventListener('change', (e) => {
            this.isAutoRefreshEnabled = e.target.checked;
            toggleSlider.style.transform = e.target.checked ? 'translateX(24px)' : 'translateX(0)';
            
            if (this.isAutoRefreshEnabled) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });

        // Manual refresh
        document.getElementById('manualRefresh').addEventListener('click', () => {
            this.manualRefresh();
        });

        // Track order button
        document.getElementById('trackOrderBtn').addEventListener('click', () => {
            this.trackOrder();
        });

        // Enter key in search input
        document.getElementById('orderIdInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.trackOrder();
            }
        });

        // Demo order buttons
        document.querySelectorAll('.demo-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-order');
                document.getElementById('orderIdInput').value = orderId;
                this.trackOrder();
            });
        });

        // Try again button
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            document.getElementById('noOrderMessage').classList.add('hidden');
            document.getElementById('orderIdInput').focus();
        });
    }

    trackOrder() {
        const orderId = document.getElementById('orderIdInput').value.trim();
        
        // Load saved orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        if (orderId && allOrders[orderId]) {
            this.currentOrderId = orderId;
            this.updateOrderDisplay(orderId);
            this.simulateRealTimeProgress(orderId);
        } else {
            this.showOrderNotFound();
        }
    }

    updateOrderDisplay(orderId) {
        // Load saved orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        const order = allOrders[orderId];
        if (!order) return;

        // Update all display elements
        document.getElementById('displayOrderId').textContent = orderId;
        document.getElementById('displayDevice').textContent = order.device;
        document.getElementById('displayRepair').textContent = order.repair;
        document.getElementById('displayStatus').textContent = order.status;
        document.getElementById('displayCompletion').textContent = order.completion;
        
        // Update status badge
        const statusBadge = document.getElementById('displayStatus');
        statusBadge.className = 'status-badge ';
        if (order.status === 'In Progress') {
            statusBadge.classList.add('status-in-progress');
        } else if (order.status === 'Completed') {
            statusBadge.classList.add('status-completed');
        } else if (order.status === 'Ready for Pickup') {
            statusBadge.classList.add('status-ready');
        } else {
            statusBadge.classList.add('status-pending');
        }
        
        // Update progress bar
        document.getElementById('progressBar').style.width = `${order.progress}%`;
        
        // Update step times and status
        this.updateProgressSteps(order);
        
        // Update estimated time
        document.getElementById('estTime').textContent = order.estTime;
        document.getElementById('readyTime').textContent = order.readyTime;
        
        // Update technician info
        if (order.technician) {
            document.querySelector('.technician-name').textContent = order.technician.name;
            document.querySelector('.technician-role').textContent = order.technician.role;
        }
        
        // Update repair updates
        this.updateRepairUpdates(order);
        
        // Update last updated time
        this.updateLastUpdatedTime();
        
        // Show tracking section
        document.getElementById('orderTracking').classList.remove('hidden');
        document.getElementById('noOrderMessage').classList.add('hidden');
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
        document.getElementById('step1Time').textContent = order.steps.received;
        document.getElementById('step2Time').textContent = order.steps.diagnosis;
        document.getElementById('step3Time').textContent = order.steps.repair;
        document.getElementById('step4Time').textContent = order.steps.quality;
        document.getElementById('step5Time').textContent = order.steps.ready;
    }

    updateRepairUpdates(order) {
        const updatesContainer = document.getElementById('updatesContainer');
        updatesContainer.innerHTML = '';
        
        order.updates.forEach(update => {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item';
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
        document.getElementById('updateTime').textContent = timeString;
    }

    simulateRealTimeProgress(orderId) {
        // Load saved orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        const order = allOrders[orderId];
        if (!order || order.status === 'Completed' || order.status === 'Ready for Pickup') return;

        // Simulate progress every 30 seconds for demo purposes
        setInterval(() => {
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
                } else if (order.progress === 100) {
                    order.status = 'Ready for Pickup';
                    order.steps.quality = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    });
                    order.steps.ready = 'Ready Now';
                    order.completion = 'Ready for Pickup';
                }

                // Add new update if significant progress made
                if (Math.random() > 0.7) {
                    this.addRandomUpdate(order);
                }

                // Save updated order
                this.saveOrder(order);

                // Update display
                this.updateOrderDisplay(orderId);
            }
        }, 30000); // Update every 30 seconds
    }

    addRandomUpdate(order) {
        const updates = [
            {
                icon: 'fas fa-tools',
                color: 'text-amber-400',
                bgColor: 'bg-amber-400/10',
                message: 'Technician is calibrating the new display',
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                })
            },
            {
                icon: 'fas fa-battery-full',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10',
                message: 'Battery and functionality tests completed successfully',
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                })
            },
            {
                icon: 'fas fa-camera',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10',
                message: 'Camera and sensor calibration in progress',
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                })
            }
        ];

        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        order.updates.push(randomUpdate);

        // Keep only last 6 updates
        if (order.updates.length > 6) {
            order.updates = order.updates.slice(-6);
        }
    }

    saveOrder(order) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        savedOrders[order.code] = order;
        localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
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

    showOrderNotFound() {
        document.getElementById('orderTracking').classList.add('hidden');
        document.getElementById('noOrderMessage').classList.remove('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liveTracker = new LiveOrderTracker();
    window.sampleOrders = sampleOrders;
});