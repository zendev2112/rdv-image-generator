/**
 * RDV Image Generator - Template Engine (Functional Approach with ES6 Modules)
 * Handles template loading, rendering, and dynamic content injection
 * @version 1.0.0
 */

// ES6 Imports
import { sanitizeText, sanitizeUrl, truncateText, formatDate, debounce } from '../utils/helpers.js';
import { validateTemplateData, validatePlatform, validateTemplateName } from '../utils/validators.js';
import { applyThemeColors, getThemeVariables } from './color-manager.js';

// Template Engine State
let templateCache = new Map();
let currentTemplateData = {};

// Platform Configuration
const platformConfig = {
    instagram: {
        story: { width: 1080, height: 1920, name: 'Instagram Story' },
        post: { width: 1080, height: 1080, name: 'Instagram Post' },
        'reel-cover': { width: 1080, height: 1920, name: 'Instagram Reel Cover' }
    },
    facebook: {
        post: { width: 1200, height: 630, name: 'Facebook Post' },
        story: { width: 1080, height: 1920, name: 'Facebook Story' },
        cover: { width: 1640, height: 859, name: 'Facebook Cover' }
    },
    twitter: {
        post: { width: 1200, height: 675, name: 'Twitter Post' },
        header: { width: 1500, height: 500, name: 'Twitter Header' },
        card: { width: 1200, height: 628, name: 'Twitter Card' }
    },
    universal: {
        'news-card': { width: 1080, height: 1080, name: 'News Card' },
        'breaking-news': { width: 1200, height: 630, name: 'Breaking News' }
    }
};

/**
 * Initialize the template engine
 */
export async function initializeTemplateEngine() {
    console.log('🚀 Initializing Template Engine...');
    
    try {
        // Preload critical templates
        await preloadCriticalTemplates();
        
        // Setup template event listeners
        setupTemplateEventListeners();
        
        console.log('✅ Template Engine initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Template Engine:', error);
        throw error;
    }
}

/**
 * Preload critical templates for faster loading
 */
async function preloadCriticalTemplates() {
    const criticalTemplates = [
        { platform: 'instagram', template: 'story' },
        { platform: 'instagram', template: 'post' },
        { platform: 'facebook', template: 'post' },
        { platform: 'twitter', template: 'post' },
        { platform: 'universal', template: 'news-card' }
    ];

    try {
        const loadPromises = criticalTemplates.map(({ platform, template }) =>
            loadTemplate(platform, template)
        );
        
        await Promise.all(loadPromises);
        console.log('✅ Critical templates preloaded');
    } catch (error) {
        console.warn('⚠️ Some critical templates failed to preload:', error);
        // Don't throw - non-critical templates can load on demand
    }
}

/**
 * Load a template from file or cache
 * @param {string} platform - Platform name (instagram, facebook, twitter, universal)
 * @param {string} templateName - Template name
 * @returns {Promise<string>} Template HTML content
 */
export async function loadTemplate(platform, templateName) {
    // Validate inputs
    if (!validatePlatform(platform)) {
        throw new Error(`Invalid platform: ${platform}`);
    }
    
    if (!validateTemplateName(templateName)) {
        throw new Error(`Invalid template name: ${templateName}`);
    }

    const cacheKey = `${platform}-${templateName}`;
    
    // Return cached template if available
    if (templateCache.has(cacheKey)) {
        console.log(`📋 Template loaded from cache: ${cacheKey}`);
        return templateCache.get(cacheKey);
    }

    try {
        const templatePath = `templates/${platform}/${templateName}.html`;
        const response = await fetch(templatePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load template: ${templatePath} (${response.status})`);
        }
        
        const templateHTML = await response.text();
        
        // Validate template HTML
        if (!templateHTML || templateHTML.trim().length === 0) {
            throw new Error(`Empty template: ${templatePath}`);
        }
        
        // Cache the template
        templateCache.set(cacheKey, templateHTML);
        
        console.log(`✅ Template loaded: ${cacheKey}`);
        return templateHTML;
        
    } catch (error) {
        console.error(`❌ Error loading template ${cacheKey}:`, error);
        
        // Return fallback template
        return getFallbackTemplate(platform, templateName);
    }
}

/**
 * Generate fallback template when main template fails to load
 * @param {string} platform - Platform name
 * @param {string} templateName - Template name
 * @returns {string} Fallback HTML template
 */
function getFallbackTemplate(platform, templateName) {
    const config = getPlatformConfig(platform, templateName);
    
    return `
        <div class="fallback-template" style="
            width: ${config.width}px;
            height: ${config.height}px;
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: var(--font-primary);
            text-align: center;
            padding: 2rem;
            box-sizing: border-box;
            border-radius: var(--radius-lg);
        ">
            <div class="fallback-icon" style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
            <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; font-weight: 700;">Template Not Available</h2>
            <p style="margin: 0; opacity: 0.8; font-size: 0.9rem;">${config.name}</p>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.6; font-size: 0.8rem;">${config.width} × ${config.height}</p>
            <p style="margin: 1rem 0 0 0; opacity: 0.5; font-size: 0.7rem;">Fallback Template</p>
        </div>
    `;
}

/**
 * Render template with data
 * @param {string} platform - Platform name
 * @param {string} templateName - Template name
 * @param {Object} data - Data to inject into template
 * @returns {Promise<string>} Rendered HTML
 */
export async function renderTemplate(platform, templateName, data = {}) {
    try {
        // Validate inputs
        if (!validatePlatform(platform)) {
            throw new Error(`Invalid platform: ${platform}`);
        }
        
        if (!validateTemplateName(templateName)) {
            throw new Error(`Invalid template name: ${templateName}`);
        }
        
        // Load template
        const templateHTML = await loadTemplate(platform, templateName);
        
        // Process and validate data
        const processedData = await processTemplateData(data);
        
        if (!validateTemplateData(processedData)) {
            console.warn('⚠️ Template data validation failed, using defaults');
        }
        
        // Store current template data
        currentTemplateData = { platform, templateName, data: processedData };
        
        // Process template with data
        const renderedHTML = await injectDataIntoTemplate(templateHTML, processedData);
        
        console.log(`✅ Template rendered: ${platform}/${templateName}`);
        return renderedHTML;
        
    } catch (error) {
        console.error(`❌ Error rendering template:`, error);
        throw error;
    }
}

/**
 * Process and sanitize template data
 * @param {Object} data - Raw template data
 * @returns {Promise<Object>} Processed template data
 */
async function processTemplateData(data) {
    const processed = {
        title: sanitizeText(data.title || 'Título de la noticia'),
        excerpt: sanitizeText(data.excerpt || 'Resumen de la noticia'),
        source: sanitizeText(data.source || 'RDV Noticias'),
        author: sanitizeText(data.author || 'Redacción RDV'),
        category: sanitizeText(data.category || 'general'),
        tags: await processTags(data.tags || ''),
        backgroundImage: sanitizeUrl(data.backgroundImage || ''),
        logo: 'assets/images/logos/rdv-logo.svg',
        date: formatDate(data.date || new Date()),
        theme: data.theme || 'default',
        fontStyle: data.fontStyle || 'inter',
        animationStyle: data.animationStyle || 'none'
    };

    // Add computed properties
    processed.shortTitle = truncateText(processed.title, 60);
    processed.shortExcerpt = truncateText(processed.excerpt, 120);
    processed.categoryIcon = getCategoryIcon(processed.category);
    processed.readingTime = calculateReadingTime(processed.excerpt);
    processed.themeVariables = getThemeVariables(processed.theme);
    
    return processed;
}

/**
 * Process tags string into array
 * @param {string} tagsString - Comma-separated tags
 * @returns {Promise<Array>} Array of tag objects
 */
async function processTags(tagsString) {
    if (!tagsString || typeof tagsString !== 'string') return [];
    
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5) // Limit to 5 tags
        .map(tag => ({
            name: tag,
            slug: tag.toLowerCase().replace(/\s+/g, '-'),
            color: getTagColor(tag)
        }));
}

/**
 * Get category icon
 * @param {string} category - Category name
 * @returns {string} Icon emoji or default
 */
function getCategoryIcon(category) {
    const icons = {
        general: '📰',
        politica: '🏛️',
        economia: '💰',
        tecnologia: '💻',
        deportes: '⚽',
        cultura: '🎭',
        internacionales: '🌍',
        sociedad: '👥'
    };
    
    return icons[category] || icons.general;
}

/**
 * Get tag color based on content
 * @param {string} tag - Tag name
 * @returns {string} CSS color value
 */
function getTagColor(tag) {
    const colors = [
        'var(--primary-blue)',
        'var(--secondary-red)',
        'var(--accent-cyan)',
        'var(--success-green)',
        'var(--warning-pink)'
    ];
    
    // Simple hash to get consistent color for same tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Calculate reading time based on text length
 * @param {string} text - Text content
 * @returns {string} Reading time estimate
 */
function calculateReadingTime(text) {
    if (!text) return '1 min';
    
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return `${minutes} min`;
}

/**
 * Inject data into template HTML using placeholders
 * @param {string} templateHTML - Template HTML content
 * @param {Object} data - Processed template data
 * @returns {Promise<string>} HTML with injected data
 */
async function injectDataIntoTemplate(templateHTML, data) {
    let processedHTML = templateHTML;
    
    // Replace all data placeholders
    Object.entries(data).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        const stringValue = Array.isArray(value) ? value.join(', ') : String(value);
        processedHTML = processedHTML.replace(placeholder, stringValue);
    });
    
    // Handle conditional blocks
    processedHTML = processConditionalBlocks(processedHTML, data);
    
    // Handle loops
    processedHTML = processLoops(processedHTML, data);
    
    // Handle dynamic classes and styles
    processedHTML = await processDynamicStyles(processedHTML, data);
    
    return processedHTML;
}

/**
 * Process conditional blocks in template
 * @param {string} html - HTML content
 * @param {Object} data - Template data
 * @returns {string} Processed HTML
 */
function processConditionalBlocks(html, data) {
    // {{#if condition}} content {{/if}}
    const ifPattern = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    
    return html.replace(ifPattern, (match, condition, content) => {
        const value = data[condition];
        const shouldShow = value && value !== '' && value !== 'none' && value !== false;
        return shouldShow ? content : '';
    });
}

/**
 * Process loops in template
 * @param {string} html - HTML content
 * @param {Object} data - Template data
 * @returns {string} Processed HTML
 */
function processLoops(html, data) {
    // {{#each arrayName}} content {{/each}}
    const eachPattern = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    
    return html.replace(eachPattern, (match, arrayName, content) => {
        const array = data[arrayName];
        if (!Array.isArray(array) || array.length === 0) return '';
        
        return array.map((item, index) => {
            let itemContent = content;
            
            // Replace item properties
            if (typeof item === 'object') {
                Object.entries(item).forEach(([key, value]) => {
                    const itemPlaceholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                    itemContent = itemContent.replace(itemPlaceholder, String(value));
                });
            } else {
                // Handle primitive arrays
                itemContent = itemContent.replace(/{{this}}/g, String(item));
            }
            
            // Replace index and other meta variables
            itemContent = itemContent.replace(/{{@index}}/g, String(index));
            itemContent = itemContent.replace(/{{@first}}/g, String(index === 0));
            itemContent = itemContent.replace(/{{@last}}/g, String(index === array.length - 1));
            
            return itemContent;
        }).join('');
    });
}

/**
 * Process dynamic styles and classes
 * @param {string} html - HTML content
 * @param {Object} data - Template data
 * @returns {Promise<string>} Processed HTML
 */
async function processDynamicStyles(html, data) {
    // Replace theme classes
    html = html.replace(/{{theme}}/g, `theme-${data.theme}`);
    
    // Replace font classes
    html = html.replace(/{{fontStyle}}/g, `font-${data.fontStyle}`);
    
    // Replace animation classes
    html = html.replace(/{{animationStyle}}/g, `animation-${data.animationStyle}`);
    
    // Process background image styles
    if (data.backgroundImage) {
        const bgImageStyle = `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;`;
        html = html.replace(/{{backgroundImageStyle}}/g, bgImageStyle);
    } else {
        html = html.replace(/{{backgroundImageStyle}}/g, '');
    }
    
    // Apply theme colors
    html = await applyThemeColors(html, data.theme);
    
    return html;
}

/**
 * Update preview with current template and data
 */
export async function updatePreview() {
    const platform = window.RDVImageGenerator?.currentPlatform || 'instagram';
    const templateName = window.RDVImageGenerator?.currentTemplate || 'story';
    
    try {
        // Show loading state
        updatePreviewStatus('loading', 'Cargando plantilla...');
        
        // Collect form data
        const formData = collectFormData();
        
        // Render template
        const renderedHTML = await renderTemplate(platform, templateName, formData);
        
        // Update preview container
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.innerHTML = renderedHTML;
            
            // Apply animations if enabled
            await applyTemplateAnimations(canvas, formData.animationStyle);
        }
        
        // Update preview info
        updatePreviewInfo(platform, templateName);
        
        // Update status
        updatePreviewStatus('ready', 'Listo para generar');
        
        console.log('✅ Preview updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating preview:', error);
        updatePreviewStatus('error', 'Error al cargar plantilla');
        
        // Show error notification
        if (typeof window.showToast === 'function') {
            window.showToast('Error al actualizar la vista previa', 'error');
        }
    }
}

/**
 * Collect form data from UI
 * @returns {Object} Form data object
 */
function collectFormData() {
    return {
        title: document.getElementById('title')?.value || '',
        excerpt: document.getElementById('excerpt')?.value || '',
        source: document.getElementById('source')?.value || 'RDV Noticias',
        author: document.getElementById('author')?.value || 'Redacción RDV',
        category: document.getElementById('category')?.value || 'general',
        tags: document.getElementById('tags')?.value || '',
        backgroundImage: document.getElementById('backgroundImage')?.value || '',
        theme: document.querySelector('.color-theme.active')?.dataset?.theme || 'default',
        fontStyle: document.getElementById('fontStyle')?.value || 'inter',
        animationStyle: document.getElementById('animationStyle')?.value || 'none',
        date: new Date()
    };
}

/**
 * Apply animations to template elements
 * @param {HTMLElement} container - Template container
 * @param {string} animationStyle - Animation style name
 */
async function applyTemplateAnimations(container, animationStyle) {
    if (!container || !animationStyle || animationStyle === 'none') return;
    
    // Use GSAP if available (loaded via CDN)
    if (typeof window.gsap !== 'undefined') {
        const elements = container.querySelectorAll('.animate-element');
        
        switch (animationStyle) {
            case 'fade':
                window.gsap.fromTo(elements, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 1, stagger: 0.2 }
                );
                break;
                
            case 'slide':
                window.gsap.fromTo(elements,
                    { x: -50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
                );
                break;
                
            case 'float':
                window.gsap.to(elements, {
                    y: '+=10',
                    duration: 2,
                    ease: 'power2.inOut',
                    yoyo: true,
                    repeat: -1,
                    stagger: 0.3
                });
                break;
                
            case 'pulse':
                window.gsap.to(elements, {
                    scale: 1.05,
                    duration: 1,
                    ease: 'power2.inOut',
                    yoyo: true,
                    repeat: -1,
                    stagger: 0.2
                });
                break;
        }
    }
}

/**
 * Update preview status indicator
 * @param {string} status - Status type (ready, loading, error)
 * @param {string} message - Status message
 */
function updatePreviewStatus(status, message) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    
    if (indicator) {
        indicator.className = `status-indicator ${status}`;
    }
    
    if (text) {
        text.textContent = message;
    }
}

/**
 * Update preview information display
 * @param {string} platform - Platform name
 * @param {string} templateName - Template name
 */
function updatePreviewInfo(platform, templateName) {
    const config = getPlatformConfig(platform, templateName);
    
    const platformElement = document.getElementById('currentPlatform');
    const templateElement = document.getElementById('currentTemplate');
    const dimensionsElement = document.getElementById('currentDimensions');
    
    if (platformElement) {
        platformElement.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    }
    
    if (templateElement) {
        templateElement.textContent = config.name;
    }
    
    if (dimensionsElement) {
        dimensionsElement.textContent = `${config.width} × ${config.height}`;
    }
}

/**
 * Get platform configuration
 * @param {string} platform - Platform name
 * @param {string} templateName - Template name
 * @returns {Object} Platform configuration
 */
export function getPlatformConfig(platform, templateName) {
    return platformConfig[platform]?.[templateName] || {
        width: 1080,
        height: 1080,
        name: 'Unknown Template'
    };
}

/**
 * Setup template-related event listeners
 */
function setupTemplateEventListeners() {
    // Platform selector events
    document.addEventListener('click', function(e) {
        if (e.target.matches('.platform-btn') || e.target.closest('.platform-btn')) {
            const btn = e.target.closest('.platform-btn');
            const platform = btn.dataset.platform;
            
            // Update active state
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update global state
            if (window.RDVImageGenerator) {
                window.RDVImageGenerator.currentPlatform = platform;
            }
            
            // Load templates for platform
            loadPlatformTemplates(platform);
        }
    });
    
    // Template selector events
    document.addEventListener('click', function(e) {
        if (e.target.matches('.template-btn') || e.target.closest('.template-btn')) {
            const btn = e.target.closest('.template-btn');
            const templateName = btn.dataset.template;
            
            // Update active state
            document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update global state
            if (window.RDVImageGenerator) {
                window.RDVImageGenerator.currentTemplate = templateName;
            }
            
            // Update preview
            updatePreview();
        }
    });
    
    // Theme selector events
    document.addEventListener('click', function(e) {
        if (e.target.matches('.color-theme') || e.target.closest('.color-theme')) {
            const themeBtn = e.target.closest('.color-theme');
            const theme = themeBtn.dataset.theme;
            
            // Update active state
            document.querySelectorAll('.color-theme').forEach(t => t.classList.remove('active'));
            themeBtn.classList.add('active');
            
            // Update global state
            if (window.RDVImageGenerator) {
                window.RDVImageGenerator.currentTheme = theme;
            }
            
            // Update preview
            updatePreview();
        }
    });
    
    // Form input events for real-time preview
    const formInputs = ['title', 'excerpt', 'source', 'author', 'category', 'tags', 'backgroundImage', 'fontStyle', 'animationStyle'];
    
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(() => {
                updatePreview();
            }, 500));
        }
    });
}

/**
 * Load templates for a specific platform
 * @param {string} platform - Platform name
 */
export async function loadPlatformTemplates(platform) {
    const templateSelector = document.getElementById('templateSelector');
    if (!templateSelector) return;
    
    const templates = Object.keys(platformConfig[platform] || {});
    
    templateSelector.innerHTML = templates.map(templateName => {
        const config = platformConfig[platform][templateName];
        const isActive = templateName === (window.RDVImageGenerator?.currentTemplate || templates[0]);
        
        return `
            <button class="template-btn ${isActive ? 'active' : ''}" data-template="${templateName}">
                <div class="template-icon">📄</div>
                <div class="template-info">
                    <div class="template-name">${config.name}</div>
                    <div class="template-dimensions">${config.width} × ${config.height}</div>
                </div>
            </button>
        `;
    }).join('');
    
    // Update current template if not available in new platform
    if (window.RDVImageGenerator && !templates.includes(window.RDVImageGenerator.currentTemplate)) {
        window.RDVImageGenerator.currentTemplate = templates[0];
    }
}

/**
 * Initialize platforms on app start
 */
export async function initializePlatforms() {
    console.log('🚀 Initializing platforms...');
    
    try {
        // Load templates for default platform
        const defaultPlatform = window.RDVImageGenerator?.currentPlatform || 'instagram';
        await loadPlatformTemplates(defaultPlatform);
        
        console.log('✅ Platforms initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize platforms:', error);
        throw error;
    }
}

/**
 * Initialize templates on app start
 */
export async function initializeTemplates() {
    console.log('🚀 Initializing templates...');
    
    try {
        // Initialize template engine
        await initializeTemplateEngine();
        
        console.log('✅ Templates initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize templates:', error);
        throw error;
    }
}

/**
 * Clear template cache
 */
export function clearTemplateCache() {
    templateCache.clear();
    console.log('🗑️ Template cache cleared');
}

/**
 * Get template cache stats
 * @returns {Object} Cache statistics
 */
export function getTemplateCacheStats() {
    return {
        size: templateCache.size,
        keys: Array.from(templateCache.keys()),
        memory: JSON.stringify(Array.from(templateCache.values())).length
    };
}

/**
 * Get current template data
 * @returns {Object} Current template data
 */
export function getCurrentTemplateData() {
    return { ...currentTemplateData };
}

/**
 * Get all available platforms
 * @returns {Array} Array of platform names
 */
export function getAvailablePlatforms() {
    return Object.keys(platformConfig);
}

/**
 * Get templates for a platform
 * @param {string} platform - Platform name
 * @returns {Array} Array of template names
 */
export function getPlatformTemplates(platform) {
    return Object.keys(platformConfig[platform] || {});
}