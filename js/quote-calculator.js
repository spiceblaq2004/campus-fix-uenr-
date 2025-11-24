// ================================
// QUOTE CALCULATOR FUNCTIONALITY
// ================================

class QuoteCalculator {
    constructor() {
        this.priceMatrix = {
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
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const quoteForm = document.getElementById('quoteForm');
        const phoneBrand = document.getElementById('phoneBrand');
        const repairType = document.getElementById('repairType');

        phoneBrand.addEventListener('change', () => this.calculateQuote());
        repairType.addEventListener('change', () => this.calculateQuote());

        quoteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    calculateQuote() {
        const phoneBrand = document.getElementById('phoneBrand').value;
        const repairType = document.getElementById('repairType').value;
        const quoteResult = document.getElementById('quoteResult');
        const estimatedCost = document.getElementById('estimatedCost');
        
        if (phoneBrand && repairType) {
            const price = this.priceMatrix[phoneBrand][repairType];
            estimatedCost.textContent = `GH₵${price.min} - GH₵${price.max}`;
            quoteResult.classList.remove('hidden');
        } else {
            quoteResult.classList.add('hidden');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const phoneBrand = document.getElementById('phoneBrand').value;
        const repairType = document.getElementById('repairType').value;
        
        if (!phoneBrand || !repairType) {
            alert('Please select both phone brand and repair type');
            return;
        }
        
        const price = this.priceMatrix[phoneBrand][repairType];
        const message = `Hi CampusFix! I need a quote for my ${phoneBrand} with ${repairType} issue. Estimated cost: GH₵${price.min}-GH₵${price.max}`;
        
        window.open(`https://wa.me/233246912468?text=${encodeURIComponent(message)}`, '_blank');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteCalculator = new QuoteCalculator();
});