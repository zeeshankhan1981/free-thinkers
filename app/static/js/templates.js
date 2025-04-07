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
  }

  /**
   * Initialize the templates UI
   */
  async init(modelName) {
    this.currentModel = modelName;
    await this.loadTemplates();
    this.renderTemplateSelector();
  }

  /**
   * Load templates for the current model
   */
  async loadTemplates() {
    try {
      const response = await fetch(`/templates/list/${this.currentModel}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        this.templates = data.templates;
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
    const container = document.getElementById('template-selector');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';
    
    // Create the dropdown for templates
    const dropdown = document.createElement('select');
    dropdown.id = 'template-dropdown';
    dropdown.className = 'template-dropdown';
    
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
      option.dataset.description = template.description;
      dropdown.appendChild(option);
    });
    
    // Add change event
    dropdown.addEventListener('change', () => this.handleTemplateSelect(dropdown.value));
    
    // Create container for template placeholders
    const placeholderContainer = document.createElement('div');
    placeholderContainer.id = 'template-placeholders';
    placeholderContainer.className = 'template-placeholders';
    
    // Add components to container
    container.appendChild(document.createElement('label').appendChild(
      document.createTextNode('Prompt Template:')
    ).parentNode);
    container.appendChild(dropdown);
    
    // Add description area
    const description = document.createElement('div');
    description.id = 'template-description';
    description.className = 'template-description';
    container.appendChild(description);
    
    container.appendChild(placeholderContainer);
    
    // Add apply button
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Template';
    applyBtn.className = 'template-apply-btn';
    applyBtn.addEventListener('click', () => this.applyTemplate());
    applyBtn.style.display = 'none';
    applyBtn.id = 'template-apply-btn';
    container.appendChild(applyBtn);
  }

  /**
   * Handle template selection
   */
  handleTemplateSelect(templateId) {
    // Clear previous placeholders
    const container = document.getElementById('template-placeholders');
    const descriptionEl = document.getElementById('template-description');
    const applyBtn = document.getElementById('template-apply-btn');
    
    if (!container) return;
    container.innerHTML = '';
    
    if (!templateId) {
      this.selectedTemplate = null;
      this.templateValues = {};
      descriptionEl.textContent = '';
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
    
    // Show description
    descriptionEl.textContent = this.selectedTemplate.description;
    
    // Show apply button
    applyBtn.style.display = 'block';
    
    // Create input fields for each placeholder
    this.selectedTemplate.placeholders.forEach(placeholder => {
      const label = document.createElement('label');
      label.textContent = placeholder.replace(/^\w/, c => c.toUpperCase()).replace(/([A-Z])/g, ' $1');
      label.htmlFor = `template-${placeholder}`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `template-${placeholder}`;
      input.className = 'template-input';
      input.placeholder = this.selectedTemplate.example_filled[placeholder] || placeholder;
      
      // Add event listener to update values
      input.addEventListener('input', () => {
        this.templateValues[placeholder] = input.value;
      });
      
      // Add to container
      container.appendChild(label);
      container.appendChild(input);
    });
  }

  /**
   * Apply the selected template
   */
  async applyTemplate() {
    if (!this.selectedTemplate) return;
    
    try {
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
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Set the generated prompt in the message input
        const messageInput = document.getElementById('user-input');
        if (messageInput) {
          messageInput.value = data.prompt;
          // Focus and trigger input event to activate send button if needed
          messageInput.focus();
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Reset template selector
        const dropdown = document.getElementById('template-dropdown');
        if (dropdown) dropdown.value = '';
        this.handleTemplateSelect('');
      } else {
        console.error('Failed to generate prompt:', data.error);
      }
    } catch (err) {
      console.error('Error generating prompt:', err);
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
