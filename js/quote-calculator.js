// ================================
// ENHANCED QUOTE CALCULATOR
// ================================

class QuoteCalculator {
    constructor() {
        this.priceMatrix = {
            'iPhone': {
                'Screen': { min: 300, max: 450, time: '3-5 hours' },
                'Battery': { min: 120, max: 180, time: '1-2 hours' },
                'Charging': { min: 80, max: 150, time: '2-3 hours' },
                'Water': { min: 150, max: 500, time: '1-2 days' },
                'Camera': { min: 120, max: 300, time: '2-4 hours' },
                'Software': { min: 40, max: 120, time: '1-2 hours' }
            },
            'Samsung': {
                'Screen': { min: 250, max: 400, time: '3-5 hours' },
                'Battery': { min: 100, max: 160, time: '1-2 hours' },
                'Charging': { min: 70, max: 130, time: '2-3 hours' },
                'Water': { min: 120, max: 450, time: '1-2 days' },
                'Camera': { min: 100, max: 280, time: '2-4 hours' },
                'Software': { min: 40, max: 100, time: '1-2 hours' }
            },
            'Other': {
                'Screen': { min: 200, max: 380, time: '3-5 hours' },
                'Battery': { min: 80, max: 150, time: '1-2 hours' },
                'Charging': { min: 60, max: 120, time: '2-3 hours' },
                'Water': { min: 100, max: 400, time: '1-2 days' },
                'Camera': { min: 90, max: 250, time: '2-4 hours' },
                'Software': { min: 30, max: 90, time: '1-2 hours' }
            }
        };
        
        this.initializeEventListeners();
        this.setupRealTimeUpdates();
    }

    initializeEventListeners() {
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');

        if (phoneBrand && repairType) {
            phoneBrand.addEventListener('change', () => this.updateQuote());
            repairType.addEventListener('change', () => this.updateQuote());
        }

        const quoteForm = document.getElementById('quoteForm');
        if (quoteForm) {
            quoteForm.addEventListener('submit', (e) => this.handleQuoteSubmit(e));
        }
    }

    setupRealTimeUpdates() {
        // Update quote when either field changes
        const inputs = document.querySelectorAll('#phoneBrand, #repairType');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateQuote();
            });
        });
    }

    updateQuote() {
        const phoneBrand = document.getElementById('phoneBrand')?.value;
        const repairType = document.getElementById('repairType')?.value;
        const quoteResult = document.getElementById('quoteResult');
        const estimatedCost = document.getElementById('estimatedCost');

        if (phoneBrand && repairType && this.priceMatrix[phoneBrand]?.[repairType]) {
            const price = this.priceMatrix[phoneBrand][repairType];
            estimatedCost.textContent = `GH₵${price.min} - GH₵${price.max}`;
            
            if (quoteResult) {
                quoteResult.classList.remove('hidden');
                this.animatePriceUpdate();
            }
        } else if (quoteResult) {
            quoteResult.classList.add('hidden');
        }
    }

    animatePriceUpdate() {
        const costElement = document.getElementById('estimatedCost');
        if (costElement) {
            costElement.classList.add('pulse');
            setTimeout(() => {
                costElement.classList.remove('pulse');
            }, 600);
        }
    }

    handleQuoteSubmit(e) {
        e.preventDefault();
        
        const phoneBrand = document.getElementById('phoneBrand')?.value;
        const repairType = document.getElementById('repairType')?.value;
        
        if (!phoneBrand || !repairType) {
            this.showNotification('Please select both phone brand and repair type', 'error');
            return;
        }
        
        const price = this.priceMatrix[phoneBrand]?.[repairType];
        if (!price) {
            this.showNotification('Invalid selection. Please try again.', 'error');
            return;
        }

        const message = this.generateWhatsAppMessage(phoneBrand, repairType, price);
        const whatsappUrl = `https://wa.me/233246912468?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        // Track the quote request
        this.trackQuoteRequest(phoneBrand, repairType, price);
    }

    generateWhatsAppMessage(brand, repair, price) {
        return `📱 *Phone Repair Quote Request - CampusFix UENR*

🔧 *Repair Needed:* ${repair}
📱 *Device Brand:* ${brand}
💰 *Estimated Cost:* GH₵${price.min} - GH₵${price.max}
⏱️ *Estimated Time:* ${price.time}

💬 *Please provide:*
• Your specific device model
• More details about the issue
• Your hostel and room number

📍 *Service Includes:*
✓ Free hostel pickup & delivery
✓ 6 months warranty
✓ Quality parts
✓ Professional service

🎯 *Next Steps:*
1. We'll confirm the exact price
2. Schedule free pickup
3. Repair your device
4. Quality check & delivery

*– CampusFix UENR Repair Team*`;
    }

    trackQuoteRequest(brand, repair, price) {
        // Here you would typically send to analytics
        console.log('Quote requested:', { brand, repair, price });
        
        // You could also save to local storage for analytics
        const quoteHistory = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
        quoteHistory.push({
            brand,
            repair,
            price,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory));
    }

    showNotification(message, type = 'info') {
        if (window.campusFixApp && window.campusFixApp.showNotification) {
            window.campusFixApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Utility method to get popular repairs
    getPopularRepairs() {
        return [
            { brand: 'iPhone', repair: 'Screen', price: 'GH₵300-450' },
            { brand: 'Samsung', repair: 'Screen', price: 'GH₵250-400' },
            { brand: 'iPhone', repair: 'Battery', price: 'GH₵120-180' },
            { brand: 'All', repair: 'Charging Port', price: 'GH₵60-150' },
            { brand: 'All', repair: 'Software', price: 'GH₵30-120' }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteCalculator = new QuoteCalculator();
});