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
      // Get DOM elements
      this.authButton = document.getElementById('authButton');
      this.userDropdown = document.getElementById('userDropdown');
      this.usernameElement = document.getElementById('username');
      this.loginForm = document.getElementById('loginForm');
      this.registerForm = document.getElementById('registerForm');
      this.logoutLink = document.getElementById('logoutLink');
      this.showRegisterModal = document.getElementById('showRegisterModal');
      this.showLoginModal = document.getElementById('showLoginModal');
      this.continueAsGuest = document.getElementById('continueAsGuest');
      this.loginError = document.getElementById('loginError');
      this.registerError = document.getElementById('registerError');

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
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          loginModal.show();
        });
      }

      if (this.showRegisterModal) {
        this.showRegisterModal.addEventListener('click', (e) => {
          e.preventDefault();
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
          const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
          loginModal.hide();
          registerModal.show();
        });
      }

      if (this.showLoginModal) {
        this.showLoginModal.addEventListener('click', (e) => {
          e.preventDefault();
          const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          registerModal.hide();
          loginModal.show();
        });
      }

      if (this.continueAsGuest) {
        this.continueAsGuest.addEventListener('click', (e) => {
          e.preventDefault();
          this.createGuestSession();
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
          loginModal.hide();
        });
      }

      if (this.loginForm) {
        console.log('Adding submit handler to login form');
        this.loginForm.addEventListener('submit', (e) => {
          console.log('Login form submitted');
          e.preventDefault();
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;
          const remember = document.getElementById('rememberMe').checked;
          console.log('Logging in with username:', username);
          this.login(username, password, remember);
        });
      }

      if (this.registerForm) {
        this.registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = document.getElementById('registerUsername').value;
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const acceptTerms = document.getElementById('acceptTerms').checked;
          
          // Basic validation
          if (password !== confirmPassword) {
            this.registerError.textContent = 'Passwords do not match';
            this.registerError.style.display = 'block';
            return;
          }
          
          if (!acceptTerms) {
            this.registerError.textContent = 'You must accept the Terms of Service';
            this.registerError.style.display = 'block';
            return;
          }
          
          this.register(username, email, password);
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
      
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
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
      const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      
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
    if (this.authButton) this.authButton.style.display = 'none';
    if (this.userDropdown) {
      this.userDropdown.style.display = 'block';
      if (this.usernameElement && this.username) {
        this.usernameElement.textContent = this.username;
      }
    }
  }

  // Show guest UI
  showGuestUI() {
    console.log('Showing guest UI...');
    if (this.authButton) this.authButton.style.display = 'block';
    if (this.userDropdown) this.userDropdown.style.display = 'none';
  }

  // Show unauthenticated UI
  showUnauthenticatedUI() {
    console.log('Showing unauthenticated UI...');
    if (this.authButton) this.authButton.style.display = 'block';
    if (this.userDropdown) this.userDropdown.style.display = 'none';
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