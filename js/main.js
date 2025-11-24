// ================================
// ENHANCED MAIN FUNCTIONALITY
// ================================

class CampusFixApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAnimations();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.hideLoading();
    }

    setupNavigation() {
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Active navigation based on scroll position
        this.setupActiveNavigation();
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    setupAnimations() {
        // Initialize scroll animations
        this.initScrollAnimations();
        
        // Add hover effects
        this.setupHoverEffects();
        
        // Setup loading animations
        this.setupLoadingAnimations();
    }

    initScrollAnimations() {
        const scrollElements = document.querySelectorAll('.scroll-reveal');

        const elementInView = (el, dividend = 1) => {
            const elementTop = el.getBoundingClientRect().top;
            return (
                elementTop <=
                (window.innerHeight || document.documentElement.clientHeight) / dividend
            );
        };

        const displayScrollElement = (element) => {
            element.classList.add('visible');
        };

        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (elementInView(el, 1.25)) {
                    displayScrollElement(el);
                }
            });
        };

        window.addEventListener('scroll', () => {
            handleScrollAnimation();
        });

        // Initial check
        handleScrollAnimation();
    }

    setupHoverEffects() {
        // Add hover effects to service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Add click effects to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
                button.style.animation = 'buttonClick 0.3s ease';
                setTimeout(() => {
                    button.style.animation = '';
                }, 300);
            });
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    setupEventListeners() {
        // WhatsApp button tracking
        const whatsappButtons = document.querySelectorAll('[href*="wa.me"]');
        whatsappButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('whatsapp_click', 'Contact');
            });
        });

        // Phone call tracking
        const phoneButtons = document.querySelectorAll('[href^="tel:"]');
        phoneButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('phone_click', 'Contact');
            });
        });

        // Form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        });

        // Demo order buttons
        const demoButtons = document.querySelectorAll('.demo-btn');
        demoButtons.forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.getAttribute('data-order');
                document.getElementById('orderIdInput').value = orderId;
                if (window.liveTracker) {
                    window.liveTracker.trackOrder();
                }
            });
        });
    }

    trackEvent(action, category) {
        // Here you would typically send to Google Analytics
        console.log('Event tracked:', action, category);
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Add loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitButton.disabled = true;

        // Simulate form processing
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            this.showNotification('Form submitted successfully!', 'success');
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    setupScrollEffects() {
        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
        });

        // Parallax effect for hero background
        this.setupParallax();
    }

    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-bg-shape');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupLoadingAnimations() {
        // Add loading states for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('globalLoading');
        if (loadingSpinner) {
            setTimeout(() => {
                loadingSpinner.classList.add('hidden');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (loadingSpinner.parentNode) {
                        loadingSpinner.parentNode.removeChild(loadingSpinner);
                    }
                }, 500);
            }, 1000);
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.campusFixApp = new CampusFixApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page became visible
        if (window.campusFixApp) {
            window.campusFixApp.initScrollAnimations();
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampusFixApp;
}