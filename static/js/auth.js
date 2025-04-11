/**
 * Free Thinkers - Authentication Module
 */

class AuthManager {
  constructor() {
    console.log('AuthManager initializing...');
    this.isAuthenticated = false;
    this.isGuest = false;
    this.username = null;
    this.initEventListeners();
    this.checkAuthStatus();
    console.log('AuthManager initialization complete');
  }

  initEventListeners() {
    console.log('Setting up event listeners...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, getting elements...');
      // Get DOM elements (support both naming conventions)
      this.authButton = document.getElementById('auth-button') || document.getElementById('authButton');
      this.userDropdown = document.getElementById('user-dropdown') || document.getElementById('userDropdown');
      this.usernameElement = document.getElementById('username');
      this.loginForm = document.getElementById('login-form') || document.getElementById('loginForm');
      this.registerForm = document.getElementById('register-form') || document.getElementById('registerForm');
      this.logoutLink = document.getElementById('logout-link') || document.getElementById('logoutLink');
      this.showRegisterModal = document.getElementById('show-register-modal') || document.getElementById('showRegisterModal');
      this.showLoginModal = document.getElementById('show-login-modal') || document.getElementById('showLoginModal');
      this.continueAsGuest = document.getElementById('continue-as-guest') || document.getElementById('continueAsGuest');
      this.loginError = document.getElementById('login-error') || document.getElementById('loginError');
      this.registerError = document.getElementById('register-error') || document.getElementById('registerError');

      console.log('Auth elements found:', {
        authButton: !!this.authButton,
        userDropdown: !!this.userDropdown,
        loginForm: !!this.loginForm,
        registerForm: !!this.registerForm
      });

      // Add event listeners
      if (this.authButton) {
        console.log('Adding click handler to auth button');
        this.authButton.addEventListener('click', () => {
          console.log('Auth button clicked, showing login modal');
          const loginModal = new bootstrap.Modal(document.getElementById('login-modal') || document.getElementById('loginModal'));
          loginModal.show();
        });
      }

      if (this.showRegisterModal) {
        this.showRegisterModal.addEventListener('click', (e) => {
          e.preventDefault();
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal') || document.getElementById('loginModal'));
          const registerModal = new bootstrap.Modal(document.getElementById('register-modal') || document.getElementById('registerModal'));
          loginModal.hide();
          registerModal.show();
        });
      }

      if (this.showLoginModal) {
        this.showLoginModal.addEventListener('click', (e) => {
          e.preventDefault();
          const registerModal = bootstrap.Modal.getInstance(document.getElementById('register-modal') || document.getElementById('registerModal'));
          const loginModal = new bootstrap.Modal(document.getElementById('login-modal') || document.getElementById('loginModal'));
          registerModal.hide();
          loginModal.show();
        });
      }

      if (this.continueAsGuest) {
        this.continueAsGuest.addEventListener('click', (e) => {
          e.preventDefault();
          this.createGuestSession();
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal') || document.getElementById('loginModal'));
          loginModal.hide();
        });
      }

      if (this.loginForm) {
        console.log('Adding submit handler to login form');
        this.loginForm.addEventListener('submit', (e) => {
          console.log('Login form submitted');
          e.preventDefault();
          const username = document.getElementById('login-username') || document.getElementById('loginUsername');
          const password = document.getElementById('login-password') || document.getElementById('loginPassword');
          const remember = document.getElementById('remember-me') || document.getElementById('rememberMe');
          console.log('Logging in with username:', username.value);
          this.login(username.value, password.value, remember.checked);
        });
      }

      if (this.registerForm) {
        this.registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = document.getElementById('register-username') || document.getElementById('registerUsername');
          const email = document.getElementById('register-email') || document.getElementById('registerEmail');
          const password = document.getElementById('register-password') || document.getElementById('registerPassword');
          const confirmPassword = document.getElementById('confirm-password') || document.getElementById('confirmPassword');
          const acceptTerms = document.getElementById('accept-terms') || document.getElementById('acceptTerms');
          
          // Basic validation
          if (password.value !== confirmPassword.value) {
            this.registerError.textContent = 'Passwords do not match';
            this.registerError.style.display = 'block';
            return;
          }
          
          if (!acceptTerms.checked) {
            this.registerError.textContent = 'You must accept the Terms of Service';
            this.registerError.style.display = 'block';
            return;
          }
          
          this.register(username.value, email.value, password.value);
        });
      }

      if (this.logoutLink) {
        this.logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    });
  }

  // Check authentication status
  checkAuthStatus() {
    console.log('Checking authentication status...');
    fetch('/api/auth/session')
      .then(response => response.json())
      .then(data => {
        console.log('Auth status response:', data);
        if (data.authenticated) {
          // User is authenticated
          this.isAuthenticated = true;
          this.isGuest = false;
          this.username = data.username;
          this.showAuthenticatedUI();
        } else if (data.is_guest) {
          // User is in guest mode
          this.isAuthenticated = false;
          this.isGuest = true;
          this.showGuestUI();
        } else {
          // User is not authenticated at all
          this.isAuthenticated = false;
          this.isGuest = false;
          this.showUnauthenticatedUI();
        }
      })
      .catch(error => {
        console.error('Error checking auth status:', error);
        this.showUnauthenticatedUI();
      });
  }

  // Login function
  login(username, password, remember) {
    console.log('Logging in with username:', username);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        remember: remember
      })
    })
    .then(response => {
      console.log('Login response:', response);
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Login failed');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful:', data);
      // Success - update UI and close modal
      this.isAuthenticated = true;
      this.isGuest = false;
      this.username = data.username;
      this.showAuthenticatedUI();
      
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal') || document.getElementById('loginModal'));
      if (loginModal) loginModal.hide();
      
      if (this.loginForm) this.loginForm.reset();
      if (this.loginError) this.loginError.style.display = 'none';
      
      this.showNotification('Login successful', 'success');
    })
    .catch(error => {
      console.error('Error logging in:', error);
      // Show error message
      if (this.loginError) {
        this.loginError.textContent = error.message;
        this.loginError.style.display = 'block';
      }
    });
  }

  // Register function
  register(username, email, password) {
    console.log('Registering with username:', username);
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    })
    .then(response => {
      console.log('Register response:', response);
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Registration failed');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Registration successful:', data);
      // Success - show login modal
      const registerModal = bootstrap.Modal.getInstance(document.getElementById('register-modal') || document.getElementById('registerModal'));
      const loginModal = new bootstrap.Modal(document.getElementById('login-modal') || document.getElementById('loginModal'));
      
      if (registerModal) registerModal.hide();
      if (this.registerForm) this.registerForm.reset();
      if (this.registerError) this.registerError.style.display = 'none';
      
      this.showNotification('Registration successful! Please log in.', 'success');
      loginModal.show();
    })
    .catch(error => {
      console.error('Error registering:', error);
      // Show error message
      if (this.registerError) {
        this.registerError.textContent = error.message;
        this.registerError.style.display = 'block';
      }
    });
  }

  // Logout function
  logout() {
    console.log('Logging out...');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Logout response:', data);
      // Show unauthenticated UI
      this.isAuthenticated = false;
      this.isGuest = false;
      this.username = null;
      this.showUnauthenticatedUI();
      this.showNotification('You have been logged out', 'info');
    })
    .catch(error => {
      console.error('Error logging out:', error);
    });
  }

  // Create guest session
  createGuestSession() {
    console.log('Creating guest session...');
    fetch('/api/auth/guest-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Guest session response:', data);
      // Show guest UI
      this.isAuthenticated = false;
      this.isGuest = true;
      this.showGuestUI();
      this.showNotification('Continuing as guest', 'info');
    })
    .catch(error => {
      console.error('Error creating guest session:', error);
    });
  }

  // Show authenticated UI
  showAuthenticatedUI() {
    console.log('Showing authenticated UI...');
    if (this.authButton && this.userDropdown) {
      this.authButton.style.display = 'none';
      this.userDropdown.style.display = 'block';
      
      // Update username display
      if (this.usernameElement && this.username) {
        this.usernameElement.textContent = this.username;
      }
    } else {
      console.error('Auth button or user dropdown not found');
      console.log('Elements:', {
        authButton: this.authButton,
        userDropdown: this.userDropdown
      });
    }
    
    // Close modals if open
    if (typeof $ !== 'undefined' && $('#loginModal').length) {
      $('#loginModal').modal('hide');
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('auth:login', {
      detail: {
        username: this.username,
        isGuest: this.isGuest
      }
    }));
  }

  // Show guest UI
  showGuestUI() {
    console.log('Showing guest UI...');
    if (this.authButton && this.userDropdown) {
      this.authButton.style.display = 'block';
      this.userDropdown.style.display = 'none';
    } else {
      console.warn('Auth elements not found, this is normal on first load');
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // Show unauthenticated UI
  showUnauthenticatedUI() {
    console.log('Showing unauthenticated UI...');
    if (this.authButton && this.userDropdown) {
      this.authButton.style.display = 'block';
      this.userDropdown.style.display = 'none';
    } else {
      console.warn('Auth elements not found, this is normal on first load');
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // Show notification
  showNotification(message, type = 'success') {
    console.log('Showing notification:', message);
    // Use the existing notification system if available
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      // Simple fallback
      alert(message);
    }
  }
}

// Initialize the auth manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;