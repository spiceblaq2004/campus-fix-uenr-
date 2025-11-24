// ================================
// MAIN WEBSITE FUNCTIONALITY (Enhanced with Animations)
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
        this.initializeScrollAnimations();
        this.initializeParticleEffects();
        this.initializeScrollProgress();
    }

    // Mobile Menu Functionality
    initializeMobileMenu() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const closeMobileMenu = document.getElementById('closeMobileMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            this.animateMobileMenuItems();
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

    // Animate mobile menu items with stagger
    animateMobileMenuItems() {
        const menuItems = document.querySelectorAll('.mobile-nav .nav-link');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('slide-in-up-stagger');
        });
    }

    // Slots Counter Functionality
    initializeSlotsCounter() {
        const slotsCount = document.getElementById('slotsCount');
        const slotsProgress = document.getElementById('slotsProgress');

        // Animate initial count
        this.animateCount(slotsCount, 5, 2000);

        // Update slots every 30 seconds
        setInterval(() => {
            this.updateSlots(slotsCount, slotsProgress);
        }, 30000);
    }

    // Animate number counting
    animateCount(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const updateCount = () => {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        };
        
        updateCount();
    }

    updateSlots(slotsCount, slotsProgress) {
        if (this.availableSlots > 0 && Math.random() > 0.7) {
            this.availableSlots--;
            
            // Animate the count decrease
            this.animateCountDecrease(slotsCount, this.availableSlots + 1, this.availableSlots, 500);
            
            const progressWidth = (this.availableSlots / 5) * 100;
            slotsProgress.style.width = `${progressWidth}%`;
            
            // Add shake animation when slots are low
            if (this.availableSlots <= 2) {
                slotsCount.classList.add('text-red', 'error-shake');
                slotsProgress.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
                
                // Remove shake class after animation
                setTimeout(() => {
                    slotsCount.classList.remove('error-shake');
                }, 500);
            }
        }
    }

    animateCountDecrease(element, start, end, duration) {
        let current = start;
        const decrement = (start - end) / (duration / 16);
        
        const updateCount = () => {
            current -= decrement;
            if (current > end) {
                element.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = end;
            }
        };
        
        updateCount();
    }

    // Smooth Scrolling with enhanced animations
    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Add bounce animation to target section
                    targetElement.classList.add('bounce-in');
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });

                    // Remove animation class after completion
                    setTimeout(() => {
                        targetElement.classList.remove('bounce-in');
                    }, 800);
                }
            });
        });
    }

    // FAQ Functionality with enhanced animations
    initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Add click animation
                item.classList.add('fade-in-scale');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                
                // Remove animation class
                setTimeout(() => {
                    item.classList.remove('fade-in-scale');
                }, 300);
            });
        });
    }

    // Scroll Animations for sections
    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-entrance', 'visible');
                    
                    // Add staggered animations for child elements
                    const staggerElements = entry.target.querySelectorAll('.stagger-list > *, .service-card, .feature-item, .process-step');
                    staggerElements.forEach((element, index) => {
                        element.style.animationDelay = `${index * 0.1}s`;
                        element.classList.add('slide-in-up-stagger');
                    });
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('section-entrance');
            observer.observe(section);
        });
    }

    // Particle Effects for hero section
    initializeParticleEffects() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        // Create particles on mouse move
        heroSection.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.7) { // Only create particles sometimes
                this.createParticle(e.clientX, e.clientY);
            }
        });

        // Create some initial particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createRandomParticle();
            }, i * 500);
        }
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random size and color
        const size = Math.random() * 6 + 2;
        const colors = ['#00D8A7', '#7C3AED', '#F59E0B', '#3B82F6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }

    createRandomParticle() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        this.createParticle(x, y);
    }

    // Scroll Progress Indicator
    initializeScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Quote Calculator (simplified)
    initializeQuoteCalculator() {
        console.log('Quote calculator ready');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.campusFixApp = new CampusFixApp();
    
    // Add loading animation to page
    document.body.classList.add('loaded');
});

// Add some utility animation functions
window.animateCSS = (element, animation, prefix = 'animate__') => {
    return new Promise((resolve) => {
        const animationName = `${prefix}${animation}`;
        const node = typeof element === 'string' ? document.querySelector(element) : element;

        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
};