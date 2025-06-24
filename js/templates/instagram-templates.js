/**
 * RDV Image Generator - Instagram Templates Module (Functional Approach with ES6 Modules)
 * Handles Instagram-specific template configurations and rendering
 * @version 1.0.0
 */

// ES6 Imports
import { sanitizeText, formatDate, truncateText } from '../utils/helpers.js';
import { validateTemplateData } from '../utils/validators.js';
import { getCurrentTheme } from '../core/color-manager.js';

// Instagram Template Configurations
const instagramTemplateConfigs = {
    story: {
        name: 'Instagram Story',
        dimensions: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        description: 'Vertical story format optimized for Instagram Stories',
        features: ['fullscreen', 'vertical', 'overlay-text', 'brand-logo'],
        textAreas: {
            title: { maxLength: 80, position: 'center' },
            excerpt: { maxLength: 150, position: 'bottom' },
            hashtags: { maxCount: 10, position: 'bottom' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Playfair Display',
            fallback: 'Arial, sans-serif'
        },
        animations: ['fadeIn', 'slideUp', 'typewriter']
    },
    
    post: {
        name: 'Instagram Post',
        dimensions: { width: 1080, height: 1080 },
        aspectRatio: '1:1',
        description: 'Square format optimized for Instagram feed posts',
        features: ['square', 'centered-content', 'brand-logo', 'call-to-action'],
        textAreas: {
            title: { maxLength: 60, position: 'center' },
            excerpt: { maxLength: 120, position: 'bottom' },
            hashtags: { maxCount: 30, position: 'caption' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Playfair Display',
            fallback: 'Arial, sans-serif'
        },
        animations: ['fadeIn', 'scaleIn', 'bounceIn']
    },
    
    'reel-cover': {
        name: 'Instagram Reel Cover',
        dimensions: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        description: 'Vertical cover image for Instagram Reels',
        features: ['vertical', 'eye-catching', 'minimal-text', 'brand-logo'],
        textAreas: {
            title: { maxLength: 50, position: 'center' },
            excerpt: { maxLength: 80, position: 'bottom' },
            hashtags: { maxCount: 5, position: 'overlay' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Roboto',
            fallback: 'Arial, sans-serif'
        },
        animations: ['zoomIn', 'slideUp', 'pulse']
    }
};

// Instagram-specific styling presets
const instagramStylePresets = {
    modern: {
        name: 'Modern',
        description: 'Clean, minimalist design with bold typography',
        colors: {
            primary: '#E4405F',
            secondary: '#833AB4',
            accent: '#F77737',
            background: '#FFFFFF',
            text: '#262626'
        },
        gradients: {
            primary: 'linear-gradient(45deg, #F77737, #E4405F, #833AB4)',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.4))'
        }
    },
    
    vibrant: {
        name: 'Vibrant',
        description: 'Bold colors and energetic design',
        colors: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            accent: '#45B7D1',
            background: '#FFFFFF',
            text: '#2C3E50'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1)',
            overlay: 'linear-gradient(180deg, rgba(255,107,107,0.2), rgba(78,205,196,0.3))'
        }
    },
    
    elegant: {
        name: 'Elegant',
        description: 'Sophisticated design with subtle colors',
        colors: {
            primary: '#2C3E50',
            secondary: '#34495E',
            accent: '#E74C3C',
            background: '#ECF0F1',
            text: '#2C3E50'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #2C3E50, #34495E)',
            overlay: 'linear-gradient(180deg, rgba(44,62,80,0.1), rgba(52,73,94,0.2))'
        }
    }
};

/**
 * Initialize Instagram templates
 */
export async function initializeInstagramTemplates() {
    console.log('🚀 Initializing Instagram Templates...');
    
    try {
        // Register Instagram-specific template helpers
        registerInstagramHelpers();
        
        // Setup Instagram template event listeners
        setupInstagramEventListeners();
        
        console.log('✅ Instagram Templates initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Instagram Templates:', error);
        throw error;
    }
}

/**
 * Get Instagram template configuration
 * @param {string} templateName - Template name
 * @returns {Object} Template configuration
 */
export function getInstagramTemplateConfig(templateName) {
    return instagramTemplateConfigs[templateName] || instagramTemplateConfigs.story;
}

/**
 * Get all Instagram template configurations
 * @returns {Object} All template configurations
 */
export function getAllInstagramTemplateConfigs() {
    return { ...instagramTemplateConfigs };
}

/**
 * Generate Instagram-optimized content
 * @param {Object} data - Raw content data
 * @param {string} templateName - Template name
 * @returns {Object} Optimized content for Instagram
 */
export function generateInstagramContent(data, templateName = 'story') {
    const config = getInstagramTemplateConfig(templateName);
    
    if (!validateTemplateData(data)) {
        console.warn('⚠️ Invalid template data, using defaults');
        data = getDefaultInstagramData();
    }
    
    return {
        title: generateInstagramTitle(data.title, config),
        excerpt: generateInstagramExcerpt(data.excerpt, config),
        hashtags: generateInstagramHashtags(data.tags, config),
        author: data.author || 'RDV Noticias',
        source: data.source || '@rdvnoticias',
        date: formatInstagramDate(data.date),
        backgroundImage: data.backgroundImage || '',
        category: data.category || 'general',
        template: templateName,
        config: config
    };
}

/**
 * Generate Instagram-optimized title
 * @param {string} title - Original title
 * @param {Object} config - Template configuration
 * @returns {string} Optimized title
 */
function generateInstagramTitle(title, config) {
    if (!title) return 'Noticia Importante';
    
    const maxLength = config.textAreas.title.maxLength;
    let optimizedTitle = sanitizeText(title);
    
    // Truncate if necessary
    if (optimizedTitle.length > maxLength) {
        optimizedTitle = truncateText(optimizedTitle, maxLength);
    }
    
    // Add emoji for engagement (Instagram-specific)
    if (!optimizedTitle.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
        optimizedTitle = `${optimizedTitle}`;
    }
    
    return optimizedTitle;
}

/**
 * Generate Instagram-optimized excerpt
 * @param {string} excerpt - Original excerpt
 * @param {Object} config - Template configuration
 * @returns {string} Optimized excerpt
 */
function generateInstagramExcerpt(excerpt, config) {
    if (!excerpt) return 'Mantente informado con las últimas noticias.';
    
    const maxLength = config.textAreas.excerpt.maxLength;
    let optimizedExcerpt = sanitizeText(excerpt);
    
    // Truncate if necessary
    if (optimizedExcerpt.length > maxLength) {
        optimizedExcerpt = truncateText(optimizedExcerpt, maxLength);
    }
    
    return optimizedExcerpt;
}

/**
 * Generate Instagram hashtags
 * @param {string} tags - Comma-separated tags
 * @param {Object} config - Template configuration
 * @returns {Array} Array of hashtags
 */
function generateInstagramHashtags(tags, config) {
    const maxCount = config.textAreas.hashtags.maxCount;
    const defaultHashtags = ['#RDVNoticias', '#RadioDelVolga', '#Noticias'];
    
    if (!tags) return defaultHashtags.slice(0, maxCount);
    
    // Parse tags and convert to hashtags
    const customHashtags = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => '#' + tag.replace(/\s+/g, '').replace(/[^\w]/g, ''))
        .slice(0, maxCount - defaultHashtags.length);
    
    const allHashtags = [...customHashtags, ...defaultHashtags];
    
    // Remove duplicates and limit count
    return [...new Set(allHashtags)].slice(0, maxCount);
}

/**
 * Format date for Instagram
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatInstagramDate(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Ahora';
    } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)}h`;
    } else {
        return formatDate(date, 'DD/MM/YYYY');
    }
}

/**
 * Get default Instagram data
 * @returns {Object} Default data object
 */
function getDefaultInstagramData() {
    return {
        title: 'Radio del Volga Noticias',
        excerpt: 'Mantente informado con las últimas noticias y actualidad.',
        author: 'Redacción RDV',
        source: '@rdvnoticias',
        date: new Date(),
        category: 'general',
        tags: 'noticias,actualidad,rdv'
    };
}

/**
 * Generate Instagram Story swipe-up text
 * @param {Object} data - Content data
 * @returns {string} Swipe-up call-to-action text
 */
export function generateInstagramSwipeUpText(data) {
    const actions = [
        'Desliza hacia arriba para leer más',
        'Swipe up para la noticia completa',
        '👆 Toca para más información',
        'Lee la noticia completa aquí 👆',
        'Más detalles en nuestro sitio web 👆'
    ];
    
    // Return random action for variety
    return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * Generate Instagram caption text
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {string} Instagram caption
 */
export function generateInstagramCaption(data, templateName = 'post') {
    const config = getInstagramTemplateConfig(templateName);
    const hashtags = generateInstagramHashtags(data.tags, config);
    
    let caption = `${data.title}\n\n${data.excerpt}`;
    
    // Add call-to-action for posts
    if (templateName === 'post') {
        caption += '\n\n👉 Lee más en nuestro sitio web';
    }
    
    // Add source/author
    if (data.author && data.author !== 'Redacción RDV') {
        caption += `\n\n📝 Por: ${data.author}`;
    }
    
    // Add hashtags
    if (hashtags.length > 0) {
        caption += '\n\n' + hashtags.join(' ');
    }
    
    // Instagram caption limit is 2200 characters
    if (caption.length > 2200) {
        caption = truncateText(caption, 2200);
    }
    
    return caption;
}

/**
 * Generate Instagram Stories text overlay
 * @param {Object} data - Content data
 * @returns {Object} Text overlay configuration
 */
export function generateInstagramStoriesOverlay(data) {
    return {
        title: {
            text: data.title,
            style: {
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                textAlign: 'center',
                position: 'center'
            }
        },
        excerpt: {
            text: data.excerpt,
            style: {
                fontSize: '32px',
                fontWeight: 'normal',
                color: '#FFFFFF',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                textAlign: 'center',
                position: 'bottom'
            }
        },
        source: {
            text: data.source || '@rdvnoticias',
            style: {
                fontSize: '24px',
                fontWeight: '500',
                color: '#FFFFFF',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                textAlign: 'center',
                position: 'top'
            }
        }
    };
}

/**
 * Apply Instagram-specific styling
 * @param {HTMLElement} element - Template element
 * @param {string} templateName - Template name
 * @param {Object} data - Content data
 */
export function applyInstagramStyling(element, templateName, data) {
    const config = getInstagramTemplateConfig(templateName);
    const currentTheme = getCurrentTheme();
    
    // Apply template-specific classes
    element.classList.add('instagram-template', `instagram-${templateName}`);
    
    // Apply dimensions
    element.style.width = `${config.dimensions.width}px`;
    element.style.height = `${config.dimensions.height}px`;
    
    // Apply Instagram brand colors if no theme specified
    if (!data.theme || data.theme === 'instagram') {
        const instagramColors = instagramStylePresets.modern.colors;
        element.style.setProperty('--instagram-primary', instagramColors.primary);
        element.style.setProperty('--instagram-secondary', instagramColors.secondary);
        element.style.setProperty('--instagram-accent', instagramColors.accent);
    }
    
    // Apply template-specific styling
    switch (templateName) {
        case 'story':
            applyStorySpecificStyling(element, data);
            break;
        case 'post':
            applyPostSpecificStyling(element, data);
            break;
        case 'reel-cover':
            applyReelCoverSpecificStyling(element, data);
            break;
    }
}

/**
 * Apply Instagram Story specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyStorySpecificStyling(element, data) {
    // Add gradient overlay for better text readability
    if (data.backgroundImage) {
        element.style.background = `
            linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%),
            url('${data.backgroundImage}') center/cover
        `;
    }
    
    // Add Instagram Story specific effects
    element.classList.add('instagram-story-effects');
}

/**
 * Apply Instagram Post specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyPostSpecificStyling(element, data) {
    // Center content for square format
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    
    // Add post-specific effects
    element.classList.add('instagram-post-effects');
}

/**
 * Apply Instagram Reel Cover specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyReelCoverSpecificStyling(element, data) {
    // Emphasize visual impact for Reel covers
    element.style.filter = 'contrast(1.1) saturate(1.2)';
    
    // Add reel-specific effects
    element.classList.add('instagram-reel-effects');
}

/**
 * Generate Instagram engagement elements
 * @param {string} templateName - Template name
 * @returns {Object} Engagement elements HTML
 */
export function generateInstagramEngagementElements(templateName) {
    const elements = {
        story: {
            pollSticker: `
                <div class="instagram-poll-sticker">
                    <div class="poll-question">¿Te gustó esta noticia?</div>
                    <div class="poll-options">
                        <div class="poll-option">Sí 👍</div>
                        <div class="poll-option">No 👎</div>
                    </div>
                </div>
            `,
            questionSticker: `
                <div class="instagram-question-sticker">
                    <div class="question-prompt">¿Qué opinas?</div>
                    <div class="question-input">Escribe tu respuesta...</div>
                </div>
            `
        },
        
        post: {
            likeButton: `
                <div class="instagram-like-indicator">
                    <span class="like-icon">❤️</span>
                    <span class="like-text">Dale like si te gustó</span>
                </div>
            `,
            saveButton: `
                <div class="instagram-save-indicator">
                    <span class="save-icon">🔖</span>
                    <span class="save-text">Guarda para leer después</span>
                </div>
            `
        },
        
        'reel-cover': {
            playButton: `
                <div class="instagram-play-indicator">
                    <div class="play-button">▶️</div>
                    <div class="play-text">Toca para ver el Reel</div>
                </div>
            `
        }
    };
    
    return elements[templateName] || {};
}

/**
 * Optimize content for Instagram algorithm
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {Object} Algorithm-optimized content
 */
export function optimizeForInstagramAlgorithm(data, templateName) {
    const optimized = { ...data };
    
    // Add trending hashtags based on category
    const trendingHashtags = getTrendingHashtagsByCategory(data.category);
    const currentHashtags = generateInstagramHashtags(data.tags, getInstagramTemplateConfig(templateName));
    
    optimized.hashtags = [...currentHashtags, ...trendingHashtags].slice(0, 30);
    
    // Optimize posting time suggestion
    optimized.bestPostingTime = getBestInstagramPostingTime(data.category);
    
    // Add engagement-boosting elements
    optimized.engagementHooks = getInstagramEngagementHooks(templateName);
    
    return optimized;
}

/**
 * Get trending hashtags by category
 * @param {string} category - Content category
 * @returns {Array} Trending hashtags
 */
function getTrendingHashtagsByCategory(category) {
    const trendingByCategory = {
        politica: ['#Politica', '#Gobierno', '#Elecciones'],
        economia: ['#Economia', '#Finanzas', '#Mercado'],
        tecnologia: ['#Tecnologia', '#Innovation', '#Tech'],
        deportes: ['#Deportes', '#Sports', '#Futbol'],
        cultura: ['#Cultura', '#Arte', '#Entretenimiento'],
        general: ['#Noticias', '#Actualidad', '#Informacion']
    };
    
    return trendingByCategory[category] || trendingByCategory.general;
}

/**
 * Get best posting time for Instagram
 * @param {string} category - Content category
 * @returns {Object} Best posting time information
 */
function getBestInstagramPostingTime(category) {
    // Based on Instagram engagement data for news content
    const bestTimes = {
        politica: { day: 'weekday', time: '08:00', timezone: 'America/Argentina/Buenos_Aires' },
        economia: { day: 'weekday', time: '09:00', timezone: 'America/Argentina/Buenos_Aires' },
        deportes: { day: 'weekend', time: '15:00', timezone: 'America/Argentina/Buenos_Aires' },
        general: { day: 'weekday', time: '12:00', timezone: 'America/Argentina/Buenos_Aires' }
    };
    
    return bestTimes[category] || bestTimes.general;
}

/**
 * Get Instagram engagement hooks
 * @param {string} templateName - Template name
 * @returns {Array} Engagement hook suggestions
 */
function getInstagramEngagementHooks(templateName) {
    const hooks = {
        story: [
            'Desliza para más información',
            'Responde con tu opinión',
            'Comparte en tus Stories'
        ],
        post: [
            'Comenta tu opinión abajo',
            'Etiqueta a un amigo',
            'Guarda este post para después'
        ],
        'reel-cover': [
            'Mira el Reel completo',
            'Síguenos para más contenido',
            'Activa las notificaciones'
        ]
    };
    
    return hooks[templateName] || hooks.post;
}

/**
 * Register Instagram template helpers
 */
function registerInstagramHelpers() {
    // Register global helpers for Instagram templates
    window.InstagramTemplateHelpers = {
        generateContent: generateInstagramContent,
        generateCaption: generateInstagramCaption,
        generateSwipeUpText: generateInstagramSwipeUpText,
        applyEngagementElements: generateInstagramEngagementElements,
        optimizeForAlgorithm: optimizeForInstagramAlgorithm
    };
    
    console.log('📝 Instagram template helpers registered');
}

/**
 * Setup Instagram template event listeners
 */
function setupInstagramEventListeners() {
    // Listen for Instagram-specific template changes
    document.addEventListener('instagram:templateChanged', (e) => {
        const { templateName, data } = e.detail;
        console.log(`📷 Instagram template changed to: ${templateName}`);
        
        // Update template-specific UI elements
        updateInstagramTemplateUI(templateName, data);
    });
    
    // Listen for Instagram optimization requests
    document.addEventListener('instagram:optimize', (e) => {
        const { data, templateName } = e.detail;
        const optimized = optimizeForInstagramAlgorithm(data, templateName);
        
        // Dispatch optimized data
        document.dispatchEvent(new CustomEvent('instagram:optimized', {
            detail: { optimizedData: optimized }
        }));
    });
}

/**
 * Update Instagram template UI elements
 * @param {string} templateName - Template name
 * @param {Object} data - Template data
 */
function updateInstagramTemplateUI(templateName, data) {
    const config = getInstagramTemplateConfig(templateName);
    
    // Update character counters for Instagram limits
    updateInstagramCharacterCounters(config);
    
    // Update hashtag suggestions
    updateInstagramHashtagSuggestions(data.category);
    
    // Update engagement suggestions
    updateInstagramEngagementSuggestions(templateName);
}

/**
 * Update character counters for Instagram limits
 * @param {Object} config - Template configuration
 */
function updateInstagramCharacterCounters(config) {
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
 * Update hashtag suggestions based on category
 * @param {string} category - Content category
 */
function updateInstagramHashtagSuggestions(category) {
    const hashtagSuggestions = document.getElementById('hashtagSuggestions');
    if (hashtagSuggestions) {
        const trending = getTrendingHashtagsByCategory(category);
        hashtagSuggestions.innerHTML = trending.map(tag => 
            `<span class="hashtag-suggestion" onclick="addHashtag('${tag}')">${tag}</span>`
        ).join('');
    }
}

/**
 * Update engagement suggestions for template
 * @param {string} templateName - Template name
 */
function updateInstagramEngagementSuggestions(templateName) {
    const engagementSuggestions = document.getElementById('engagementSuggestions');
    if (engagementSuggestions) {
        const hooks = getInstagramEngagementHooks(templateName);
        engagementSuggestions.innerHTML = `
            <h4>💡 Sugerencias de engagement para ${templateName}:</h4>
            <ul>
                ${hooks.map(hook => `<li>${hook}</li>`).join('')}
            </ul>
        `;
    }
}

/**
 * Add hashtag to input field
 * @param {string} hashtag - Hashtag to add
 */
window.addHashtag = function(hashtag) {
    const tagsInput = document.getElementById('tags');
    if (tagsInput) {
        const currentTags = tagsInput.value;
        const newTag = hashtag.replace('#', '');
        
        if (!currentTags.includes(newTag)) {
            tagsInput.value = currentTags ? `${currentTags}, ${newTag}` : newTag;
            tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
};

/**
 * Export Instagram template configuration
 * @returns {Object} Instagram template export data
 */
export function exportInstagramTemplateConfig() {
    return {
        templateConfigs: instagramTemplateConfigs,
        stylePresets: instagramStylePresets,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Get Instagram style presets
 * @returns {Object} Instagram style presets
 */
export function getInstagramStylePresets() {
    return { ...instagramStylePresets };
}

// Make functions globally available
window.InstagramTemplates = {
    initialize: initializeInstagramTemplates,
    getConfig: getInstagramTemplateConfig,
    generateContent: generateInstagramContent,
    generateCaption: generateInstagramCaption,
    applyStyling: applyInstagramStyling,
    optimizeForAlgorithm: optimizeForInstagramAlgorithm,
    exportConfig: exportInstagramTemplateConfig
};