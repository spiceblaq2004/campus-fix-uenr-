// ================================
// MAIN WEBSITE FUNCTIONALITY
// ================================

class CampusFixApp {
    constructor() {
        this.emergencyMode = false;
        this.availableSlots = 5;
        this.initializeApp();
    }

    initializeApp() {
        this.initializeMobileMenu();
        this.initializeEmergencyToggle();
        this.initializeSlotsCounter();
        this.initializeSmoothScrolling();
        this.initializeAIDamageScanner();
        this.initializeQuoteCalculator();
    }

    // Mobile Menu Functionality
    initializeMobileMenu() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const closeMobileMenu = document.getElementById('closeMobileMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('open');
        });

        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
            });
        });
    }

    // Emergency Mode Toggle
    initializeEmergencyToggle() {
        const emergencyToggle = document.getElementById('emergencyToggle');

        emergencyToggle.addEventListener('click', () => {
            this.emergencyMode = !this.emergencyMode;
            document.body.classList.toggle('emergency-mode');
            
            if (this.emergencyMode) {
                emergencyToggle.innerHTML = '<span>🚨</span><span>Normal Mode</span>';
                emergencyToggle.style.background = '#22C55E';
            } else {
                emergencyToggle.innerHTML = '<span>🚨</span><span>Emergency Mode</span>';
                emergencyToggle.style.background = '#DC2626';
            }
        });
    }

    // Slots Counter Functionality
    initializeSlotsCounter() {
        const slotsCount = document.getElementById('slotsCount');
        const slotsCount2 = document.getElementById('slotsCount2');
        const slotsProgress = document.getElementById('slotsProgress');
        const slotsProgress2 = document.getElementById('slotsProgress2');

        // Update slots every 30 seconds
        setInterval(() => {
            this.updateSlots(slotsCount, slotsCount2, slotsProgress, slotsProgress2);
        }, 30000);
    }

    updateSlots(slotsCount, slotsCount2, slotsProgress, slotsProgress2) {
        // Randomly decrease slots occasionally to create urgency
        if (this.availableSlots > 0 && Math.random() > 0.7) {
            this.availableSlots--;
            
            slotsCount.textContent = this.availableSlots;
            slotsCount2.textContent = this.availableSlots;
            
            const progressWidth = (this.availableSlots / 5) * 100;
            slotsProgress.style.width = `${progressWidth}%`;
            slotsProgress2.style.width = `${progressWidth}%`;
            
            // Change color when slots are low
            if (this.availableSlots <= 2) {
                slotsCount.classList.add('text-red');
                slotsCount2.classList.add('text-red');
                slotsProgress.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
                slotsProgress2.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
            }
        }
    }

    // Smooth Scrolling
    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // AI Damage Scanner
    initializeAIDamageScanner() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const damagePhoto = document.getElementById('damagePhoto');
        const scanResult = document.getElementById('scanResult');

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
                this.handleImageUpload(e.dataTransfer.files[0], scanResult);
            }
        });

        damagePhoto.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleImageUpload(e.target.files[0], scanResult);
            }
        });
    }

    handleImageUpload(file, scanResult) {
        // Validate file type and size
        if (!file.type.match('image.*')) {
            this.showScanResult('Please upload an image file (JPG, PNG)', 'error', scanResult);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showScanResult('File size must be less than 5MB', 'error', scanResult);
            return;
        }
        
        // Show scanning animation
        this.showScanResult(`
            <div class="scanning-content">
                <div class="scanning-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Analyzing Damage...</h3>
                <p>Our AI is scanning your photo for damage</p>
            </div>
        `, 'scanning', scanResult);
        
        // Simulate AI scanning delay
        setTimeout(() => {
            this.generateScanResult(scanResult);
        }, 3000);
    }

    generateScanResult(scanResult) {
        // Generate random estimate based on common repairs
        const repairs = [
            { type: 'Cracked Screen', cost: 'GH₵220 - GH₵380', time: '1-2 hours' },
            { type: 'Multiple Cracks', cost: 'GH₵280 - GH₵420', time: '2-3 hours' },
            { type: 'LCD Damage', cost: 'GH₵320 - GH₵480', time: '2-3 hours' },
            { type: 'Minor Crack', cost: 'GH₵180 - GH₵250', time: '1 hour' }
        ];
        
        const randomRepair = repairs[Math.floor(Math.random() * repairs.length)];
        
        this.showScanResult(`
            <div class="scan-result-success">
                <div class="result-header">
                    <h3>Damage Analysis Complete</h3>
                    <div class="success-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="result-item">
                        <span>Issue Detected:</span>
                        <span>${randomRepair.type}</span>
                    </div>
                    
                    <div class="result-item">
                        <span>Estimated Cost:</span>
                        <span class="result-cost">${randomRepair.cost}</span>
                    </div>
                    
                    <div class="result-item">
                        <span>Repair Time:</span>
                        <span>${randomRepair.time}</span>
                    </div>
                </div>
                
                <a href="https://wa.me/233246912468?text=Hi!%20I%20just%20scanned%20my%20phone%20damage%20📸%20Can%20you%20fix%20it%20for%20${encodeURIComponent(randomRepair.cost)}?" 
                   class="btn-primary btn-full">
                    <i class="fab fa-whatsapp"></i>
                    Send Photo & Book Repair
                </a>
            </div>
        `, 'success', scanResult);
    }

    showScanResult(message, type, scanResult) {
        if (type === 'error') {
            scanResult.innerHTML = `
                <div class="scan-result-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Upload Error</h3>
                    <p>${message}</p>
                </div>
            `;
        } else {
            scanResult.innerHTML = message;
        }
    }

    // Quote Calculator
    initializeQuoteCalculator() {
        const quoteForm = document.getElementById('quoteForm');
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');
        const quoteResult = document.getElementById('quoteResult');
        const estimatedCost = document.getElementById('estimatedCost');

        // Price matrix for different phone brands and repairs
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
