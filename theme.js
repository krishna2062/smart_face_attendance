// js/theme.js
class ThemeManager {
    constructor() {
        this.themeSwitch = document.getElementById('themeSwitch');
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }
    
    loadTheme() {
        const settings = storage.getSettings();
        const theme = settings.theme || 'light';
        
        if (theme === 'auto') {
            this.setAutoTheme();
        } else {
            this.setTheme(theme);
        }
        
        // Update switch position
        if (this.themeSwitch) {
            this.themeSwitch.checked = theme === 'dark';
        }
        
        // Update theme options
        this.themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            }
        });
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to settings
        const settings = storage.getSettings();
        settings.theme = theme;
        storage.saveSettings(settings);
    }
    
    setAutoTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to settings
        const settings = storage.getSettings();
        settings.theme = 'auto';
        storage.saveSettings(settings);
    }
    
    setupEventListeners() {
        // Theme switch
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                this.setTheme(theme);
            });
        }
        
        // Theme options
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                
                // Update switch position
                if (this.themeSwitch) {
                    this.themeSwitch.checked = theme === 'dark';
                }
                
                // Update active state
                this.themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const settings = storage.getSettings();
            if (settings.theme === 'auto') {
                this.setAutoTheme();
            }
        });
    }
    
    updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Update time
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});