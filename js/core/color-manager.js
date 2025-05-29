/**
 * RDV Image Generator - Color Manager Module (Functional Approach with ES6 Modules)
 * Handles theme management, color schemes, and dynamic styling
 * @version 1.0.0
 */

// ES6 Imports
import { hexToRgb, rgbToHex, adjustBrightness, getContrastColor, generateGradient } from '../utils/helpers.js';
import { validateColorHex, validateThemeName } from '../utils/validators.js';

// Color Manager State
let currentTheme = 'default';
let customColors = new Map();
let themeVariables = new Map();

// Theme Definitions
const themeDefinitions = {
    default: {
        name: 'Default',
        description: 'Tema principal con gradientes azul y púrpura',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#4facfe',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1a202c',
            textSecondary: '#718096',
            border: '#e2e8f0',
            success: '#48bb78',
            warning: '#ed8936',
            error: '#f56565',
            info: '#4299e1'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            secondary: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            accent: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }
    },
    
    news: {
        name: 'Noticias',
        description: 'Tema dinámico para contenido noticioso',
        colors: {
            primary: '#ff416c',
            secondary: '#ff4b2b',
            accent: '#ff6b6b',
            background: '#ffffff',
            surface: '#fef5f5',
            text: '#2d3748',
            textSecondary: '#718096',
            border: '#fed7d7',
            success: '#68d391',
            warning: '#f6ad55',
            error: '#fc8181',
            info: '#63b3ed'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            secondary: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            accent: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            hero: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #ff6b6b 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(255, 65, 108, 0.1)',
            md: '0 4px 6px -1px rgba(255, 65, 108, 0.15)',
            lg: '0 10px 15px -3px rgba(255, 65, 108, 0.2)',
            xl: '0 20px 25px -5px rgba(255, 65, 108, 0.25)'
        }
    },
    
    tech: {
        name: 'Tecnología',
        description: 'Tema moderno para contenido tecnológico',
        colors: {
            primary: '#4facfe',
            secondary: '#00f2fe',
            accent: '#43e97b',
            background: '#ffffff',
            surface: '#f0fdff',
            text: '#1a365d',
            textSecondary: '#4a5568',
            border: '#bee3f8',
            success: '#38b2ac',
            warning: '#d69e2e',
            error: '#e53e3e',
            info: '#3182ce'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            secondary: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            hero: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(79, 172, 254, 0.1)',
            md: '0 4px 6px -1px rgba(79, 172, 254, 0.15)',
            lg: '0 10px 15px -3px rgba(79, 172, 254, 0.2)',
            xl: '0 20px 25px -5px rgba(79, 172, 254, 0.25)'
        }
    },
    
    business: {
        name: 'Negocios',
        description: 'Tema profesional para contenido empresarial',
        colors: {
            primary: '#43e97b',
            secondary: '#38f9d7',
            accent: '#4fd1c7',
            background: '#ffffff',
            surface: '#f0fff4',
            text: '#1a202c',
            textSecondary: '#4a5568',
            border: '#c6f6d5',
            success: '#48bb78',
            warning: '#ed8936',
            error: '#f56565',
            info: '#4299e1'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            secondary: 'linear-gradient(135deg, #4fd1c7 0%, #06beb6 100%)',
            accent: 'linear-gradient(135deg, #81e6d9 0%, #68d391 100%)',
            hero: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #4fd1c7 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(67, 233, 123, 0.1)',
            md: '0 4px 6px -1px rgba(67, 233, 123, 0.15)',
            lg: '0 10px 15px -3px rgba(67, 233, 123, 0.2)',
            xl: '0 20px 25px -5px rgba(67, 233, 123, 0.25)'
        }
    },
    
    sports: {
        name: 'Deportes',
        description: 'Tema energético para contenido deportivo',
        colors: {
            primary: '#fa709a',
            secondary: '#fee140',
            accent: '#ff9a9e',
            background: '#ffffff',
            surface: '#fffaf0',
            text: '#744210',
            textSecondary: '#975a16',
            border: '#fbb6ce',
            success: '#68d391',
            warning: '#f6ad55',
            error: '#fc8181',
            info: '#63b3ed'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            secondary: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            accent: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            hero: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #ff9a9e 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(250, 112, 154, 0.1)',
            md: '0 4px 6px -1px rgba(250, 112, 154, 0.15)',
            lg: '0 10px 15px -3px rgba(250, 112, 154, 0.2)',
            xl: '0 20px 25px -5px rgba(250, 112, 154, 0.25)'
        }
    },
    
    culture: {
        name: 'Cultura',
        description: 'Tema suave para contenido cultural',
        colors: {
            primary: '#a8edea',
            secondary: '#fed6e3',
            accent: '#fbc2eb',
            background: '#ffffff',
            surface: '#fafafa',
            text: '#2d3748',
            textSecondary: '#718096',
            border: '#e2e8f0',
            success: '#68d391',
            warning: '#f6ad55',
            error: '#fc8181',
            info: '#63b3ed'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            secondary: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
            accent: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
            hero: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #fbc2eb 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(168, 237, 234, 0.1)',
            md: '0 4px 6px -1px rgba(168, 237, 234, 0.15)',
            lg: '0 10px 15px -3px rgba(168, 237, 234, 0.2)',
            xl: '0 20px 25px -5px rgba(168, 237, 234, 0.25)'
        }
    },
    
    dark: {
        name: 'Oscuro',
        description: 'Tema oscuro para un look moderno',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#4facfe',
            background: '#1a202c',
            surface: '#2d3748',
            text: '#f7fafc',
            textSecondary: '#a0aec0',
            border: '#4a5568',
            success: '#68d391',
            warning: '#f6ad55',
            error: '#fc8181',
            info: '#63b3ed'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            secondary: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            accent: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
            hero: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)'
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)'
        }
    }
};

// Category to theme mapping
const categoryThemeMapping = {
    general: 'default',
    politica: 'news',
    economia: 'business',
    tecnologia: 'tech',
    deportes: 'sports',
    cultura: 'culture',
    internacionales: 'default',
    sociedad: 'default'
};

/**
 * Initialize the color manager
 */
export async function initializeColorManager() {
    console.log('🚀 Initializing Color Manager...');
    
    try {
        // Load saved theme
        loadSavedTheme();
        
        // Initialize theme variables
        await initializeThemeVariables();
        
        // Setup color event listeners
        setupColorEventListeners();
        
        // Apply current theme
        await applyCurrentTheme();
        
        console.log('✅ Color Manager initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Color Manager:', error);
        throw error;
    }
}

/**
 * Load saved theme from localStorage
 */
function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem('rdv_current_theme');
        if (savedTheme && themeDefinitions[savedTheme]) {
            currentTheme = savedTheme;
            console.log(`📋 Loaded saved theme: ${currentTheme}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load saved theme:', error);
    }
}

/**
 * Initialize theme variables for all themes
 */
async function initializeThemeVariables() {
    Object.entries(themeDefinitions).forEach(([themeName, themeData]) => {
        const variables = generateThemeVariables(themeData);
        themeVariables.set(themeName, variables);
    });
    
    console.log('✅ Theme variables initialized for all themes');
}

/**
 * Generate CSS variables object from theme data
 * @param {Object} themeData - Theme configuration
 * @returns {Object} CSS variables object
 */
function generateThemeVariables(themeData) {
    const variables = {};
    
    // Basic colors
    Object.entries(themeData.colors).forEach(([key, value]) => {
        variables[`--theme-${key}`] = value;
        
        // Generate RGB values for transparency
        const rgb = hexToRgb(value);
        if (rgb) {
            variables[`--theme-${key}-rgb`] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        }
        
        // Generate variations
        variables[`--theme-${key}-light`] = adjustBrightness(value, 20);
        variables[`--theme-${key}-dark`] = adjustBrightness(value, -20);
        variables[`--theme-${key}-contrast`] = getContrastColor(value);
    });
    
    // Gradients
    Object.entries(themeData.gradients).forEach(([key, value]) => {
        variables[`--theme-gradient-${key}`] = value;
    });
    
    // Shadows
    Object.entries(themeData.shadows).forEach(([key, value]) => {
        variables[`--theme-shadow-${key}`] = value;
    });
    
    return variables;
}

/**
 * Apply theme colors to HTML content
 * @param {string} html - HTML content
 * @param {string} themeName - Theme name
 * @returns {Promise<string>} HTML with applied theme colors
 */
export async function applyThemeColors(html, themeName = currentTheme) {
    if (!validateThemeName(themeName) || !themeDefinitions[themeName]) {
        console.warn(`⚠️ Invalid theme name: ${themeName}, using default`);
        themeName = 'default';
    }
    
    const theme = themeDefinitions[themeName];
    const variables = themeVariables.get(themeName);
    
    if (!variables) {
        console.error(`❌ Theme variables not found for: ${themeName}`);
        return html;
    }
    
    let processedHtml = html;
    
    // Replace theme color placeholders
    Object.entries(theme.colors).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{theme\\.color\\.${key}}}`, 'g');
        processedHtml = processedHtml.replace(placeholder, value);
    });
    
    // Replace theme gradient placeholders
    Object.entries(theme.gradients).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{theme\\.gradient\\.${key}}}`, 'g');
        processedHtml = processedHtml.replace(placeholder, value);
    });
    
    // Replace theme shadow placeholders
    Object.entries(theme.shadows).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{theme\\.shadow\\.${key}}}`, 'g');
        processedHtml = processedHtml.replace(placeholder, value);
    });
    
    // Apply CSS custom properties
    const style = generateThemeStyleTag(variables);
    processedHtml = processedHtml.replace('</head>', `${style}</head>`);
    
    return processedHtml;
}

/**
 * Generate CSS style tag with theme variables
 * @param {Object} variables - CSS variables object
 * @returns {string} Style tag HTML
 */
function generateThemeStyleTag(variables) {
    const cssVariables = Object.entries(variables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');
    
    return `
<style>
:root {
${cssVariables}
}
</style>`;
}

/**
 * Set current theme
 * @param {string} themeName - Theme name to set
 * @returns {Promise<boolean>} Success status
 */
export async function setTheme(themeName) {
    if (!validateThemeName(themeName) || !themeDefinitions[themeName]) {
        console.error(`❌ Invalid theme name: ${themeName}`);
        return false;
    }
    
    try {
        const previousTheme = currentTheme;
        currentTheme = themeName;
        
        // Save to localStorage
        localStorage.setItem('rdv_current_theme', themeName);
        
        // Apply theme
        await applyCurrentTheme();
        
        // Update UI
        updateThemeSelector(themeName);
        
        // Update global state
        if (window.RDVImageGenerator) {
            window.RDVImageGenerator.currentTheme = themeName;
        }
        
        // Trigger preview update if available
        if (typeof window.updatePreview === 'function') {
            window.updatePreview();
        }
        
        console.log(`✅ Theme changed from ${previousTheme} to ${themeName}`);
        
        // Show notification
        if (typeof window.showToast === 'function') {
            const theme = themeDefinitions[themeName];
            window.showToast(`Tema cambiado a: ${theme.name}`, 'success');
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to set theme ${themeName}:`, error);
        return false;
    }
}

/**
 * Apply current theme to the document
 */
async function applyCurrentTheme() {
    const theme = themeDefinitions[currentTheme];
    const variables = themeVariables.get(currentTheme);
    
    if (!theme || !variables) {
        console.error(`❌ Theme data not found for: ${currentTheme}`);
        return;
    }
    
    // Apply CSS variables to document root
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
    
    // Update data attribute for CSS selectors
    document.body.setAttribute('data-theme', currentTheme);
    
    console.log(`✅ Applied theme: ${currentTheme}`);
}

/**
 * Update theme selector UI
 * @param {string} themeName - Current theme name
 */
function updateThemeSelector(themeName) {
    const themeButtons = document.querySelectorAll('.color-theme');
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

/**
 * Get theme variables for a specific theme
 * @param {string} themeName - Theme name
 * @returns {Object} Theme variables object
 */
export function getThemeVariables(themeName = currentTheme) {
    return themeVariables.get(themeName) || themeVariables.get('default') || {};
}

/**
 * Get current theme information
 * @returns {Object} Current theme data
 */
export function getCurrentTheme() {
    return {
        name: currentTheme,
        data: themeDefinitions[currentTheme],
        variables: themeVariables.get(currentTheme)
    };
}

/**
 * Get all available themes
 * @returns {Array} Array of theme objects
 */
export function getAvailableThemes() {
    return Object.entries(themeDefinitions).map(([key, theme]) => ({
        key,
        name: theme.name,
        description: theme.description,
        colors: theme.colors,
        gradients: theme.gradients
    }));
}

/**
 * Auto-suggest theme based on category
 * @param {string} category - Content category
 * @returns {string} Suggested theme name
 */
export function suggestThemeForCategory(category) {
    const suggestedTheme = categoryThemeMapping[category] || 'default';
    
    console.log(`💡 Suggested theme for category "${category}": ${suggestedTheme}`);
    
    return suggestedTheme;
}

/**
 * Apply category-based theme
 * @param {string} category - Content category
 * @returns {Promise<boolean>} Success status
 */
export async function applyThemeForCategory(category) {
    const suggestedTheme = suggestThemeForCategory(category);
    
    if (suggestedTheme !== currentTheme) {
        return await setTheme(suggestedTheme);
    }
    
    return true;
}

/**
 * Create custom theme
 * @param {string} themeName - Custom theme name
 * @param {Object} themeData - Theme configuration
 * @returns {boolean} Success status
 */
export function createCustomTheme(themeName, themeData) {
    if (!themeName || typeof themeData !== 'object') {
        console.error('❌ Invalid theme name or data for custom theme');
        return false;
    }
    
    try {
        // Validate required properties
        const requiredProps = ['colors', 'gradients', 'shadows'];
        const hasRequiredProps = requiredProps.every(prop => 
            themeData[prop] && typeof themeData[prop] === 'object'
        );
        
        if (!hasRequiredProps) {
            console.error('❌ Custom theme missing required properties');
            return false;
        }
        
        // Add to theme definitions
        themeDefinitions[themeName] = {
            name: themeData.name || themeName,
            description: themeData.description || 'Tema personalizado',
            ...themeData
        };
        
        // Generate variables
        const variables = generateThemeVariables(themeDefinitions[themeName]);
        themeVariables.set(themeName, variables);
        
        // Save to localStorage
        const customThemes = getCustomThemes();
        customThemes[themeName] = themeDefinitions[themeName];
        localStorage.setItem('rdv_custom_themes', JSON.stringify(customThemes));
        
        console.log(`✅ Custom theme created: ${themeName}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to create custom theme ${themeName}:`, error);
        return false;
    }
}

/**
 * Get custom themes from localStorage
 * @returns {Object} Custom themes object
 */
function getCustomThemes() {
    try {
        const saved = localStorage.getItem('rdv_custom_themes');
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.warn('⚠️ Failed to load custom themes:', error);
        return {};
    }
}

/**
 * Load custom themes from localStorage
 */
function loadCustomThemes() {
    const customThemes = getCustomThemes();
    
    Object.entries(customThemes).forEach(([themeName, themeData]) => {
        if (!themeDefinitions[themeName]) {
            themeDefinitions[themeName] = themeData;
            const variables = generateThemeVariables(themeData);
            themeVariables.set(themeName, variables);
        }
    });
    
    if (Object.keys(customThemes).length > 0) {
        console.log(`📋 Loaded ${Object.keys(customThemes).length} custom themes`);
    }
}

/**
 * Generate theme preview
 * @param {string} themeName - Theme name
 * @returns {string} HTML preview
 */
export function generateThemePreview(themeName) {
    const theme = themeDefinitions[themeName];
    if (!theme) {
        return '<div>Theme not found</div>';
    }
    
    return `
        <div class="theme-preview" style="
            background: ${theme.gradients.primary};
            padding: 1rem;
            border-radius: 0.5rem;
            color: ${theme.colors.text};
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        ">
            <h3 style="margin: 0 0 0.5rem 0; color: ${theme.colors.background};">
                ${theme.name}
            </h3>
            <p style="margin: 0; opacity: 0.9; font-size: 0.875rem; color: ${theme.colors.background};">
                ${theme.description}
            </p>
            <div style="
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            ">
                <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${theme.colors.primary};
                    border: 2px solid ${theme.colors.background};
                "></div>
                <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${theme.colors.secondary};
                    border: 2px solid ${theme.colors.background};
                "></div>
                <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${theme.colors.accent};
                    border: 2px solid ${theme.colors.background};
                "></div>
            </div>
        </div>
    `;
}

/**
 * Extract dominant colors from image
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Array>} Array of dominant colors
 */
export async function extractColorsFromImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize for faster processing
                const size = 100;
                canvas.width = size;
                canvas.height = size;
                
                ctx.drawImage(img, 0, 0, size, size);
                const imageData = ctx.getImageData(0, 0, size, size);
                
                // Simple color extraction (can be enhanced with clustering)
                const colors = [];
                const colorMap = new Map();
                
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];
                    
                    if (a > 128) { // Skip transparent pixels
                        const color = rgbToHex(r, g, b);
                        colorMap.set(color, (colorMap.get(color) || 0) + 1);
                    }
                }
                
                // Sort by frequency and return top colors
                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => color);
                
                resolve(sortedColors);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
    });
}

/**
 * Generate theme from image colors
 * @param {Array} colors - Array of hex colors
 * @returns {Object} Generated theme data
 */
export function generateThemeFromColors(colors) {
    if (!colors || colors.length === 0) {
        return null;
    }
    
    const [primary, secondary = primary, accent = primary] = colors;
    
    return {
        name: 'Generated Theme',
        description: 'Tema generado automáticamente',
        colors: {
            primary,
            secondary,
            accent,
            background: '#ffffff',
            surface: adjustBrightness(primary, 95),
            text: '#1a202c',
            textSecondary: '#718096',
            border: adjustBrightness(primary, 80),
            success: '#48bb78',
            warning: '#ed8936',
            error: '#f56565',
            info: '#4299e1'
        },
        gradients: {
            primary: generateGradient(primary, secondary),
            secondary: generateGradient(secondary, accent),
            accent: generateGradient(accent, adjustBrightness(accent, 20)),
            hero: generateGradient(primary, secondary, accent)
        },
        shadows: {
            sm: `0 1px 2px 0 ${primary}20`,
            md: `0 4px 6px -1px ${primary}30`,
            lg: `0 10px 15px -3px ${primary}40`,
            xl: `0 20px 25px -5px ${primary}50`
        }
    };
}

/**
 * Setup color-related event listeners
 */
function setupColorEventListeners() {
    // Category change event to auto-suggest theme
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            const suggestedTheme = suggestThemeForCategory(category);
            
            // Show suggestion notification
            if (typeof window.showToast === 'function' && suggestedTheme !== currentTheme) {
                const themeName = themeDefinitions[suggestedTheme]?.name || suggestedTheme;
                window.showToast(`💡 Tema sugerido: ${themeName}`, 'info', 5000);
            }
        });
    }
    
    // Background image change to extract colors
    const backgroundImageInput = document.getElementById('backgroundImage');
    if (backgroundImageInput) {
        backgroundImageInput.addEventListener('change', async (e) => {
            const imageUrl = e.target.value;
            if (imageUrl && validateColorHex(imageUrl)) {
                try {
                    const colors = await extractColorsFromImage(imageUrl);
                    if (colors.length > 0) {
                        const generatedTheme = generateThemeFromColors(colors);
                        if (generatedTheme) {
                            // Could auto-apply or show as suggestion
                            console.log('🎨 Generated theme from image:', generatedTheme);
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to extract colors from image:', error);
                }
            }
        });
    }
}

/**
 * Export current theme configuration
 * @returns {Object} Theme export data
 */
export function exportThemeConfiguration() {
    const currentThemeData = getCurrentTheme();
    const customThemes = getCustomThemes();
    
    return {
        currentTheme: currentTheme,
        themeData: currentThemeData,
        customThemes: customThemes,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Import theme configuration
 * @param {Object} themeConfig - Theme configuration to import
 * @returns {boolean} Success status
 */
export function importThemeConfiguration(themeConfig) {
    try {
        if (!themeConfig || typeof themeConfig !== 'object') {
            throw new Error('Invalid theme configuration');
        }
        
        // Import custom themes
        if (themeConfig.customThemes) {
            Object.entries(themeConfig.customThemes).forEach(([themeName, themeData]) => {
                createCustomTheme(themeName, themeData);
            });
        }
        
        // Set current theme if valid
        if (themeConfig.currentTheme && themeDefinitions[themeConfig.currentTheme]) {
            setTheme(themeConfig.currentTheme);
        }
        
        console.log('✅ Theme configuration imported successfully');
        
        if (typeof window.showToast === 'function') {
            window.showToast('Configuración de temas importada exitosamente', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to import theme configuration:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al importar configuración de temas', 'error');
        }
        
        return false;
    }
}

// Initialize custom themes on module load
loadCustomThemes();

// Make functions available globally for HTML handlers
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;
window.getAvailableThemes = getAvailableThemes;
window.createCustomTheme = createCustomTheme;
window.exportThemeConfiguration = exportThemeConfiguration;
window.importThemeConfiguration = importThemeConfiguration;