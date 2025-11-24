// ===== MAIN WEBSITE FUNCTIONALITY =====

class CampusFixApp {
    constructor() {
        this.emergencyMode = false;
        this.availableSlots = 5;
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initEmergencyMode();
        this.initSlotsCounter();
        this.initSmoothScrolling();
        this.initAIDamageScanner();
        this.initQuoteCalculator();
        console.log('CampusFix UENR initialized 🚀');
    }

    // Mobile Menu Functionality
    initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const closeMobileMenu = document.getElementById('closeMobileMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeMobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Emergency Mode Toggle
    initEmergencyMode() {
        const emergencyToggle = document.getElementById('emergencyToggle');
        
        if (emergencyToggle) {
            emergencyToggle.addEventListener('click', () => {
                this.emergencyMode = !this.emergencyMode;
                document.body.classList.toggle('emergency-mode');
                
                if (this.emergencyMode) {
                    emergencyToggle.innerHTML = '<span>🚨</span><span>Normal Mode</span>';
                    emergencyToggle.classList.remove('bg-red-600');
                    emergencyToggle.classList.add('bg-green-600');
                    this.showEmergencyNotification();
                } else {
                    emergencyToggle.innerHTML = '<span>🚨</span><span>Emergency Mode</span>';
                    emergencyToggle.classList.remove('bg-green-600');
                    emergencyToggle.classList.add('bg-red-600');
                }
            });
        }
    }

    showEmergencyNotification() {
        // Create emergency notification
        const notification = document.createElement('div');
        notification.className = 'emergency-notification glass';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-exclamation-triangle text-white"></i>
                </div>
                <div>
                    <p class="font-bold">Emergency Mode Activated</p>
                    <p class="text-sm text-gray-400">We'll prioritize your repair immediately</p>
                </div>
            </div>
            <button class="close-notification text-gray-400 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            padding: 1rem;
            border-radius: 12px;
            max-width: 300px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            animation: slideInRight 0.5s ease-out;
        `;

        document.body.appendChild(notification);

        // Add close functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Slots Counter Functionality
    initSlotsCounter() {
        const slotsCount = document.getElementById('slotsCount');
        const slotsCount2 = document.getElementById('slotsCount2');
        const slotsProgress = document.getElementById('slotsProgress');
        const slotsProgress2 = document.getElementById('slotsProgress2');

        if (!slotsCount) return;

        const updateSlotsDisplay = () => {
            slotsCount.textContent = this.availableSlots;
            if (slotsCount2) slotsCount2.textContent = this.availableSlots;
            
            const progressWidth = (this.availableSlots / 5) * 100;
            if (slotsProgress) slotsProgress.style.width = `${progressWidth}%`;
            if (slotsProgress2) slotsProgress2.style.width = `${progressWidth}%`;
            
            // Change color when slots are low
            if (this.availableSlots <= 2) {
                slotsCount.classList.add('text-red-400');
                if (slotsCount2) slotsCount2.classList.add('text-red-400');
                if (slotsProgress) slotsProgress.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
                if (slotsProgress2) slotsProgress2.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
            }
        };

        // Update slots every 30 seconds to create urgency
        setInterval(() => {
            if (this.availableSlots > 0 && Math.random() > 0.7) {
                this.availableSlots--;
                updateSlotsDisplay();
            }
        }, 30000);

        updateSlotsDisplay();
    }

    // Smooth Scrolling for Navigation
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // AI Damage Scanner
    initAIDamageScanner() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const damagePhoto = document.getElementById('damagePhoto');
        const scanResult = document.getElementById('scanResult');

        if (!fileUploadArea) return;

        fileUploadArea.addEventListener('click', () => {
            damagePhoto.click();
        });

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                this.handleImageUpload(e.dataTransfer.files[0]);
            }
        });

        damagePhoto.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
    }

    handleImageUpload(file) {
        const scanResult = document.getElementById('scanResult');
        
        // Validate file type and size
        if (!file.type.match('image.*')) {
            this.showScanResult('Please upload an image file (JPG, PNG)', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showScanResult('File size must be less than 5MB', 'error');
            return;
        }
        
        // Show scanning animation
        this.showScanResult(`
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 scanning-animation">
                    <i class="fas fa-search text-green-400 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Analyzing Damage...</h3>
                <p class="text-gray-400">Our AI is scanning your photo for damage</p>
            </div>
        `, 'scanning');
        
        // Simulate AI scanning delay
        setTimeout(() => {
            this.generateAIAnalysis();
        }, 3000);
    }

    generateAIAnalysis() {
        const repairs = [
            { type: 'Cracked Screen', cost: 'GH₵220 - GH₵380', time: '1-2 hours' },
            { type: 'Multiple Cracks', cost: 'GH₵280 - GH₵420', time: '2-3 hours' },
            { type: 'LCD Damage', cost: 'GH₵320 - GH₵480', time: '2-3 hours' },
            { type: 'Minor Crack', cost: 'GH₵180 - GH₵250', time: '1 hour' },
            { type: 'Battery Replacement Needed', cost: 'GH₵80 - GH₵150', time: '1 hour' },
            { type: 'Charging Port Issue', cost: 'GH₵50 - GH₵120', time: '1-2 hours' }
        ];
        
        const randomRepair = repairs[Math.floor(Math.random() * repairs.length)];
        
        this.showScanResult(`
            <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-green-400">Damage Analysis Complete</h3>
                    <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-green-400"></i>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Issue Detected:</span>
                        <span class="font-bold">${randomRepair.type}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-400">Estimated Cost:</span>
                        <span class="text-2xl font-bold text-green-400">${randomRepair.cost}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-400">Repair Time:</span>
                        <span class="font-bold">${randomRepair.time}</span>
                    </div>
                </div>
                
                <a href="https://wa.me/233246912468?text=Hi!%20I%20just%20scanned%20my%20phone%20damage%20📸%20Can%20you%20fix%20it%20for%20${encodeURIComponent(randomRepair.cost)}?" 
                   class="w-full mt-6 btn-primary inline-block text-center">
                    <i class="fab fa-whatsapp"></i>
                    Send Photo & Book Repair
                </a>
            </div>
        `, 'success');
    }

    showScanResult(message, type) {
        const scanResult = document.getElementById('scanResult');
        if (!scanResult) return;

        if (type === 'error') {
            scanResult.innerHTML = `
                <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                    <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-red-400 mb-2">Upload Error</h3>
                    <p class="text-gray-400">${message}</p>
                </div>
            `;
        } else {
            scanResult.innerHTML = message;
        }
    }

    // Quote Calculator
    initQuoteCalculator() {
        const quoteForm = document.getElementById('quoteForm');
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');

        if (!quoteForm) return;

        // Price matrix
        const priceMatrix = {
            'iPhone': {
                'Screen': { min: 300, max: 450 },
                'Battery': { min: 120, max: 180 },
                'Charging': { min: 80, max: 150 },
                'Water': { min: 150, max: 500 },
                'Other': { min: 100, max: 300 }
            },
            'Samsung': {
                'Screen': { min: 250, max: 400 },
                'Battery': { min: 100, max: 160 },
                'Charging': { min: 70, max: 130 },
                'Water': { min: 120, max: 450 },
                'Other': { min: 80, max: 250 }
            },
            'OnePlus': {
                'Screen': { min: 280, max: 420 },
                'Battery': { min: 110, max: 170 },
                'Charging': { min: 75, max: 140 },
                'Water': { min: 130, max: 480 },
                'Other': { min: 90, max: 270 }
            },
            'Xiaomi': {
                'Screen': { min: 180, max: 350 },
                'Battery': { min: 80, max: 140 },
                'Charging': { min: 50, max: 120 },
                'Water': { min: 100, max: 400 },
                'Other': { min: 70, max: 220 }
            },
            'Other': {
                'Screen': { min: 200, max: 380 },
                'Battery': { min: 90, max: 160 },
                'Charging': { min: 60, max: 130 },
                'Water': { min: 110, max: 420 },
                'Other': { min: 80, max: 240 }
            }
        };

        const calculateQuote = () => {
            const quoteResult = document.getElementById('quoteResult');
            const estimatedCost = document.getElementById('estimatedCost');
            
            const brand = phoneBrand.value;
            const repair = repairType.value;
            
            if (brand && repair) {
                const price = priceMatrix[brand][repair];
                estimatedCost.textContent = `GH₵${price.min} - GH₵${price.max}`;
                quoteResult.classList.remove('hidden');
            } else {
                quoteResult.classList.add('hidden');
            }
        };

        phoneBrand.addEventListener('change', calculateQuote);
        repairType.addEventListener('change', calculateQuote);

        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const brand = phoneBrand.value;
            const repair = repairType.value;
            
            if (!brand || !repair) {
                alert('Please select both phone brand and repair type');
                return;
            }
            
            const price = priceMatrix[brand][repair];
            const message = `Hi CampusFix! I need a quote for my ${brand} with ${repair} issue. Estimated cost: GH₵${price.min}-GH₵${price.max}`;
            
            window.open(`https://wa.me/233246912468?text=${encodeURIComponent(message)}`, '_blank');
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.campusFixApp = new CampusFixApp();
});
