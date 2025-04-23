/**
 * Templates UI component for Free Thinkers
 * Provides a template selection interface and handling
 */

class TemplatesUI {
  constructor() {
    this.currentModel = '';
    this.templates = [];
    this.selectedTemplate = null;
    this.templateValues = {};
    console.log('TemplatesUI constructor');
  }

  /**
   * Initialize the templates UI
   */
  async init(modelName) {
    if (!modelName) {
      console.error('Cannot initialize templates with empty model name');
      // Find a fallback model
      const modelSelector = document.getElementById('modelSelect');
      if (modelSelector && modelSelector.value) {
        modelName = modelSelector.value;
        console.log('Using fallback model from selector:', modelName);
      } else {
        modelName = 'llama3.2'; // Safe default
        console.log('Using hardcoded fallback model:', modelName);
      }
    }
    
    console.log('TemplatesUI initializing with model:', modelName);
    this.currentModel = modelName;
    await this.loadTemplates();
    this.renderTemplateSelector();
  }

  /**
   * Load templates for the current model
   */
  async loadTemplates() {
    console.log('TemplatesUI loading templates for model:', this.currentModel);
    try {
      if (!this.currentModel || this.currentModel === '<empty string>') {
        console.error('Cannot load templates with empty model name');
        this.templates = [];
        return;
      }
      
      const response = await fetch(`/templates/list/${this.currentModel}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        this.templates = data.templates;
        console.log('TemplatesUI loaded templates:', this.templates.length);
      } else {
        console.error('Failed to load templates:', data.error);
        this.templates = [];
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      this.templates = [];
    }
  }

  /**
   * Render the template selector UI
   */
  renderTemplateSelector() {
    console.log('TemplatesUI rendering template selector');
    const container = document.getElementById('template-selector');
    if (!container) {
      console.error('Template selector container not found with ID "template-selector"');
      return;
    }
    
    // Clear previous content - preserve any elements with data-preserve attribute
    const elementsToPreserve = Array.from(container.querySelectorAll('[data-preserve="true"]'));
    container.innerHTML = '';
    elementsToPreserve.forEach(el => container.appendChild(el));
    
    // If we have no templates, show a message and exit
    if (!this.templates || this.templates.length === 0) {
      console.log('No templates to render');
      
      const emptyState = document.createElement('div');
      emptyState.className = 'alert alert-info';
      emptyState.textContent = `No templates available for ${this.currentModel || 'current model'}`;
      container.appendChild(emptyState);
      return;
    }
    
    console.log(`TemplatesUI rendering ${this.templates.length} templates`);
    
    // Add a header label
    const headerLabel = document.createElement('div');
    headerLabel.className = 'template-header';
    headerLabel.innerHTML = '<strong>Prompt Templates:</strong> Select a template to use for your message';
    container.appendChild(headerLabel);
    
    // Create the dropdown for templates
    const dropdown = document.createElement('select');
    dropdown.id = 'template-dropdown';
    dropdown.className = 'form-select template-dropdown mb-2';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a template...';
    dropdown.appendChild(defaultOption);
    
    // Add templates
    this.templates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      option.dataset.description = template.description || '';
      dropdown.appendChild(option);
    });
    
    // Add change event
    dropdown.addEventListener('change', () => this.handleTemplateSelect(dropdown.value));
    
    // Create container for template placeholders
    const placeholderContainer = document.createElement('div');
    placeholderContainer.id = 'template-placeholders';
    placeholderContainer.className = 'template-placeholders';
    
    // Add components to container
    container.appendChild(dropdown);
    
    // Add description area
    const description = document.createElement('div');
    description.id = 'template-description';
    description.className = 'template-description';
    description.style.display = 'none'; // Hide initially
    container.appendChild(description);
    
    container.appendChild(placeholderContainer);
    
    // Add apply button
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Template';
    applyBtn.className = 'btn btn-primary btn-sm template-apply-btn';
    applyBtn.addEventListener('click', () => this.applyTemplate());
    applyBtn.style.display = 'none';
    applyBtn.id = 'template-apply-btn';
    container.appendChild(applyBtn);
    
    console.log('TemplatesUI template selector rendered successfully');
  }

  /**
   * Handle template selection
   */
  handleTemplateSelect(templateId) {
    console.log('TemplatesUI handling template selection:', templateId);
    
    // Clear previous placeholders
    const container = document.getElementById('template-placeholders');
    const descriptionEl = document.getElementById('template-description');
    const applyBtn = document.getElementById('template-apply-btn');
    
    if (!container || !descriptionEl || !applyBtn) {
      console.error('Missing UI elements for template selection');
      return;
    }
    
    container.innerHTML = '';
    
    if (!templateId) {
      this.selectedTemplate = null;
      this.templateValues = {};
      descriptionEl.textContent = '';
      descriptionEl.style.display = 'none';
      applyBtn.style.display = 'none';
      return;
    }
    
    // Find the selected template
    this.selectedTemplate = this.templates.find(t => t.id === templateId);
    this.templateValues = {};
    
    if (!this.selectedTemplate) {
      console.error('Template not found:', templateId);
      return;
    }
    
    console.log('Template selected:', this.selectedTemplate);
    
    // Show description
    descriptionEl.textContent = this.selectedTemplate.description || 'No description available';
    descriptionEl.style.display = 'block';
    
    // Show apply button
    applyBtn.style.display = 'block';
    
    // If no placeholders, allow immediate application
    if (!this.selectedTemplate.placeholders || this.selectedTemplate.placeholders.length === 0) {
      applyBtn.textContent = 'Use Template';
      applyBtn.classList.add('btn-success');
      return;
    }
    
    // Create input fields for each placeholder
    applyBtn.textContent = 'Apply Template';
    applyBtn.classList.remove('btn-success');
    
    this.selectedTemplate.placeholders.forEach(placeholder => {
      const label = document.createElement('label');
      label.textContent = placeholder.replace(/^\w/, c => c.toUpperCase()).replace(/([A-Z])/g, ' $1');
      label.htmlFor = `template-${placeholder}`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `template-${placeholder}`;
      input.className = 'form-control template-input';
      
      // Use example values if available
      if (this.selectedTemplate.example_filled && 
          this.selectedTemplate.example_filled[placeholder]) {
        input.placeholder = this.selectedTemplate.example_filled[placeholder];
      } else {
        input.placeholder = placeholder;
      }
      
      // Add event listener to update values
      input.addEventListener('input', () => {
        this.templateValues[placeholder] = input.value;
      });
      
      // Pre-populate with example values for convenience
      if (this.selectedTemplate.example_filled && 
          this.selectedTemplate.example_filled[placeholder]) {
        this.templateValues[placeholder] = this.selectedTemplate.example_filled[placeholder];
      }
      
      // Add to container
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group mb-2';
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      container.appendChild(formGroup);
    });
  }

  /**
   * Apply the selected template
   */
  async applyTemplate() {
    console.log('TemplatesUI applying template');
    
    if (!this.selectedTemplate) {
      console.error('No template selected');
      return;
    }
    
    try {
      console.log('Generating template with values:', this.templateValues);
      
      const response = await fetch('/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.currentModel,
          template: this.selectedTemplate.id,
          values: this.templateValues
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Template generation response:', data);
      
      if (data.status === 'success') {
        // Set the generated prompt in the message input
        const messageInput = document.getElementById('message-input');
        if (!messageInput) {
          console.error('Message input not found');
          return;
        }
        
        // Set the value and trigger input event
        messageInput.value = data.prompt;
        messageInput.focus();
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log('Template applied successfully to message input');
        
        // Show success notification if available
        if (window.showNotification) {
          window.showNotification('Template applied successfully', 'success');
        }
        
        // Reset template selector
        const dropdown = document.getElementById('template-dropdown');
        if (dropdown) dropdown.value = '';
        this.handleTemplateSelect('');
      } else {
        console.error('Failed to generate prompt:', data.error);
        
        // Show error notification if available
        if (window.showNotification) {
          window.showNotification(`Error: ${data.error}`, 'error');
        }
      }
    } catch (err) {
      console.error('Error generating prompt:', err);
      
      // Show error notification if available
      if (window.showNotification) {
        window.showNotification(`Error: ${err.message}`, 'error');
      }
    }
  }
}

// Initialize templates system when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.templatesUI = new TemplatesUI();
  
  // Initialize with current model when model selector changes
  const modelSelector = document.getElementById('model-selector');
  if (modelSelector) {
    modelSelector.addEventListener('change', function() {
      window.templatesUI.init(this.value);
    });
    
    // Initialize with default model
    if (modelSelector.value) {
      window.templatesUI.init(modelSelector.value);
    }
  }
});
