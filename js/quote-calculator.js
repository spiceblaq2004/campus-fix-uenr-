// ===== QUOTE CALCULATOR SYSTEM =====

class QuoteCalculator {
    constructor() {
        this.priceMatrix = {
            'iPhone': {
                'Screen': { min: 300, max: 450, time: '1-2 hours' },
                'Battery': { min: 120, max: 180, time: '1 hour' },
                'Charging': { min: 80, max: 150, time: '1-2 hours' },
                'Water': { min: 150, max: 500, time: '2-4 hours' },
                'Other': { min: 100, max: 300, time: '1-3 hours' }
            },
            'Samsung': {
                'Screen': { min: 250, max: 400, time: '1-2 hours' },
                'Battery': { min: 100, max: 160, time: '1 hour' },
                'Charging': { min: 70, max: 130, time: '1-2 hours' },
                'Water': { min: 120, max: 450, time: '2-4 hours' },
                'Other': { min: 80, max: 250, time: '1-3 hours' }
            },
            'OnePlus': {
                'Screen': { min: 280, max: 420, time: '1-2 hours' },
                'Battery': { min: 110, max: 170, time: '1 hour' },
                'Charging': { min: 75, max: 140, time: '1-2 hours' },
                'Water': { min: 130, max: 480, time: '2-4 hours' },
                'Other': { min: 90, max: 270, time: '1-3 hours' }
            },
            'Xiaomi': {
                'Screen': { min: 180, max: 350, time: '1-2 hours' },
                'Battery': { min: 80, max: 140, time: '1 hour' },
                'Charging': { min: 50, max: 120, time: '1-2 hours' },
                'Water': { min: 100, max: 400, time: '2-4 hours' },
                'Other': { min: 70, max: 220, time: '1-3 hours' }
            },
            'Tecno': {
                'Screen': { min: 150, max: 280, time: '1-2 hours' },
                'Battery': { min: 70, max: 120, time: '1 hour' },
                'Charging': { min: 40, max: 100, time: '1-2 hours' },
                'Water': { min: 80, max: 300, time: '2-4 hours' },
                'Other': { min: 60, max: 180, time: '1-3 hours' }
            },
            'Infinix': {
                'Screen': { min: 160, max: 290, time: '1-2 hours' },
                'Battery': { min: 75, max: 130, time: '1 hour' },
                'Charging': { min: 45, max: 110, time: '1-2 hours' },
                'Water': { min: 90, max: 320, time: '2-4 hours' },
                'Other': { min: 65, max: 190, time: '1-3 hours' }
            },
            'Huawei': {
                'Screen': { min: 220, max: 380, time: '1-2 hours' },
                'Battery': { min: 95, max: 150, time: '1 hour' },
                'Charging': { min: 65, max: 125, time: '1-2 hours' },
                'Water': { min: 110, max: 420, time: '2-4 hours' },
                'Other': { min: 85, max: 240, time: '1-3 hours' }
            },
            'Other': {
                'Screen': { min: 200, max: 380, time: '1-2 hours' },
                'Battery': { min: 90, max: 160, time: '1 hour' },
                'Charging': { min: 60, max: 130, time: '1-2 hours' },
                'Water': { min: 110, max: 420, time: '2-4 hours' },
                'Other': { min: 80, max: 240, time: '1-3 hours' }
            }
        };

        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.populatePhoneModels();
        console.log('Quote Calculator initialized 💰');
    }

    initializeEventListeners() {
        const quoteForm = document.getElementById('quoteForm');
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');

        if (quoteForm && phoneBrand && repairType) {
            phoneBrand.addEventListener('change', () => {
                this.calculateQuote();
                this.populatePhoneModels();
            });

            repairType.addEventListener('change', () => {
                this.calculateQuote();
            });

            quoteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuoteRequest();
            });
        }
    }

    populatePhoneModels() {
        const phoneBrand = document.getElementById('phoneBrand');
        const phoneModel = document.getElementById('phoneModel');
        
        if (!phoneBrand || !phoneModel) return;

        const brand = phoneBrand.value;
        const models = this.getPhoneModels(brand);
        
        // Clear existing options except the first one
        phoneModel.innerHTML = '<option value="">Select your phone model</option>';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            phoneModel.appendChild(option);
        });
    }

    getPhoneModels(brand) {
        const models = {
            'iPhone': [
                'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 15 Plus',
                'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 14 Plus',
                'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
                'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
                'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone SE (2022)'
            ],
            'Samsung': [
                'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S22 Ultra',
                'Galaxy S22+', 'Galaxy S22', 'Galaxy S21 Ultra', 'Galaxy S21+',
                'Galaxy S21', 'Galaxy A54', 'Galaxy A34', 'Galaxy A14',
                'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy Note 20 Ultra'
            ],
            'OnePlus': [
                'OnePlus 11', 'OnePlus 11R', 'OnePlus 10 Pro', 'OnePlus 10T',
                'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9RT', 'OnePlus 8 Pro',
                'OnePlus Nord 3', 'OnePlus Nord CE 3', 'OnePlus Nord 2T'
            ],
            'Xiaomi': [
                'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 12 Pro', 'Xiaomi 12',
                'Xiaomi 11T Pro', 'Xiaomi 11T', 'Redmi Note 12 Pro', 'Redmi Note 12',
                'Redmi Note 11', 'Redmi 12', 'Poco F5', 'Poco X5 Pro'
            ],
            'Tecno': [
                'Tecno Phantom V Fold', 'Tecno Phantom X2', 'Tecno Camon 20',
                'Tecno Spark 10', 'Tecno Pova 4', 'Tecno Pop 7'
            ],
            'Infinix': [
                'Infinix Zero 30', 'Infinix Note 30', 'Infinix Hot 30',
                'Infinix Smart 7', 'Infinix GT 10 Pro'
            ],
            'Huawei': [
                'Huawei P60 Pro', 'Huawei P50 Pro', 'Huawei Mate 50 Pro',
                'Huawei Nova 11', 'Huawei Enjoy 50'
            ],
            'Other': [
                'Google Pixel 7 Pro', 'Google Pixel 7', 'Google Pixel 6a',
                'Nokia G42', 'Nokia C32', 'Oppo Reno 10', 'Oppo A78',
                'Vivo V29', 'Vivo Y36', 'Realme 11 Pro', 'Realme Narzo 60'
            ]
        };

        return models[brand] || ['Select brand first'];
    }

    calculateQuote() {
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');
        const quoteResult = document.getElementById('quoteResult');
        const estimatedCost = document.getElementById('estimatedCost');
        const repairTime = document.getElementById('repairTime');
        
        if (!phoneBrand || !repairType || !quoteResult) return;

        const brand = phoneBrand.value;
        const repair = repairType.value;
        
        if (brand && repair && this.priceMatrix[brand] && this.priceMatrix[brand][repair]) {
            const price = this.priceMatrix[brand][repair];
            estimatedCost.textContent = `GH₵${price.min} - GH₵${price.max}`;
            
            if (repairTime) {
                repairTime.textContent = price.time;
            }
            
            quoteResult.classList.remove('hidden');
            
            // Add animation for price update
            quoteResult.classList.add('pulse-glow');
            setTimeout(() => {
                quoteResult.classList.remove('pulse-glow');
            }, 1000);
        } else {
            quoteResult.classList.add('hidden');
        }
    }

    submitQuoteRequest() {
        const phoneBrand = document.getElementById('phoneBrand');
        const phoneModel = document.getElementById('phoneModel');
        const repairType = document.getElementById('repairType');
        
        if (!phoneBrand || !repairType) return;

        const brand = phoneBrand.value;
        const model = phoneModel ? phoneModel.value : '';
        const repair = repairType.value;
        
        if (!brand || !repair) {
            this.showNotification('Please select both phone brand and repair type', 'error');
            return;
        }

        if (!this.priceMatrix[brand] || !this.priceMatrix[brand][repair]) {
            this.showNotification('Invalid selection. Please try again.', 'error');
            return;
        }

        const price = this.priceMatrix[brand][repair];
        const modelText = model ? ` ${model}` : '';
        const message = `Hi CampusFix! I need a repair quote for my${modelText} ${brand} with ${repair} issue. Estimated cost: GH₵${price.min}-GH₵${price.max} (${price.time})`;
        
        // Open WhatsApp with pre-filled message
        window.open(`https://wa.me/233246912468?text=${encodeURIComponent(message)}`, '_blank');
        
        this.showNotification('Opening WhatsApp with your quote details...', 'success');
    }

    quickQuote(brand, repair) {
        if (this.priceMatrix[brand] && this.priceMatrix[brand][repair]) {
            const price = this.priceMatrix[brand][repair];
            return {
                cost: `GH₵${price.min} - GH₵${price.max}`,
                time: price.time
            };
        }
        return null;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        notification.style.cssText = `
            animation: slideInRight 0.5s ease-out;
            max-width: 90%;
            text-align: center;
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 500);
            }
        }, 4000);
    }

    // Method to get all services for a brand
    getServicesForBrand(brand) {
        if (this.priceMatrix[brand]) {
            return Object.keys(this.priceMatrix[brand]).map(service => ({
                service,
                ...this.priceMatrix[brand][service]
            }));
        }
        return [];
    }

    // Method to compare prices across brands
    comparePrices(repairType) {
        const comparison = [];
        
        Object.keys(this.priceMatrix).forEach(brand => {
            if (this.priceMatrix[brand][repairType]) {
                comparison.push({
                    brand,
                    ...this.priceMatrix[brand][repairType]
                });
            }
        });

        // Sort by minimum price
        return comparison.sort((a, b) => a.min - b.min);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteCalculator = new QuoteCalculator();
});

// Global function for quick price checks (can be called from console)
function getQuickQuote(brand, repair) {
    if (window.quoteCalculator) {
        return window.quoteCalculator.quickQuote(brand, repair);
    }
    return null;
}