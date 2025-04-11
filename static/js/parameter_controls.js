// Unified Parameter Controls
class ParameterManager {
    constructor() {
        this.defaults = {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            tfs_z: 0.95
        };
        
        this.initSliders();
        this.initPresetButtons();
    }
    
    initSliders() {
        document.querySelectorAll('.parameter-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                valueDisplay.textContent = e.target.value;
                this.updateActivePreset();
            });
        });
    }
    
    initPresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
            });
        });
    }
    
    applyPreset(presetName) {
        const presets = {
            precise: { temperature: 0.3, top_p: 0.95, top_k: 40 },
            balanced: { temperature: 0.7, top_p: 0.9, top_k: 50 },
            creative: { temperature: 0.9, top_p: 0.85, top_k: 60 }
        };
        
        Object.entries(presets[presetName]).forEach(([param, value]) => {
            const slider = document.getElementById(`${param}-slider`);
            if (slider) {
                slider.value = value;
                slider.dispatchEvent(new Event('input'));
            }
        });
    }
    
    updateActivePreset() {
        // Logic to highlight active preset
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParameterManager();
});
