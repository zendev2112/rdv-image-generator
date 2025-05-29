/**
 * RDV Image Generator - Facebook Templates Module (Functional Approach with ES6 Modules)
 * Handles Facebook-specific template configurations and rendering
 * @version 1.0.0
 */

// ES6 Imports
import { sanitizeText, formatDate, truncateText } from '../utils/helpers.js';
import { validateTemplateData } from '../utils/validators.js';
import { getCurrentTheme } from '../core/color-manager.js';

// Facebook Template Configurations
const facebookTemplateConfigs = {
    post: {
        name: 'Facebook Post',
        dimensions: { width: 1200, height: 630 },
        aspectRatio: '1.91:1',
        description: 'Horizontal format optimized for Facebook feed posts and link previews',
        features: ['horizontal', 'link-preview', 'large-text', 'brand-logo'],
        textAreas: {
            title: { maxLength: 100, position: 'center' },
            excerpt: { maxLength: 200, position: 'bottom' },
            hashtags: { maxCount: 5, position: 'caption' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Roboto',
            fallback: 'Arial, sans-serif'
        },
        animations: ['fadeIn', 'slideLeft', 'zoomIn']
    },
    
    story: {
        name: 'Facebook Story',
        dimensions: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        description: 'Vertical format for Facebook Stories',
        features: ['vertical', 'fullscreen', 'overlay-text', 'brand-logo'],
        textAreas: {
            title: { maxLength: 80, position: 'center' },
            excerpt: { maxLength: 150, position: 'bottom' },
            hashtags: { maxCount: 3, position: 'overlay' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Playfair Display',
            fallback: 'Arial, sans-serif'
        },
        animations: ['fadeIn', 'slideUp', 'bounceIn']
    },
    
    cover: {
        name: 'Facebook Cover',
        dimensions: { width: 1640, height: 859 },
        aspectRatio: '1.91:1',
        description: 'Cover photo format for Facebook pages',
        features: ['wide', 'banner-style', 'branding-focus', 'minimal-text'],
        textAreas: {
            title: { maxLength: 60, position: 'center' },
            excerpt: { maxLength: 100, position: 'bottom' },
            hashtags: { maxCount: 0, position: 'none' }
        },
        fonts: {
            primary: 'Playfair Display',
            secondary: 'Inter',
            fallback: 'Arial, sans-serif'
        },
        animations: ['fadeIn', 'slideRight', 'scaleIn']
    }
};

// Facebook-specific styling presets
const facebookStylePresets = {
    classic: {
        name: 'Classic',
        description: 'Traditional Facebook blue theme',
        colors: {
            primary: '#1877F2',
            secondary: '#42A5F5',
            accent: '#FFC107',
            background: '#FFFFFF',
            text: '#1C1E21'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #1877F2, #42A5F5)',
            overlay: 'linear-gradient(180deg, rgba(24,119,242,0.1), rgba(24,119,242,0.3))'
        }
    },
    
    news: {
        name: 'News',
        description: 'Professional news-focused design',
        colors: {
            primary: '#E53E3E',
            secondary: '#2D3748',
            accent: '#FBD38D',
            background: '#FFFFFF',
            text: '#2D3748'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #E53E3E, #2D3748)',
            overlay: 'linear-gradient(180deg, rgba(229,62,62,0.1), rgba(45,55,72,0.2))'
        }
    },
    
    modern: {
        name: 'Modern',
        description: 'Contemporary design with bold colors',
        colors: {
            primary: '#667EEA',
            secondary: '#764BA2',
            accent: '#F093FB',
            background: '#FFFFFF',
            text: '#4A5568'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #667EEA, #764BA2)',
            overlay: 'linear-gradient(180deg, rgba(102,126,234,0.1), rgba(118,75,162,0.2))'
        }
    }
};

/**
 * Initialize Facebook templates
 */
export async function initializeFacebookTemplates() {
    console.log('🚀 Initializing Facebook Templates...');
    
    try {
        // Register Facebook-specific template helpers
        registerFacebookHelpers();
        
        // Setup Facebook template event listeners
        setupFacebookEventListeners();
        
        console.log('✅ Facebook Templates initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Facebook Templates:', error);
        throw error;
    }
}

/**
 * Get Facebook template configuration
 * @param {string} templateName - Template name
 * @returns {Object} Template configuration
 */
export function getFacebookTemplateConfig(templateName) {
    return facebookTemplateConfigs[templateName] || facebookTemplateConfigs.post;
}

/**
 * Get all Facebook template configurations
 * @returns {Object} All template configurations
 */
export function getAllFacebookTemplateConfigs() {
    return { ...facebookTemplateConfigs };
}

/**
 * Generate Facebook-optimized content
 * @param {Object} data - Raw content data
 * @param {string} templateName - Template name
 * @returns {Object} Optimized content for Facebook
 */
export function generateFacebookContent(data, templateName = 'post') {
    const config = getFacebookTemplateConfig(templateName);
    
    if (!validateTemplateData(data)) {
        console.warn('⚠️ Invalid template data, using defaults');
        data = getDefaultFacebookData();
    }
    
    return {
        title: generateFacebookTitle(data.title, config),
        excerpt: generateFacebookExcerpt(data.excerpt, config),
        hashtags: generateFacebookHashtags(data.tags, config),
        author: data.author || 'RDV Noticias',
        source: data.source || 'Radio del Volga',
        date: formatFacebookDate(data.date),
        backgroundImage: data.backgroundImage || '',
        category: data.category || 'general',
        template: templateName,
        config: config
    };
}

/**
 * Generate Facebook-optimized title
 * @param {string} title - Original title
 * @param {Object} config - Template configuration
 * @returns {string} Optimized title
 */
function generateFacebookTitle(title, config) {
    if (!title) return 'Noticias Importantes';
    
    const maxLength = config.textAreas.title.maxLength;
    let optimizedTitle = sanitizeText(title);
    
    // Truncate if necessary
    if (optimizedTitle.length > maxLength) {
        optimizedTitle = truncateText(optimizedTitle, maxLength);
    }
    
    // Facebook prefers descriptive titles without excessive emojis
    return optimizedTitle;
}

/**
 * Generate Facebook-optimized excerpt
 * @param {string} excerpt - Original excerpt
 * @param {Object} config - Template configuration
 * @returns {string} Optimized excerpt
 */
function generateFacebookExcerpt(excerpt, config) {
    if (!excerpt) return 'Mantente informado con Radio del Volga.';
    
    const maxLength = config.textAreas.excerpt.maxLength;
    let optimizedExcerpt = sanitizeText(excerpt);
    
    // Truncate if necessary
    if (optimizedExcerpt.length > maxLength) {
        optimizedExcerpt = truncateText(optimizedExcerpt, maxLength);
    }
    
    return optimizedExcerpt;
}

/**
 * Generate Facebook hashtags (limited use)
 * @param {string} tags - Comma-separated tags
 * @param {Object} config - Template configuration
 * @returns {Array} Array of hashtags
 */
function generateFacebookHashtags(tags, config) {
    const maxCount = config.textAreas.hashtags.maxCount;
    
    // Facebook uses hashtags less frequently
    if (maxCount === 0) return [];
    
    const defaultHashtags = ['#RDVNoticias'];
    
    if (!tags) return defaultHashtags.slice(0, maxCount);
    
    // Parse tags and convert to hashtags (conservative approach for Facebook)
    const customHashtags = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => '#' + tag.replace(/\s+/g, '').replace(/[^\w]/g, ''))
        .slice(0, Math.max(0, maxCount - defaultHashtags.length));
    
    const allHashtags = [...customHashtags, ...defaultHashtags];
    
    // Remove duplicates and limit count
    return [...new Set(allHashtags)].slice(0, maxCount);
}

/**
 * Format date for Facebook
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatFacebookDate(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    
    return formatDate(date, 'DD de MMMM, YYYY');
}

/**
 * Get default Facebook data
 * @returns {Object} Default data object
 */
function getDefaultFacebookData() {
    return {
        title: 'Radio del Volga - Noticias',
        excerpt: 'Tu fuente confiable de información y actualidad.',
        author: 'Redacción RDV',
        source: 'Radio del Volga',
        date: new Date(),
        category: 'general',
        tags: 'noticias,rdv'
    };
}

/**
 * Generate Facebook post text
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {string} Facebook post text
 */
export function generateFacebookPostText(data, templateName = 'post') {
    const config = getFacebookTemplateConfig(templateName);
    const hashtags = generateFacebookHashtags(data.tags, config);
    
    let postText = `${data.title}\n\n${data.excerpt}`;
    
    // Add call-to-action
    postText += '\n\n👉 Lee más en radiodelvolga.com';
    
    // Add source/author attribution
    if (data.author && data.author !== 'Redacción RDV') {
        postText += `\n\n📝 ${data.author}`;
    }
    
    // Add hashtags (if any)
    if (hashtags.length > 0) {
        postText += '\n\n' + hashtags.join(' ');
    }
    
    // Facebook post text limit (approximately 63,206 characters, but keep it concise)
    if (postText.length > 500) {
        postText = truncateText(postText, 500);
    }
    
    return postText;
}

/**
 * Generate Facebook link preview data
 * @param {Object} data - Content data
 * @returns {Object} Link preview metadata
 */
export function generateFacebookLinkPreview(data) {
    return {
        title: data.title,
        description: data.excerpt,
        image: data.backgroundImage || 'assets/images/logos/rdv-logo.svg',
        url: generateFacebookArticleUrl(data),
        siteName: 'Radio del Volga',
        type: 'article',
        author: data.author,
        publishedTime: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };
}

/**
 * Generate article URL for Facebook sharing
 * @param {Object} data - Content data
 * @returns {string} Article URL
 */
function generateFacebookArticleUrl(data) {
    const baseUrl = 'https://radiodelvolga.com';
    const slug = data.title ? 
        data.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) : 
        'noticia';
    
    return `${baseUrl}/noticias/${slug}`;
}

/**
 * Apply Facebook-specific styling
 * @param {HTMLElement} element - Template element
 * @param {string} templateName - Template name
 * @param {Object} data - Content data
 */
export function applyFacebookStyling(element, templateName, data) {
    const config = getFacebookTemplateConfig(templateName);
    const currentTheme = getCurrentTheme();
    
    // Apply template-specific classes
    element.classList.add('facebook-template', `facebook-${templateName}`);
    
    // Apply dimensions
    element.style.width = `${config.dimensions.width}px`;
    element.style.height = `${config.dimensions.height}px`;
    
    // Apply Facebook brand colors if no theme specified
    if (!data.theme || data.theme === 'facebook') {
        const facebookColors = facebookStylePresets.classic.colors;
        element.style.setProperty('--facebook-primary', facebookColors.primary);
        element.style.setProperty('--facebook-secondary', facebookColors.secondary);
        element.style.setProperty('--facebook-accent', facebookColors.accent);
    }
    
    // Apply template-specific styling
    switch (templateName) {
        case 'post':
            applyPostSpecificStyling(element, data);
            break;
        case 'story':
            applyStorySpecificStyling(element, data);
            break;
        case 'cover':
            applyCoverSpecificStyling(element, data);
            break;
    }
}

/**
 * Apply Facebook Post specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyPostSpecificStyling(element, data) {
    // Optimize for horizontal format and readability
    element.style.display = 'flex';
    element.style.flexDirection = 'row';
    element.style.alignItems = 'center';
    
    // Add subtle shadow for card-like appearance
    element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    
    // Add post-specific effects
    element.classList.add('facebook-post-effects');
}

/**
 * Apply Facebook Story specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyStorySpecificStyling(element, data) {
    // Add gradient overlay for better text readability
    if (data.backgroundImage) {
        element.style.background = `
            linear-gradient(180deg, rgba(24,119,242,0.1) 0%, rgba(24,119,242,0.3) 100%),
            url('${data.backgroundImage}') center/cover
        `;
    }
    
    // Add story-specific effects
    element.classList.add('facebook-story-effects');
}

/**
 * Apply Facebook Cover specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyCoverSpecificStyling(element, data) {
    // Emphasize branding for cover photos
    element.style.background = data.backgroundImage ? 
        `linear-gradient(135deg, rgba(24,119,242,0.8), rgba(66,165,245,0.8)), url('${data.backgroundImage}') center/cover` :
        'linear-gradient(135deg, #1877F2, #42A5F5)';
    
    // Add cover-specific effects
    element.classList.add('facebook-cover-effects');
}

/**
 * Generate Facebook engagement elements
 * @param {string} templateName - Template name
 * @returns {Object} Engagement elements HTML
 */
export function generateFacebookEngagementElements(templateName) {
    const elements = {
        post: {
            reactions: `
                <div class="facebook-reactions">
                    <span class="reaction">👍 Me gusta</span>
                    <span class="reaction">❤️ Me encanta</span>
                    <span class="reaction">💬 Comentar</span>
                    <span class="reaction">🔄 Compartir</span>
                </div>
            `,
            callToAction: `
                <div class="facebook-cta">
                    <button class="cta-button">Lee más</button>
                </div>
            `
        },
        
        story: {
            swipeUp: `
                <div class="facebook-swipe-up">
                    <div class="swipe-indicator">👆</div>
                    <div class="swipe-text">Desliza hacia arriba</div>
                </div>
            `
        },
        
        cover: {
            branding: `
                <div class="facebook-branding">
                    <div class="brand-logo">
                        <img src="assets/images/logos/rdv-logo.svg" alt="RDV">
                    </div>
                    <div class="brand-text">Radio del Volga</div>
                </div>
            `
        }
    };
    
    return elements[templateName] || {};
}

/**
 * Optimize content for Facebook algorithm
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {Object} Algorithm-optimized content
 */
export function optimizeForFacebookAlgorithm(data, templateName) {
    const optimized = { ...data };
    
    // Facebook prioritizes meaningful conversations
    optimized.engagementQuestions = getFacebookEngagementQuestions(data.category);
    
    // Optimize for Facebook's preference for native content
    optimized.nativeOptimizations = getFacebookNativeOptimizations(templateName);
    
    // Add Facebook-specific posting recommendations
    optimized.bestPostingTime = getBestFacebookPostingTime(data.category);
    
    return optimized;
}

/**
 * Get Facebook engagement questions by category
 * @param {string} category - Content category
 * @returns {Array} Engagement questions
 */
function getFacebookEngagementQuestions(category) {
    const questionsByCategory = {
        politica: [
            '¿Qué opinas sobre esta decisión?',
            '¿Cómo crees que afectará esto?',
            'Comparte tu punto de vista en los comentarios'
        ],
        economia: [
            '¿Cómo impacta esto en tu día a día?',
            '¿Qué medidas tomarías?',
            'Cuéntanos tu experiencia'
        ],
        deportes: [
            '¿Quién crees que ganará?',
            '¿Cuál es tu equipo favorito?',
            'Predice el resultado'
        ],
        general: [
            '¿Qué te parece esta noticia?',
            'Comparte tu opinión',
            '¿Conocías esta información?'
        ]
    };
    
    return questionsByCategory[category] || questionsByCategory.general;
}

/**
 * Get Facebook native optimizations
 * @param {string} templateName - Template name
 * @returns {Object} Native optimization suggestions
 */
function getFacebookNativeOptimizations(templateName) {
    return {
        post: {
            preferNativeVideo: true,
            useCarousels: true,
            addPollsWhenPossible: true
        },
        story: {
            useInteractiveStickers: true,
            addLocationTags: true,
            useBoomerangEffect: false
        },
        cover: {
            updateRegularly: true,
            alignWithBrandColors: true,
            includeContactInfo: false
        }
    }[templateName] || {};
}

/**
 * Get best posting time for Facebook
 * @param {string} category - Content category
 * @returns {Object} Best posting time information
 */
function getBestFacebookPostingTime(category) {
    // Based on Facebook engagement data for news content
    const bestTimes = {
        politica: { day: 'weekday', time: '07:00', timezone: 'America/Argentina/Buenos_Aires' },
        economia: { day: 'weekday', time: '08:30', timezone: 'America/Argentina/Buenos_Aires' },
        deportes: { day: 'weekend', time: '14:00', timezone: 'America/Argentina/Buenos_Aires' },
        general: { day: 'weekday', time: '13:00', timezone: 'America/Argentina/Buenos_Aires' }
    };
    
    return bestTimes[category] || bestTimes.general;
}

/**
 * Register Facebook template helpers
 */
function registerFacebookHelpers() {
    // Register global helpers for Facebook templates
    window.FacebookTemplateHelpers = {
        generateContent: generateFacebookContent,
        generatePostText: generateFacebookPostText,
        generateLinkPreview: generateFacebookLinkPreview,
        applyEngagementElements: generateFacebookEngagementElements,
        optimizeForAlgorithm: optimizeForFacebookAlgorithm
    };
    
    console.log('📝 Facebook template helpers registered');
}

/**
 * Setup Facebook template event listeners
 */
function setupFacebookEventListeners() {
    // Listen for Facebook-specific template changes
    document.addEventListener('facebook:templateChanged', (e) => {
        const { templateName, data } = e.detail;
        console.log(`👥 Facebook template changed to: ${templateName}`);
        
        // Update template-specific UI elements
        updateFacebookTemplateUI(templateName, data);
    });
    
    // Listen for Facebook optimization requests
    document.addEventListener('facebook:optimize', (e) => {
        const { data, templateName } = e.detail;
        const optimized = optimizeForFacebookAlgorithm(data, templateName);
        
        // Dispatch optimized data
        document.dispatchEvent(new CustomEvent('facebook:optimized', {
            detail: { optimizedData: optimized }
        }));
    });
}

/**
 * Update Facebook template UI elements
 * @param {string} templateName - Template name
 * @param {Object} data - Template data
 */
function updateFacebookTemplateUI(templateName, data) {
    const config = getFacebookTemplateConfig(templateName);
    
    // Update character counters for Facebook limits
    updateFacebookCharacterCounters(config);
    
    // Update engagement suggestions
    updateFacebookEngagementSuggestions(templateName, data.category);
    
    // Update posting time recommendations
    updateFacebookPostingTimeRecommendations(data.category);
}

/**
 * Update character counters for Facebook limits
 * @param {Object} config - Template configuration
 */
function updateFacebookCharacterCounters(config) {
    // Update title counter
    const titleInput = document.getElementById('title');
    const titleCounter = document.getElementById('titleCounter');
    if (titleInput && titleCounter) {
        const maxLength = config.textAreas.title.maxLength;
        titleCounter.textContent = `${titleInput.value.length}/${maxLength}`;
        titleCounter.className = titleInput.value.length > maxLength ? 'counter-exceeded' : 'counter-normal';
    }
    
    // Update excerpt counter
    const excerptInput = document.getElementById('excerpt');
    const excerptCounter = document.getElementById('excerptCounter');
    if (excerptInput && excerptCounter) {
        const maxLength = config.textAreas.excerpt.maxLength;
        excerptCounter.textContent = `${excerptInput.value.length}/${maxLength}`;
        excerptCounter.className = excerptInput.value.length > maxLength ? 'counter-exceeded' : 'counter-normal';
    }
}

/**
 * Update engagement suggestions for Facebook
 * @param {string} templateName - Template name
 * @param {string} category - Content category
 */
function updateFacebookEngagementSuggestions(templateName, category) {
    const engagementSuggestions = document.getElementById('engagementSuggestions');
    if (engagementSuggestions) {
        const questions = getFacebookEngagementQuestions(category);
        engagementSuggestions.innerHTML = `
            <h4>💡 Preguntas para engagement en Facebook:</h4>
            <ul>
                ${questions.map(question => `<li>${question}</li>`).join('')}
            </ul>
        `;
    }
}

/**
 * Update posting time recommendations
 * @param {string} category - Content category
 */
function updateFacebookPostingTimeRecommendations(category) {
    const timeRecommendations = document.getElementById('postingTimeRecommendations');
    if (timeRecommendations) {
        const bestTime = getBestFacebookPostingTime(category);
        timeRecommendations.innerHTML = `
            <h4>⏰ Mejor horario para publicar:</h4>
            <p>${bestTime.day === 'weekday' ? 'Días de semana' : 'Fines de semana'} a las ${bestTime.time}</p>
        `;
    }
}

/**
 * Export Facebook template configuration
 * @returns {Object} Facebook template export data
 */
export function exportFacebookTemplateConfig() {
    return {
        templateConfigs: facebookTemplateConfigs,
        stylePresets: facebookStylePresets,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Get Facebook style presets
 * @returns {Object} Facebook style presets
 */
export function getFacebookStylePresets() {
    return { ...facebookStylePresets };
}

// Make functions globally available
window.FacebookTemplates = {
    initialize: initializeFacebookTemplates,
    getConfig: getFacebookTemplateConfig,
    generateContent: generateFacebookContent,
    generatePostText: generateFacebookPostText,
    applyStyling: applyFacebookStyling,
    optimizeForAlgorithm: optimizeForFacebookAlgorithm,
    exportConfig: exportFacebookTemplateConfig
};