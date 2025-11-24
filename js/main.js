// ================================
// MAIN WEBSITE FUNCTIONALITY (Simplified)
// ================================

class CampusFixApp {
    constructor() {
        this.availableSlots = 5;
        this.initializeApp();
    }

    initializeApp() {
        this.initializeMobileMenu();
        this.initializeSlotsCounter();
        this.initializeSmoothScrolling();
        this.initializeQuoteCalculator();
        this.initializeFAQ();
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

    // Slots Counter Functionality
    initializeSlotsCounter() {
        const slotsCount = document.getElementById('slotsCount');
        const slotsProgress = document.getElementById('slotsProgress');

        // Update slots every 30 seconds
        setInterval(() => {
            this.updateSlots(slotsCount, slotsProgress);
        }, 30000);
    }

    updateSlots(slotsCount, slotsProgress) {
        // Randomly decrease slots occasionally to create urgency
        if (this.availableSlots > 0 && Math.random() > 0.7) {
            this.availableSlots--;
            
            slotsCount.textContent = this.availableSlots;
            
            const progressWidth = (this.availableSlots / 5) * 100;
            slotsProgress.style.width = `${progressWidth}%`;
            
            // Change color when slots are low
            if (this.availableSlots <= 2) {
                slotsCount.classList.add('text-red');
                slotsProgress.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
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

    // FAQ Functionality
    initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }

    // Quote Calculator (simplified)
    initializeQuoteCalculator() {
        // This will be handled by quote-calculator.js
        console.log('Quote calculator ready');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.campusFixApp = new CampusFixApp();
});