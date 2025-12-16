// KAG Retirement Project - JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    setupEventListeners();
});

/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    setupNavigation();
}

/**
 * Handle form submission
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    console.log('Form submitted with data:', Object.fromEntries(formData));
    
    // Reset form
    event.target.reset();
    alert('Thank you for your message!');
}

/**
 * Setup smooth scrolling for navigation links
 */
function setupNavigation() {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Utility function to log messages
 * @param {string} message - The message to log
 */
function log(message) {
    console.log(`[KAG] ${message}`);
}
