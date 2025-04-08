/**
 * Free Thinkers - User Profile Management
 */

const ProfileManager = (function() {
  // State
  let userData = null;
  let userPreferences = null;
  let availableModels = [];
  
  // DOM Elements
  let profileTabs;
  let profileSections;
  let deleteAccountModal;
  
  /**
   * Initialize the profile manager
   */
  function init() {
    // Initialize DOM references
    profileTabs = document.querySelectorAll('.profile-menu-item');
    profileSections = document.querySelectorAll('.profile-section');
    deleteAccountModal = document.getElementById('delete-account-modal');
    
    // Check authentication status
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/';
      return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user data
    loadUserData();
    
    // Load user preferences
    loadUserPreferences();
    
    // Load available models
    loadAvailableModels();
    
    // Load user statistics
    loadUserStatistics();
  }
  
  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Tab navigation
    profileTabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs and sections
        profileTabs.forEach(t => t.classList.remove('active'));
        profileSections.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding section
        const sectionId = this.getAttribute('data-tab');
        document.getElementById(sectionId).classList.add('active');
        
        // Update URL hash
        window.location.hash = this.getAttribute('href');
      });
    });
    
    // Form submissions
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('preferences-form').addEventListener('submit', handlePreferencesUpdate);
    document.getElementById('password-form').addEventListener('submit', handlePasswordUpdate);
    document.getElementById('privacy-form').addEventListener('submit', handlePrivacyUpdate);
    
    // Delete account button
    document.getElementById('delete-account-btn').addEventListener('click', showDeleteAccountModal);
    
    // Close delete account modal
    deleteAccountModal.querySelector('.close').addEventListener('click', hideDeleteAccountModal);
    document.querySelector('.cancel-delete').addEventListener('click', hideDeleteAccountModal);
    
    // Delete account confirmation form
    document.getElementById('delete-account-confirm-form').addEventListener('submit', handleAccountDeletion);
    
    // Avatar upload
    document.getElementById('change-avatar-btn').addEventListener('click', () => {
      document.getElementById('avatar-upload').click();
    });
    document.getElementById('avatar-upload').addEventListener('change', handleAvatarUpload);
    
    // Data management buttons
    document.getElementById('export-data-btn').addEventListener('click', handleDataExport);
    document.getElementById('delete-data-btn').addEventListener('click', handleDataDeletion);
    
    // Check hash on page load to show correct tab
    if (window.location.hash) {
      const tabLink = document.querySelector(`.profile-menu-item[href="${window.location.hash}"]`);
      if (tabLink) {
        tabLink.click();
      }
    }
  }
  
  /**
   * Load the user's profile data
   */
  function loadUserData() {
    fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          return AuthManager.refreshToken().then(() => loadUserData());
        }
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    })
    .then(data => {
      userData = data;
      
      // Populate profile form
      document.getElementById('profile-username').value = data.username;
      document.getElementById('profile-email').value = data.email;
      
      // Update verification status
      const verificationStatus = document.getElementById('email-verification-status');
      if (data.is_verified) {
        verificationStatus.textContent = 'Verified';
        verificationStatus.classList.add('verified');
      } else {
        verificationStatus.textContent = 'Not Verified';
        verificationStatus.classList.add('not-verified');
      }
      
      // Update account info
      document.getElementById('account-type').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
      
      // Format dates
      const createdDate = new Date(data.created_at);
      document.getElementById('member-since').textContent = createdDate.toLocaleDateString();
      
      if (data.last_login) {
        const lastLoginDate = new Date(data.last_login);
        document.getElementById('last-login').textContent = lastLoginDate.toLocaleDateString() + ' ' + lastLoginDate.toLocaleTimeString();
      } else {
        document.getElementById('last-login').textContent = 'N/A';
      }
      
      // Update avatar if available
      if (data.avatar) {
        document.getElementById('user-avatar').src = data.avatar;
      }
    })
    .catch(error => {
      console.error('Error loading user data:', error);
      // If there's an auth error, redirect to home page
      if (error.message.includes('401') || error.message.includes('403')) {
        window.location.href = '/';
      }
    });
  }
  
  /**
   * Load the user's preferences
   */
  function loadUserPreferences() {
    fetch('/api/users/me/preferences', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          return AuthManager.refreshToken().then(() => loadUserPreferences());
        }
        throw new Error('Failed to fetch user preferences');
      }
      return response.json();
    })
    .then(data => {
      userPreferences = data;
      
      // Populate preferences form
      document.getElementById('theme-select').value = data.theme || 'light';
      document.getElementById('notifications-enabled').checked = data.notifications_enabled !== false;
      
      // Set default model once models are loaded
      if (availableModels.length > 0 && data.default_model) {
        document.getElementById('default-model').value = data.default_model;
      }
      
      // Populate privacy settings
      if (data.analytics_consent !== undefined) {
        document.getElementById('analytics-consent').checked = data.analytics_consent;
      }
    })
    .catch(error => {
      console.error('Error loading user preferences:', error);
    });
  }
  
  /**
   * Load available models for the default model selection
   */
  function loadAvailableModels() {
    fetch('/api/models')
      .then(response => response.json())
      .then(models => {
        availableModels = models;
        
        // Populate model select
        const modelSelect = document.getElementById('default-model');
        modelSelect.innerHTML = '';
        
        models.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });
        
        // Set current default model if preferences loaded
        if (userPreferences && userPreferences.default_model) {
          modelSelect.value = userPreferences.default_model;
        } else {
          // Default to first model
          if (models.length > 0) {
            modelSelect.value = models[0];
          }
        }
      })
      .catch(error => {
        console.error('Error loading models:', error);
      });
  }
  
  /**
   * Load user statistics (conversation count, etc.)
   */
  function loadUserStatistics() {
    // Load conversation count
    fetch('/api/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => response.json())
    .then(conversations => {
      document.getElementById('conversation-count').textContent = conversations.length;
    })
    .catch(error => {
      console.error('Error loading conversations:', error);
    });
    
    // Load folder count
    fetch('/api/folders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => response.json())
    .then(folders => {
      document.getElementById('folder-count').textContent = folders.length;
    })
    .catch(error => {
      console.error('Error loading folders:', error);
    });
    
    // For shared count, we need to check each conversation's shares
    // This is a simplification - in a real app, you'd have a dedicated endpoint
    let sharedCount = 0;
    fetch('/api/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => response.json())
    .then(conversations => {
      const sharedPromises = conversations.map(conversation => {
        return fetch(`/api/conversations/${conversation.id}/share`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AuthManager.getToken()}`
          }
        })
        .then(response => {
          if (!response.ok) {
            return [];
          }
          return response.json();
        })
        .catch(() => []);
      });
      
      return Promise.all(sharedPromises);
    })
    .then(shareResults => {
      shareResults.forEach(shares => {
        sharedCount += shares.length;
      });
      document.getElementById('shared-count').textContent = sharedCount;
    })
    .catch(error => {
      console.error('Error loading shares:', error);
    });
  }
  
  /**
   * Handle profile form submission
   * @param {Event} e - Form submit event
   */
  function handleProfileUpdate(e) {
    e.preventDefault();
    
    // Get form data
    const username = document.getElementById('profile-username').value;
    const email = document.getElementById('profile-email').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Send update request
    fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update profile');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Profile updated successfully!', 'success');
      
      // Reload user data
      loadUserData();
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  /**
   * Handle preferences form submission
   * @param {Event} e - Form submit event
   */
  function handlePreferencesUpdate(e) {
    e.preventDefault();
    
    // Get form data
    const theme = document.getElementById('theme-select').value;
    const defaultModel = document.getElementById('default-model').value;
    const notificationsEnabled = document.getElementById('notifications-enabled').checked;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Prepare preferences object
    const preferences = {
      theme,
      default_model: defaultModel,
      notifications_enabled: notificationsEnabled
    };
    
    // Send update request
    fetch('/api/users/me/preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update preferences');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Preferences updated successfully!', 'success');
      
      // Apply theme if changed
      if (theme !== userPreferences.theme) {
        applyTheme(theme);
      }
      
      // Update user preferences
      userPreferences = data.preferences;
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  /**
   * Handle password form submission
   * @param {Event} e - Form submit event
   */
  function handlePasswordUpdate(e) {
    e.preventDefault();
    
    // Get form data
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Changing...';
    submitBtn.disabled = true;
    
    // Send password update request
    fetch('/api/users/me/password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update password');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Password updated successfully!', 'success');
      
      // Reset form
      e.target.reset();
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  /**
   * Handle privacy form submission
   * @param {Event} e - Form submit event
   */
  function handlePrivacyUpdate(e) {
    e.preventDefault();
    
    // Get form data
    const analyticsConsent = document.getElementById('analytics-consent').checked;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Update preferences with privacy settings
    const updatedPreferences = {
      ...userPreferences,
      analytics_consent: analyticsConsent
    };
    
    // Send update request
    fetch('/api/users/me/preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPreferences)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update privacy settings');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Privacy settings updated successfully!', 'success');
      
      // Update user preferences
      userPreferences = data.preferences;
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  /**
   * Handle avatar upload
   * @param {Event} e - File input change event
   */
  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Show loading state
    const avatarImg = document.getElementById('user-avatar');
    avatarImg.style.opacity = '0.5';
    
    // Upload avatar
    fetch('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to upload avatar');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Avatar updated successfully!', 'success');
      
      // Update avatar image
      avatarImg.src = data.avatar_path + '?t=' + new Date().getTime(); // Add timestamp to bypass cache
      
      // Reset file input
      e.target.value = '';
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset avatar opacity
      avatarImg.style.opacity = '1';
    });
  }
  
  /**
   * Handle data export button click
   */
  function handleDataExport() {
    showNotification('Preparing data export...', 'info');
    
    // In a real app, this would trigger a backend process to prepare the export
    // For this implementation, we'll just fetch conversations and preferences
    
    Promise.all([
      fetch('/api/conversations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthManager.getToken()}`
        }
      }).then(response => response.json()),
      
      fetch('/api/folders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthManager.getToken()}`
        }
      }).then(response => response.json()),
      
      fetch('/api/users/me/preferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthManager.getToken()}`
        }
      }).then(response => response.json())
    ])
    .then(([conversations, folders, preferences]) => {
      // Create export object
      const exportData = {
        user: {
          username: userData.username,
          email: userData.email,
          created_at: userData.created_at
        },
        preferences,
        conversations,
        folders,
        exported_at: new Date().toISOString()
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `free-thinkers-export-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      showNotification('Data export complete!', 'success');
    })
    .catch(error => {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data', 'error');
    });
  }
  
  /**
   * Handle data deletion button click
   */
  function handleDataDeletion() {
    if (!confirm('Are you sure you want to delete all your conversations, folders, and shared items? This action cannot be undone.')) {
      return;
    }
    
    showNotification('Deleting data...', 'info');
    
    // Delete conversations first
    fetch('/api/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`
      }
    })
    .then(response => response.json())
    .then(conversations => {
      // Create array of delete requests for each conversation
      const deletePromises = conversations.map(conversation => {
        return fetch(`/api/conversations/${conversation.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${AuthManager.getToken()}`
          }
        });
      });
      
      return Promise.all(deletePromises);
    })
    .then(() => {
      // Delete folders
      return fetch('/api/folders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthManager.getToken()}`
        }
      })
      .then(response => response.json())
      .then(folders => {
        const deletePromises = folders.map(folder => {
          return fetch(`/api/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${AuthManager.getToken()}`
            }
          });
        });
        
        return Promise.all(deletePromises);
      });
    })
    .then(() => {
      showNotification('All data deleted successfully!', 'success');
      
      // Update stats
      document.getElementById('conversation-count').textContent = '0';
      document.getElementById('folder-count').textContent = '0';
      document.getElementById('shared-count').textContent = '0';
    })
    .catch(error => {
      console.error('Error deleting data:', error);
      showNotification('Failed to delete data', 'error');
    });
  }
  
  /**
   * Show the delete account modal
   */
  function showDeleteAccountModal() {
    deleteAccountModal.style.display = 'block';
  }
  
  /**
   * Hide the delete account modal
   */
  function hideDeleteAccountModal() {
    deleteAccountModal.style.display = 'none';
    document.getElementById('delete-account-confirm-form').reset();
  }
  
  /**
   * Handle account deletion form submission
   * @param {Event} e - Form submit event
   */
  function handleAccountDeletion(e) {
    e.preventDefault();
    
    // Get password for confirmation
    const password = document.getElementById('delete-password').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Deleting...';
    submitBtn.disabled = true;
    
    // Verify password first by attempting to change password to the same value
    fetch('/api/users/me/password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AuthManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: password,
        new_password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Incorrect password');
        });
      }
      
      // Password verified, proceed with account deletion
      return fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthManager.getToken()}`
        }
      });
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to delete account');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      showNotification('Account deleted successfully!', 'success');
      
      // Log out
      AuthManager.logout();
      
      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    })
    .catch(error => {
      showNotification(error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  /**
   * Apply a theme to the page
   * @param {string} theme - The theme to apply ('light', 'dark', or 'system')
   */
  function applyTheme(theme) {
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }
  
  /**
   * Show a notification message
   * @param {string} message - The message to show
   * @param {string} type - The type of notification ('success', 'error', 'info')
   */
  function showNotification(message, type = 'info') {
    // Check if notification container exists
    let container = document.getElementById('notification-container');
    if (!container) {
      // Create container
      container = document.createElement('div');
      container.id = 'notification-container';
      document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    notification.appendChild(closeBtn);
    
    // Add to container
    container.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // API
  return {
    init
  };
})();

// Initialize profile manager on page load
document.addEventListener('DOMContentLoaded', function() {
  ProfileManager.init();
});