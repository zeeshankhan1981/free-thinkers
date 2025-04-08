/**
 * Free Thinkers - Authentication Module
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add authentication button to the nav controls
  const navControls = document.querySelector('.nav-controls');
  if (navControls) {
    // Create auth button
    const authButton = document.createElement('button');
    authButton.className = 'nav-btn';
    authButton.innerHTML = '<i class="fas fa-user"></i> <span class="nav-btn-text">Login</span>';
    authButton.id = 'auth-button';
    
    // Insert before the theme toggle button
    const themeButton = document.getElementById('theme-toggle-btn');
    if (themeButton) {
      navControls.insertBefore(authButton, themeButton);
    } else {
      navControls.appendChild(authButton);
    }
    
    // Add click event
    authButton.addEventListener('click', function() {
      document.getElementById('login-modal').style.display = 'block';
    });
    
    // Set up modal events
    setupModalEvents();
  }

  // Function to set up modal events
  function setupModalEvents() {
    // Close buttons
    document.querySelectorAll('.close').forEach(button => {
      button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
      }
    });
    
    // Switch between login and register
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'block';
      });
    }
    
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function() {
        document.getElementById('register-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'block';
      });
    }
    
    // Guest button
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) {
      guestBtn.addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'none';
        createGuestSession();
      });
    }
    
    // Form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }
  }

  // Function to handle login form submission
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // For demonstration - in a real app, this would call the backend API
    document.getElementById('login-message').textContent = 'Login functionality is currently under development.';
    
    // Close the modal after a delay
    setTimeout(() => {
      document.getElementById('login-modal').style.display = 'none';
    }, 2000);
  }

  // Function to handle register form submission
  function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Simple validation
    if (password !== confirmPassword) {
      document.getElementById('register-message').textContent = 'Passwords do not match.';
      return;
    }
    
    // For demonstration - in a real app, this would call the backend API
    document.getElementById('register-message').textContent = 'Registration functionality is currently under development.';
    
    // Close the modal after a delay
    setTimeout(() => {
      document.getElementById('register-modal').style.display = 'none';
    }, 2000);
  }

  // Function to create a guest session
  function createGuestSession() {
    fetch('/api/auth/guest-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Created guest session:', data);
      
      // Show success message
      if (window.showToast) {
        window.showToast('Guest session created successfully', 'success', 3000);
      } else {
        alert('Guest session created successfully');
      }
    })
    .catch(error => {
      console.error('Error creating guest session:', error);
      
      // Show error message
      if (window.showToast) {
        window.showToast('Error creating guest session', 'error', 3000);
      } else {
        alert('Error creating guest session');
      }
    });
  }
});