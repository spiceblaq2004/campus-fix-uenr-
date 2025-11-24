// ================================
// LIVE ORDER TRACKER SYSTEM (COMPLETE ENHANCED VERSION)
// ================================

// Enhanced sample orders with real-time progression
const sampleOrders = {
    'CF-2023-2581': {
        code: 'CF-2023-2581',
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
            name: 'Abdul Latif Bright (Spice BlaQ)',
            role: 'Founder & Repair Specialist',
            avatar_initials: 'AB',
            is_active: true
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
        readyTime: '4:30 PM',
        created_at: '2023-11-15T10:30:00.000Z',
        updated_at: '2023-11-15T13:30:00.000Z'
    },
    'CF-2023-1924': {
        code: 'CF-2023-1924',
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
            name: 'Abdul Latif Bright (Spice BlaQ)',
            role: 'Founder & Repair Specialist',
            avatar_initials: 'AB',
            is_active: true
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
        readyTime: '3:15 PM',
        created_at: '2023-11-14T09:00:00.000Z',
        updated_at: '2023-11-14T15:15:00.000Z'
    },
    'CF-2023-3157': {
        code: 'CF-2023-3157',
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
            name: 'Abdul Latif Bright (Spice BlaQ)',
            role: 'Founder & Repair Specialist',
            avatar_initials: 'AB',
            is_active: true
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
        readyTime: '3:00 PM',
        created_at: '2023-11-15T11:00:00.000Z',
        updated_at: '2023-11-15T15:00:00.000Z'
    }
};

class LiveOrderTracker {
    constructor() {
        this.currentOrderId = null;
        this.autoRefreshInterval = null;
        this.isAutoRefreshEnabled = true;
        this.updateCallbacks = [];
        this.progressIntervals = new Map();
        
        this.initializeEventListeners();
        this.startAutoRefresh();
        this.initializeScrollAnimations();
    }

    initializeEventListeners() {
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        const toggleSlider = document.getElementById('toggleSlider');
        
        if (autoRefreshToggle && toggleSlider) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.isAutoRefreshEnabled = e.target.checked;
                toggleSlider.style.transform = e.target.checked ? 'translateX(24px)' : 'translateX(0)';
                
                if (this.isAutoRefreshEnabled) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
                
                // Show feedback
                this.showToast(
                    e.target.checked ? 'Auto-refresh enabled' : 'Auto-refresh disabled',
                    e.target.checked ? 'success' : 'info'
                );
            });
        }

        // Manual refresh
        const manualRefreshBtn = document.getElementById('manualRefresh');
        if (manualRefreshBtn) {
            manualRefreshBtn.addEventListener('click', () => {
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

            // Clear input when focused
            orderIdInput.addEventListener('focus', () => {
                if (orderIdInput.value === 'Enter order code (e.g., CF-2023-2581)') {
                    orderIdInput.value = '';
                }
            });

            // Show placeholder when empty
            orderIdInput.addEventListener('blur', () => {
                if (!orderIdInput.value.trim()) {
                    orderIdInput.value = 'Enter order code (e.g., CF-2023-2581)';
                }
            });
        }

        // Demo order buttons
        document.querySelectorAll('.demo-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = btn.getAttribute('data-order');
                if (orderIdInput) {
                    orderIdInput.value = orderId;
                    orderIdInput.classList.remove('error-shake');
                }
                this.trackOrder();
            });
        });

        // Try again button
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                this.hideOrderNotFound();
                if (orderIdInput) {
                    orderIdInput.focus();
                }
            });
        }

        // Contact action buttons
        const contactButtons = document.querySelectorAll('.contact-actions .btn-primary, .contact-actions .btn-secondary');
        contactButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href');
                if (href) {
                    window.open(href, '_blank');
                }
            });
        });

        // Share buttons in order display
        this.initializeShareButtons();
    }

    initializeShareButtons() {
        // WhatsApp share
        const whatsappBtn = document.getElementById('shareWhatsAppTracker');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                this.shareOrderViaWhatsApp();
            });
        }

        // Copy order code
        const copyBtn = document.getElementById('copyOrderCodeTracker');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyOrderCodeToClipboard();
            });
        }
    }

    async trackOrder() {
        const orderIdInput = document.getElementById('orderIdInput');
        if (!orderIdInput) return;
        
        let orderId = orderIdInput.value.trim();
        
        // Handle placeholder text
        if (orderId === 'Enter order code (e.g., CF-2023-2581)') {
            orderId = '';
        }
        
        if (!orderId) {
            this.showOrderNotFound('Please enter an order code');
            orderIdInput.classList.add('error-shake');
            return;
        }

        // Validate order code format
        if (!this.isValidOrderCode(orderId)) {
            this.showOrderNotFound('Invalid order code format. Format should be: CF-YYYY-XXXX');
            orderIdInput.classList.add('error-shake');
            return;
        }
        
        // Show loading state
        this.showTrackingLoading();
        
        try {
            // Clear any existing progress simulation
            this.clearProgressSimulation();
            
            // Try JSONBin backend first (if available)
            if (window.jsonbinBackend) {
                try {
                    const order = await window.jsonbinBackend.getOrder(orderId);
                    
                    if (order) {
                        this.currentOrderId = orderId;
                        this.updateOrderDisplayFromBackend(order);
                        this.simulateRealTimeProgress(orderId);
                        this.hideTrackingLoading();
                        this.showToast('Order found! Loading details...', 'success');
                        return;
                    }
                } catch (backendError) {
                    console.warn('JSONBin backend unavailable, falling back to local storage:', backendError);
                }
            }
            
            // Fallback to localStorage and sample orders
            this.trackOrderFromLocalStorage(orderId);
            
        } catch (error) {
            console.error('Error tracking order:', error);
            this.showOrderNotFound('Error connecting to server. Please try again.');
            this.hideTrackingLoading();
        }
    }

    isValidOrderCode(code) {
        // Validate format: CF-YYYY-XXXX where YYYY is year and XXXX is 4-digit number
        const orderCodeRegex = /^CF-\d{4}-\d{4}$/;
        return orderCodeRegex.test(code);
    }

    updateOrderDisplayFromBackend(order) {
        try {
            // Convert backend order format to frontend format
            const frontendOrder = {
                code: order.order_code,
                device: `${order.device_brand} ${order.device_model}`,
                repair: order.repair_type,
                status: order.status,
                completion: new Date(order.estimated_completion).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                progress: order.progress || 10,
                steps: order.steps || {
                    received: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    diagnosis: 'Pending',
                    repair: 'Pending',
                    quality: 'Pending',
                    ready: 'Pending'
                },
                technician: order.technician || {
                    name: 'Abdul Latif Bright (Spice BlaQ)',
                    role: 'Founder & Repair Specialist',
                    avatar_initials: 'AB',
                    is_active: true
                },
                updates: order.updates || [],
                estTime: this.calculateTimeRemaining(order.urgency_level),
                readyTime: this.calculateReadyTime(order.urgency_level),
                created_at: order.created_at,
                updated_at: order.updated_at
            };
            
            this.updateOrderDisplay(frontendOrder);
        } catch (error) {
            console.error('Error updating display from backend:', error);
            throw error;
        }
    }

    trackOrderFromLocalStorage(orderId) {
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        if (orderId && allOrders[orderId]) {
            this.currentOrderId = orderId;
            this.updateOrderDisplay(allOrders[orderId]);
            this.simulateRealTimeProgress(orderId);
            this.hideTrackingLoading();
            this.showToast('Order found in local storage!', 'success');
        } else {
            this.showOrderNotFound('Order not found. Please check your order code or generate a new one.');
            this.hideTrackingLoading();
        }
    }

    updateOrderDisplay(order) {
        if (!order) {
            this.showOrderNotFound('Order data is invalid.');
            return;
        }

        try {
            // Update all display elements with safety checks
            this.updateTextContent('displayOrderId', order.code);
            this.updateTextContent('displayDevice', order.device);
            this.updateTextContent('displayRepair', order.repair);
            this.updateTextContent('displayStatus', order.status);
            this.updateTextContent('displayCompletion', order.completion);
            
            // Update status badge with classes
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
            this.updateRepairUpdates(order.updates);
            
            // Update last updated time
            this.updateLastUpdatedTime();
            
            // Show tracking section
            this.showOrderTracking();
            
            // Add success animation
            this.animateOrderTracking();

            // Update share buttons with current order code
            this.updateShareButtons(order.code);

        } catch (error) {
            console.error('Error updating order display:', error);
            this.showOrderNotFound('Error displaying order details.');
        }
    }

    updateTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text || '--';
        }
    }

    updateStatusBadge(status) {
        const statusBadge = document.getElementById('displayStatus');
        if (!statusBadge) return;

        // Remove all status classes
        statusBadge.className = 'status-badge';
        
        // Add appropriate status class
        if (status === 'In Progress') {
            statusBadge.classList.add('status-in-progress');
        } else if (status === 'Completed') {
            statusBadge.classList.add('status-completed');
        } else if (status === 'Ready for Pickup') {
            statusBadge.classList.add('status-ready');
        } else if (status === 'Order Received') {
            statusBadge.classList.add('status-pending');
        } else {
            statusBadge.classList.add('status-pending');
        }
    }

    updateProgressBar(progress) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            
            // Add animation
            progressBar.style.transition = 'width 0.5s ease-in-out';
            
            // Change color based on progress
            if (progress >= 80) {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary), #22C55E)';
            } else if (progress >= 50) {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--accent))';
            }
        }
    }

    updateProgressSteps(order) {
        const steps = document.querySelectorAll('.tracker-step');
        if (!steps.length) return;

        steps.forEach((step, index) => {
            // Remove all state classes
            step.classList.remove('step-completed', 'step-active', 'step-pending');
            
            const stepNumber = index + 1;
            const progressPerStep = 20; // 5 steps = 20% each
            
            if (stepNumber * progressPerStep <= order.progress) {
                step.classList.add('step-completed');
            } else if ((stepNumber - 1) * progressPerStep < order.progress) {
                step.classList.add('step-active');
            } else {
                step.classList.add('step-pending');
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

        const techName = document.querySelector('.technician-name');
        const techRole = document.querySelector('.technician-role');
        const techAvatar = document.querySelector('.technician-avatar');
        
        if (techName) techName.textContent = technician.name;
        if (techRole) techRole.textContent = technician.role;
        if (techAvatar && technician.avatar_initials) {
            techAvatar.textContent = technician.avatar_initials;
        }
    }

    updateRepairUpdates(updates) {
        const updatesContainer = document.getElementById('updatesContainer');
        if (!updatesContainer) return;
        
        // Clear existing updates
        updatesContainer.innerHTML = '';
        
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            updatesContainer.innerHTML = `
                <div class="update-item">
                    <div class="update-icon bg-gray-400/10 text-gray-400">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="update-content">
                        <div class="update-message">No updates available yet. Check back soon!</div>
                        <div class="update-time">--:--</div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Show latest updates first (reverse order)
        const reversedUpdates = [...updates].reverse();
        
        reversedUpdates.forEach(update => {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item';
            updateElement.innerHTML = `
                <div class="update-icon ${update.bgColor || 'bg-blue-400/10'} ${update.color || 'text-blue-400'}">
                    <i class="${update.icon || 'fas fa-info-circle'}"></i>
                </div>
                <div class="update-content">
                    <div class="update-message">${update.message || 'Update'}</div>
                    <div class="update-time">${update.time || '--:--'}</div>
                </div>
            `;
            updatesContainer.appendChild(updateElement);
        });

        // Add entrance animation to updates
        setTimeout(() => {
            const updateItems = updatesContainer.querySelectorAll('.update-item');
            updateItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
                item.classList.add('slide-in-up-stagger');
            });
        }, 100);
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
        // Clear any existing interval for this order
        this.clearProgressSimulation(orderId);

        // Load saved orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        const order = allOrders[orderId];
        if (!order || order.status === 'Completed' || order.status === 'Ready for Pickup') return;

        // Only simulate progress for demo and local orders, not backend orders
        const isDemoOrder = sampleOrders[orderId];
        const isLocalOrder = savedOrders[orderId] && !window.jsonbinBackend;

        if (isDemoOrder || isLocalOrder) {
            const intervalId = setInterval(() => {
                const currentOrder = allOrders[orderId];
                if (!currentOrder || currentOrder.progress >= 100) {
                    this.clearProgressSimulation(orderId);
                    return;
                }

                // Increment progress (1-3% each interval)
                currentOrder.progress += Math.floor(Math.random() * 3) + 1;
                if (currentOrder.progress > 100) currentOrder.progress = 100;

                // Update status based on progress
                this.updateOrderStatus(currentOrder);

                // Add new update if significant progress made
                if (Math.random() > 0.8) {
                    this.addRandomUpdate(currentOrder);
                }

                // Save updated order
                this.saveOrder(currentOrder);

                // Update display
                this.updateOrderDisplay(currentOrder);

                // Show completion toast
                if (currentOrder.progress === 100) {
                    this.showToast('🎉 Repair completed! Your device is ready for pickup.', 'success');
                    this.clearProgressSimulation(orderId);
                }

            }, 10000); // Update every 10 seconds for demo

            this.progressIntervals.set(orderId, intervalId);
        }
    }

    updateOrderStatus(order) {
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
            order.estTime = 'Completed';
        }
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
            },
            {
                icon: 'fas fa-microchip',
                color: 'text-blue-400',
                bgColor: 'bg-blue-400/10',
                message: 'Running final software diagnostics',
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                })
            }
        ];

        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        order.updates.push(randomUpdate);

        // Keep only last 8 updates
        if (order.updates.length > 8) {
            order.updates = order.updates.slice(-8);
        }
    }

    saveOrder(order) {
        try {
            const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
            savedOrders[order.code] = order;
            localStorage.setItem('campusFixOrders', JSON.stringify(savedOrders));
        } catch (error) {
            console.error('Error saving order to localStorage:', error);
        }
    }

    clearProgressSimulation(orderId = null) {
        if (orderId) {
            const intervalId = this.progressIntervals.get(orderId);
            if (intervalId) {
                clearInterval(intervalId);
                this.progressIntervals.delete(orderId);
            }
        } else {
            // Clear all intervals
            this.progressIntervals.forEach((intervalId, id) => {
                clearInterval(intervalId);
            });
            this.progressIntervals.clear();
        }
    }

    showTrackingLoading() {
        const trackBtn = document.getElementById('trackOrderBtn');
        const orderIdInput = document.getElementById('orderIdInput');
        
        if (trackBtn) {
            trackBtn.disabled = true;
            trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
        }
        
        if (orderIdInput) {
            orderIdInput.disabled = true;
        }

        // Show global loading spinner
        this.showGlobalLoading();
    }

    hideTrackingLoading() {
        const trackBtn = document.getElementById('trackOrderBtn');
        const orderIdInput = document.getElementById('orderIdInput');
        
        if (trackBtn) {
            trackBtn.disabled = false;
            trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Order';
        }
        
        if (orderIdInput) {
            orderIdInput.disabled = false;
        }

        // Hide global loading spinner
        this.hideGlobalLoading();
    }

    showGlobalLoading() {
        const loadingSpinner = document.getElementById('globalLoadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
            document.body.classList.add('loading');
        }
    }

    hideGlobalLoading() {
        const loadingSpinner = document.getElementById('globalLoadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
            document.body.classList.remove('loading');
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        this.autoRefreshInterval = setInterval(() => {
            if (this.currentOrderId && this.isAutoRefreshEnabled) {
                this.updateOrderDisplayFromCurrentOrder();
            }
        }, 30000); // Refresh every 30 seconds
    }

    updateOrderDisplayFromCurrentOrder() {
        if (!this.currentOrderId) return;

        // For demo purposes, we'll update from local storage
        const savedOrders = JSON.parse(localStorage.getItem('campusFixOrders') || '{}');
        const allOrders = { ...sampleOrders, ...savedOrders };
        
        if (allOrders[this.currentOrderId]) {
            this.updateOrderDisplay(allOrders[this.currentOrderId]);
            this.showToast('Order status updated', 'info');
        }
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
                this.updateOrderDisplayFromCurrentOrder();
            }

            setTimeout(() => {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Now';
                this.showToast('Manual refresh completed', 'success');
            }, 1500);
        }
    }

    showOrderNotFound(message = 'Order not found. Please check your order code.') {
        const orderTracking = document.getElementById('orderTracking');
        const noOrderMessage = document.getElementById('noOrderMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (orderTracking) orderTracking.classList.add('hidden');
        if (noOrderMessage) noOrderMessage.classList.remove('hidden');
        if (errorMessage) errorMessage.textContent = message;

        // Add shake animation to input
        const orderIdInput = document.getElementById('orderIdInput');
        if (orderIdInput) {
            orderIdInput.classList.add('error-shake');
            setTimeout(() => {
                orderIdInput.classList.remove('error-shake');
            }, 1000);
        }

        this.showToast(message, 'error');
    }

    hideOrderNotFound() {
        const noOrderMessage = document.getElementById('noOrderMessage');
        if (noOrderMessage) {
            noOrderMessage.classList.add('hidden');
        }
    }

    showOrderTracking() {
        const orderTracking = document.getElementById('orderTracking');
        const noOrderMessage = document.getElementById('noOrderMessage');
        
        if (orderTracking) orderTracking.classList.remove('hidden');
        if (noOrderMessage) noOrderMessage.classList.add('hidden');
    }

    animateOrderTracking() {
        const orderTracking = document.getElementById('orderTracking');
        if (orderTracking) {
            orderTracking.classList.add('success-animation');
            setTimeout(() => {
                orderTracking.classList.remove('success-animation');
            }, 1000);
        }
    }

    updateShareButtons(orderCode) {
        // Update WhatsApp share button
        const whatsappBtn = document.getElementById('shareWhatsAppTracker');
        if (whatsappBtn) {
            whatsappBtn.onclick = () => this.shareOrderViaWhatsApp(orderCode);
        }

        // Update copy button
        const copyBtn = document.getElementById('copyOrderCodeTracker');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyOrderCodeToClipboard(orderCode);
        }
    }

    shareOrderViaWhatsApp(orderCode = null) {
        const code = orderCode || this.currentOrderId;
        if (!code) return;

        const message = `My CampusFix UENR Order Code: ${code}\nTrack my repair: ${window.location.origin}${window.location.pathname}#tracker`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        this.showToast('Opening WhatsApp...', 'success');
    }

    copyOrderCodeToClipboard(orderCode = null) {
        const code = orderCode || this.currentOrderId;
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            this.showToast('Order code copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Order code copied!', 'success');
        });
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type} fixed top-4 right-4 z-50 glass p-4 rounded-lg border-l-4 ${
            type === 'success' ? 'border-green-400' : 
            type === 'error' ? 'border-red-400' : 
            type === 'warning' ? 'border-amber-400' : 'border-blue-400'
        }`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="${icons[type] || icons.info} ${
            type === 'success' ? 'text-green-400' : 
            type === 'error' ? 'text-red-400' : 
            type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                }"></i>
                <span class="text-light">${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
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

    initializeScrollAnimations() {
        // Add scroll animations for tracker section
        const trackerSection = document.getElementById('tracker');
        if (!trackerSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-entrance', 'visible');
                    
                    // Animate child elements with stagger
                    const staggerElements = entry.target.querySelectorAll('.search-container, .demo-orders, .tracker-card');
                    staggerElements.forEach((element, index) => {
                        element.style.animationDelay = `${index * 0.2}s`;
                        element.classList.add('fade-in-scale');
                    });
                }
            });
        }, { threshold: 0.1 });

        observer.observe(trackerSection);
    }

    // Public method to track order by code (for integration with order generator)
    trackOrderByCode(orderCode) {
        const orderIdInput = document.getElementById('orderIdInput');
        if (orderIdInput) {
            orderIdInput.value = orderCode;
        }
        this.trackOrder();
    }

    // Cleanup method
    destroy() {
        this.stopAutoRefresh();
        this.clearProgressSimulation();
        
        // Remove event listeners
        const events = ['click', 'change', 'keypress', 'focus', 'blur'];
        events.forEach(event => {
            document.removeEventListener(event, this.boundHandlers);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liveTracker = new LiveOrderTracker();
    window.sampleOrders = sampleOrders;
    
    console.log('✅ Live Order Tracker initialized!');
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiveOrderTracker, sampleOrders };
}