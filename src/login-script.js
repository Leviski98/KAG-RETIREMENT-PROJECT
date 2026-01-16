/**
 * KAG Retirement Project - Login Page Script
 * Handles login functionality, form validation, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

/**
 * Initialize login page functionality
 */
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Form submission
    loginForm.addEventListener('submit', handleLoginSubmit);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    // Real-time validation
    setupRealTimeValidation();

    // Password reveal on focus
    passwordInput.addEventListener('focus', function() {
        addFocusClass(this);
    });

    passwordInput.addEventListener('blur', function() {
        removeFocusClass(this);
    });

    log('Login page initialized');
}

/**
 * Handle form submission
 * @param {Event} event - The form submit event
 */
function handleLoginSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="rememberMe"]').checked;

    // Validate inputs
    if (!validateInputs(username, password)) {
        return;
    }

    // Disable button during submission
    const submitButton = event.target.querySelector('.login-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    // Simulate API call
    simulateLogin(username, password, rememberMe)
        .then(response => {
            showAlert('Login successful!', 'success');
            log(`User ${username} logged in successfully`);
            
            // Store user session
            sessionStorage.setItem('kag_user', username);
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Redirect after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch(error => {
            showAlert(error.message, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
            log(`Login failed: ${error.message}`);
        });
}

/**
 * Validate username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInputs(username, password) {
    // Username validation
    if (username.length === 0) {
        showAlert('Please enter your username', 'error');
        return false;
    }

    if (username.length < 3) {
        showAlert('Username must be at least 3 characters long', 'error');
        return false;
    }

    // Password validation
    if (password.length === 0) {
        showAlert('Please enter your password', 'error');
        return false;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return false;
    }

    return true;
}

/**
 * Toggle password visibility
 * @param {HTMLElement} passwordInput - The password input element
 * @param {HTMLElement} toggleButton - The toggle button element
 */
function togglePasswordVisibility(passwordInput, toggleButton) {
    const isPassword = passwordInput.type === 'password';
    
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleButton.textContent = isPassword ? '🙈' : '👁️';
    toggleButton.style.transform = 'scale(1.3)';
    
    setTimeout(() => {
        toggleButton.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Setup real-time validation for form inputs
 */
function setupRealTimeValidation() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    usernameInput.addEventListener('input', function() {
        validateUsername(this.value);
    });

    passwordInput.addEventListener('input', function() {
        validatePassword(this.value);
    });
}

/**
 * Validate username in real-time
 * @param {string} username - The username to validate
 */
function validateUsername(username) {
    const minLength = 3;
    const isValid = username.length >= minLength;
    
    updateInputValidationStyle(document.getElementById('username'), isValid && username.length > 0);
}

/**
 * Validate password in real-time
 * @param {string} password - The password to validate
 */
function validatePassword(password) {
    const minLength = 6;
    const isValid = password.length >= minLength;
    
    updateInputValidationStyle(document.getElementById('password'), isValid && password.length > 0);
}

/**
 * Update input validation style
 * @param {HTMLElement} input - The input element
 * @param {boolean} isValid - Whether the input is valid
 */
function updateInputValidationStyle(input, isValid) {
    if (isValid) {
        input.style.borderColor = '#4caf50';
        input.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.2)';
    } else if (input.value.length > 0) {
        input.style.borderColor = '#f44336';
        input.style.boxShadow = '0 0 15px rgba(244, 67, 54, 0.2)';
    } else {
        input.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        input.style.boxShadow = 'none';
    }
}

/**
 * Simulate login API call
 * @param {string} username - The username
 * @param {string} password - The password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise} - A promise that resolves on success or rejects on failure
 */
function simulateLogin(username, password, rememberMe) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Fixed credentials: username 'KAG' and password 'KAGadmin123'
            if (username === 'KAG' && password === 'KAGadmin123') {
                resolve({ username, rememberMe });
            } else if (username.length < 3) {
                reject(new Error('Invalid username format'));
            } else if (password.length < 6) {
                reject(new Error('Invalid password format'));
            } else {
                reject(new Error('Invalid credentials. Please use the correct username and password.'));
            }
        }, 800);
    });
}

/**
 * Show alert message
 * @param {string} message - The alert message
 * @param {string} type - The alert type ('success' or 'error')
 */
function showAlert(message, type = 'error') {
    const form = document.getElementById('loginForm');
    
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.animation = 'slideDown 0.3s ease-out';

    form.insertBefore(alert, form.firstChild);

    // Auto-remove error alerts after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }
}

/**
 * Add focus class to input
 * @param {HTMLElement} input - The input element
 */
function addFocusClass(input) {
    input.parentElement.style.background = 'rgba(102, 126, 234, 0.15)';
}

/**
 * Remove focus class from input
 * @param {HTMLElement} input - The input element
 */
function removeFocusClass(input) {
    if (input.value.length === 0) {
        input.parentElement.style.background = 'transparent';
    }
}

/**
 * Utility function for logging
 * @param {string} message - The message to log
 */
function log(message) {
    console.log(`[KAG Login] ${message}`);
}

/**
 * Initialize with remembered username if available
 */
window.addEventListener('load', function() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        document.getElementById('username').value = rememberedUsername;
        document.querySelector('input[name="rememberMe"]').checked = true;
        log(`Remembered username: ${rememberedUsername}`);
    }
});
