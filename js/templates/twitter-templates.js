/**
 * RDV Image Generator - Twitter Templates Module (Functional Approach with ES6 Modules)
 * Handles Twitter-specific template configurations and rendering
 * @version 1.0.0
 */

// ES6 Imports
import { sanitizeText, formatDate, truncateText } from '../utils/helpers.js';
import { validateTemplateData } from '../utils/validators.js';
import { getCurrentTheme } from '../core/color-manager.js';

// Twitter Template Configurations
const twitterTemplateConfigs = {
    post: {
        name: 'Twitter Post',
        dimensions: { width: 1200, height: 675 },
        aspectRatio: '16:9',
        description: 'Horizontal format optimized for Twitter posts and cards',
        features: ['horizontal', 'twitter-card', 'concise-text', 'hashtag-heavy'],
        textAreas: {
            title: { maxLength: 70, position: 'center' },
            excerpt: { maxLength: 120, position: 'bottom' },
            hashtags: { maxCount: 8, position: 'bottom' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Roboto',
            fallback: 'system-ui, -apple-system, sans-serif'
        },
        animations: ['fadeIn', 'slideLeft', 'typewriter']
    },
    
    header: {
        name: 'Twitter Header',
        dimensions: { width: 1500, height: 500 },
        aspectRatio: '3:1',
        description: 'Cover header format for Twitter profiles',
        features: ['wide', 'banner-style', 'minimal-text', 'brand-focus'],
        textAreas: {
            title: { maxLength: 50, position: 'center' },
            excerpt: { maxLength: 80, position: 'center' },
            hashtags: { maxCount: 0, position: 'none' }
        },
        fonts: {
            primary: 'Playfair Display',
            secondary: 'Inter',
            fallback: 'Georgia, serif'
        },
        animations: ['fadeIn', 'slideRight', 'parallax']
    },
    
    card: {
        name: 'Twitter Card',
        dimensions: { width: 1200, height: 628 },
        aspectRatio: '1.91:1',
        description: 'Summary card format for Twitter link previews',
        features: ['card-style', 'link-preview', 'summary-focused', 'metadata'],
        textAreas: {
            title: { maxLength: 60, position: 'center' },
            excerpt: { maxLength: 150, position: 'bottom' },
            hashtags: { maxCount: 3, position: 'meta' }
        },
        fonts: {
            primary: 'Inter',
            secondary: 'Roboto',
            fallback: 'system-ui, sans-serif'
        },
        animations: ['fadeIn', 'slideUp', 'pulse']
    }
};

// Twitter-specific styling presets
const twitterStylePresets = {
    classic: {
        name: 'Classic Twitter',
        description: 'Traditional Twitter blue theme',
        colors: {
            primary: '#1DA1F2',
            secondary: '#14171A',
            accent: '#657786',
            background: '#FFFFFF',
            text: '#14171A'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #1DA1F2, #0084B4)',
            overlay: 'linear-gradient(180deg, rgba(29,161,242,0.1), rgba(29,161,242,0.2))'
        }
    },
    
    dark: {
        name: 'Twitter Dark',
        description: 'Twitter dark mode theme',
        colors: {
            primary: '#1DA1F2',
            secondary: '#FFFFFF',
            accent: '#8899A6',
            background: '#15202B',
            text: '#FFFFFF'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #1DA1F2, #0084B4)',
            overlay: 'linear-gradient(180deg, rgba(21,32,43,0.8), rgba(21,32,43,0.9))'
        }
    },
    
    news: {
        name: 'Twitter News',
        description: 'News-focused design for breaking news',
        colors: {
            primary: '#E1306C',
            secondary: '#1DA1F2',
            accent: '#FFC107',
            background: '#FFFFFF',
            text: '#14171A'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #E1306C, #1DA1F2)',
            overlay: 'linear-gradient(180deg, rgba(225,48,108,0.1), rgba(29,161,242,0.1))'
        }
    },
    
    spaces: {
        name: 'Twitter Spaces',
        description: 'Twitter Spaces purple theme',
        colors: {
            primary: '#744C9E',
            secondary: '#1DA1F2',
            accent: '#9C4DE8',
            background: '#FFFFFF',
            text: '#14171A'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #744C9E, #9C4DE8)',
            overlay: 'linear-gradient(180deg, rgba(116,76,158,0.1), rgba(156,77,232,0.2))'
        }
    }
};

// Twitter character limits and constraints
const twitterConstraints = {
    maxTweetLength: 280,
    maxHashtags: 15, // Recommended maximum
    maxMentions: 10,
    hashtagCharacterLimit: 100, // Characters used by hashtags
    linkLength: 23, // Twitter's t.co link length
    imageCount: 4 // Maximum images per tweet
};

/**
 * Initialize Twitter templates
 */
export async function initializeTwitterTemplates() {
    console.log('🚀 Initializing Twitter Templates...');
    
    try {
        // Register Twitter-specific template helpers
        registerTwitterHelpers();
        
        // Setup Twitter template event listeners
        setupTwitterEventListeners();
        
        console.log('✅ Twitter Templates initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Twitter Templates:', error);
        throw error;
    }
}

/**
 * Get Twitter template configuration
 * @param {string} templateName - Template name
 * @returns {Object} Template configuration
 */
export function getTwitterTemplateConfig(templateName) {
    return twitterTemplateConfigs[templateName] || twitterTemplateConfigs.post;
}

/**
 * Get all Twitter template configurations
 * @returns {Object} All template configurations
 */
export function getAllTwitterTemplateConfigs() {
    return { ...twitterTemplateConfigs };
}

/**
 * Generate Twitter-optimized content
 * @param {Object} data - Raw content data
 * @param {string} templateName - Template name
 * @returns {Object} Optimized content for Twitter
 */
export function generateTwitterContent(data, templateName = 'post') {
    const config = getTwitterTemplateConfig(templateName);
    
    if (!validateTemplateData(data)) {
        console.warn('⚠️ Invalid template data, using defaults');
        data = getDefaultTwitterData();
    }
    
    return {
        title: generateTwitterTitle(data.title, config),
        excerpt: generateTwitterExcerpt(data.excerpt, config),
        hashtags: generateTwitterHashtags(data.tags, config),
        mentions: generateTwitterMentions(data.author, data.source),
        author: data.author || 'RDV Noticias',
        source: data.source || 'Radio del Volga',
        date: formatTwitterDate(data.date),
        backgroundImage: data.backgroundImage || '',
        category: data.category || 'general',
        template: templateName,
        config: config,
        tweetText: null // Will be generated separately
    };
}

/**
 * Generate Twitter-optimized title
 * @param {string} title - Original title
 * @param {Object} config - Template configuration
 * @returns {string} Optimized title
 */
function generateTwitterTitle(title, config) {
    if (!title) return '🔴 ÚLTIMO MOMENTO';
    
    const maxLength = config.textAreas.title.maxLength;
    let optimizedTitle = sanitizeText(title);
    
    // Add breaking news indicator for urgent content
    if (optimizedTitle.toLowerCase().includes('urgente') || 
        optimizedTitle.toLowerCase().includes('último momento')) {
        optimizedTitle = '🚨 ' + optimizedTitle;
    }
    
    // Truncate if necessary
    if (optimizedTitle.length > maxLength) {
        optimizedTitle = truncateText(optimizedTitle, maxLength);
    }
    
    return optimizedTitle;
}

/**
 * Generate Twitter-optimized excerpt
 * @param {string} excerpt - Original excerpt
 * @param {Object} config - Template configuration
 * @returns {string} Optimized excerpt
 */
function generateTwitterExcerpt(excerpt, config) {
    if (!excerpt) return 'Síguenos para más noticias 📰';
    
    const maxLength = config.textAreas.excerpt.maxLength;
    let optimizedExcerpt = sanitizeText(excerpt);
    
    // Truncate if necessary
    if (optimizedExcerpt.length > maxLength) {
        optimizedExcerpt = truncateText(optimizedExcerpt, maxLength);
    }
    
    return optimizedExcerpt;
}

/**
 * Generate Twitter hashtags
 * @param {string} tags - Comma-separated tags
 * @param {Object} config - Template configuration
 * @returns {Array} Array of hashtags
 */
function generateTwitterHashtags(tags, config) {
    const maxCount = config.textAreas.hashtags.maxCount;
    
    // Default hashtags for RDV
    const defaultHashtags = ['#RDVNoticias', '#RadioDelVolga'];
    
    if (!tags || maxCount === 0) {
        return defaultHashtags.slice(0, Math.min(maxCount, defaultHashtags.length));
    }
    
    // Parse custom tags
    const customHashtags = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 25) // Twitter hashtag length limit
        .map(tag => '#' + tag.replace(/\s+/g, '').replace(/[^\w]/g, ''))
        .slice(0, Math.max(0, maxCount - defaultHashtags.length));
    
    const allHashtags = [...customHashtags, ...defaultHashtags];
    
    // Remove duplicates and limit count
    return [...new Set(allHashtags)].slice(0, maxCount);
}

/**
 * Generate Twitter mentions
 * @param {string} author - Author name
 * @param {string} source - Source name
 * @returns {Array} Array of mentions
 */
function generateTwitterMentions(author, source) {
    const mentions = [];
    
    // Add RDV official account
    mentions.push('@RadioDelVolga');
    
    // Add author mention if it looks like a Twitter handle
    if (author && author.startsWith('@') && author.length > 1) {
        mentions.push(author);
    }
    
    // Add source mention if different from RDV
    if (source && source !== 'Radio del Volga' && source.startsWith('@')) {
        mentions.push(source);
    }
    
    // Remove duplicates and limit
    return [...new Set(mentions)].slice(0, twitterConstraints.maxMentions);
}

/**
 * Format date for Twitter
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatTwitterDate(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    
    // Twitter uses relative time for recent posts
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m`;
    } else if (diffHours < 24) {
        return `${diffHours}h`;
    } else {
        return formatDate(date, 'DD MMM');
    }
}

/**
 * Get default Twitter data
 * @returns {Object} Default data object
 */
function getDefaultTwitterData() {
    return {
        title: 'Radio del Volga - Noticias',
        excerpt: 'Tu fuente confiable de información y actualidad.',
        author: 'Redacción RDV',
        source: 'Radio del Volga',
        date: new Date(),
        category: 'general',
        tags: 'noticias,rdv,actualidad'
    };
}

/**
 * Generate Twitter tweet text
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {Object} Tweet text with metadata
 */
export function generateTwitterTweetText(data, templateName = 'post') {
    const config = getTwitterTemplateConfig(templateName);
    const hashtags = generateTwitterHashtags(data.tags, config);
    const mentions = generateTwitterMentions(data.author, data.source);
    
    // Start building tweet text
    let tweetParts = [];
    
    // Add title (required)
    tweetParts.push(data.title);
    
    // Add excerpt if space allows
    let currentLength = data.title.length;
    const hashtagsText = hashtags.join(' ');
    const mentionsText = mentions.length > 0 ? mentions.join(' ') : '';
    const linkLength = twitterConstraints.linkLength; // For article link
    
    // Calculate space needed for hashtags, mentions, and link
    const reservedSpace = hashtagsText.length + mentionsText.length + linkLength + 4; // +4 for spaces
    const availableSpace = twitterConstraints.maxTweetLength - currentLength - reservedSpace;
    
    if (data.excerpt && availableSpace > 20) { // Minimum 20 chars for meaningful excerpt
        const excerptToAdd = truncateText(data.excerpt, availableSpace - 3); // -3 for ellipsis
        tweetParts.push(excerptToAdd);
    }
    
    // Build final tweet
    let tweetText = tweetParts.join('\n\n');
    
    // Add article link placeholder
    tweetText += '\n\n📰 Leer más: [LINK]';
    
    // Add mentions
    if (mentionsText) {
        tweetText += '\n\nVía ' + mentionsText;
    }
    
    // Add hashtags
    if (hashtagsText) {
        tweetText += '\n\n' + hashtagsText;
    }
    
    // Validate length (excluding the [LINK] placeholder)
    const finalLength = tweetText.replace('[LINK]', 'https://t.co/xxxxxxxxxx').length;
    
    return {
        text: tweetText,
        length: finalLength,
        isValid: finalLength <= twitterConstraints.maxTweetLength,
        hashtags: hashtags,
        mentions: mentions,
        hasLink: true,
        charactersRemaining: twitterConstraints.maxTweetLength - finalLength
    };
}

/**
 * Generate Twitter card metadata
 * @param {Object} data - Content data
 * @returns {Object} Twitter card metadata
 */
export function generateTwitterCardMetadata(data) {
    return {
        'twitter:card': 'summary_large_image',
        'twitter:site': '@RadioDelVolga',
        'twitter:creator': data.author && data.author.startsWith('@') ? data.author : '@RadioDelVolga',
        'twitter:title': data.title,
        'twitter:description': data.excerpt,
        'twitter:image': data.backgroundImage || 'assets/images/logos/rdv-logo.svg',
        'twitter:url': generateTwitterArticleUrl(data),
        'twitter:domain': 'radiodelvolga.com'
    };
}

/**
 * Generate article URL for Twitter sharing
 * @param {Object} data - Content data
 * @returns {string} Article URL
 */
function generateTwitterArticleUrl(data) {
    const baseUrl = 'https://radiodelvolga.com';
    const slug = data.title ? 
        data.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) : 
        'noticia';
    
    return `${baseUrl}/noticias/${slug}?utm_source=twitter&utm_medium=social&utm_campaign=rdv_news`;
}

/**
 * Apply Twitter-specific styling
 * @param {HTMLElement} element - Template element
 * @param {string} templateName - Template name
 * @param {Object} data - Content data
 */
export function applyTwitterStyling(element, templateName, data) {
    const config = getTwitterTemplateConfig(templateName);
    const currentTheme = getCurrentTheme();
    
    // Apply template-specific classes
    element.classList.add('twitter-template', `twitter-${templateName}`);
    
    // Apply dimensions
    element.style.width = `${config.dimensions.width}px`;
    element.style.height = `${config.dimensions.height}px`;
    
    // Apply Twitter brand colors if no theme specified
    if (!data.theme || data.theme === 'twitter') {
        const twitterColors = twitterStylePresets.classic.colors;
        element.style.setProperty('--twitter-primary', twitterColors.primary);
        element.style.setProperty('--twitter-secondary', twitterColors.secondary);
        element.style.setProperty('--twitter-accent', twitterColors.accent);
    }
    
    // Apply template-specific styling
    switch (templateName) {
        case 'post':
            applyPostSpecificStyling(element, data);
            break;
        case 'header':
            applyHeaderSpecificStyling(element, data);
            break;
        case 'card':
            applyCardSpecificStyling(element, data);
            break;
    }
}

/**
 * Apply Twitter Post specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyPostSpecificStyling(element, data) {
    // Twitter post card styling
    element.style.borderRadius = '16px';
    element.style.border = '1px solid #E1E8ED';
    element.style.overflow = 'hidden';
    
    // Add Twitter-like hover effect
    element.style.transition = 'all 0.2s ease';
    element.addEventListener('mouseenter', () => {
        element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    });
    element.addEventListener('mouseleave', () => {
        element.style.boxShadow = 'none';
    });
    
    // Add post-specific effects
    element.classList.add('twitter-post-effects');
}

/**
 * Apply Twitter Header specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyHeaderSpecificStyling(element, data) {
    // Wide banner styling
    element.style.background = data.backgroundImage ? 
        `linear-gradient(135deg, rgba(29,161,242,0.7), rgba(0,132,180,0.7)), url('${data.backgroundImage}') center/cover` :
        'linear-gradient(135deg, #1DA1F2, #0084B4)';
    
    // Ensure proper text visibility
    element.style.color = '#FFFFFF';
    element.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
    
    // Add header-specific effects
    element.classList.add('twitter-header-effects');
}

/**
 * Apply Twitter Card specific styling
 * @param {HTMLElement} element - Template element
 * @param {Object} data - Content data
 */
function applyCardSpecificStyling(element, data) {
    // Twitter card styling
    element.style.border = '1px solid #E1E8ED';
    element.style.borderRadius = '14px';
    element.style.overflow = 'hidden';
    element.style.backgroundColor = '#FFFFFF';
    
    // Add subtle shadow
    element.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
    
    // Add card-specific effects
    element.classList.add('twitter-card-effects');
}

/**
 * Generate Twitter engagement elements
 * @param {string} templateName - Template name
 * @returns {Object} Engagement elements HTML
 */
export function generateTwitterEngagementElements(templateName) {
    const elements = {
        post: {
            actions: `
                <div class="twitter-actions">
                    <button class="twitter-action-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"/>
                        </svg>
                    </button>
                    <button class="twitter-action-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.061 0s-.293.768 0 1.061l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.293.294-.767.001-1.06z"/>
                            <path d="M10.22 5.69c.293-.293.293-.768 0-1.061L6.72 1.129c-.293-.293-.768-.293-1.061 0L2.159 4.629c-.293.293-.293.768 0 1.061s.768.293 1.061 0L5.44 3.47v10.24c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-5.85c-1.24 0-2.25-1.01-2.25-2.25V3.47l2.22 2.22c.293.292.768.292 1.061-.001z"/>
                        </svg>
                    </button>
                    <button class="twitter-action-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.822-4.255-3.902-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"/>
                        </svg>
                    </button>
                    <button class="twitter-action-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"/>
                            <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"/>
                        </svg>
                    </button>
                </div>
            `,
            metrics: `
                <div class="twitter-metrics">
                    <span class="metric">💬 145</span>
                    <span class="metric">🔄 89</span>
                    <span class="metric">❤️ 342</span>
                </div>
            `
        },
        
        header: {
            profileInfo: `
                <div class="twitter-profile-info">
                    <div class="profile-stats">
                        <span class="stat"><strong>1.2K</strong> Siguiendo</span>
                        <span class="stat"><strong>45.8K</strong> Seguidores</span>
                    </div>
                </div>
            `
        },
        
        card: {
            cardFooter: `
                <div class="twitter-card-footer">
                    <div class="card-source">
                        <img src="assets/images/logos/rdv-logo.svg" width="16" height="16" alt="RDV">
                        <span>radiodelvolga.com</span>
                    </div>
                </div>
            `
        }
    };
    
    return elements[templateName] || {};
}

/**
 * Optimize content for Twitter algorithm
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 * @returns {Object} Algorithm-optimized content
 */
export function optimizeForTwitterAlgorithm(data, templateName) {
    const optimized = { ...data };
    
    // Twitter prioritizes engagement and recency
    optimized.engagementTactics = getTwitterEngagementTactics(data.category);
    
    // Optimize for Twitter's algorithm preferences
    optimized.algorithmOptimizations = getTwitterAlgorithmOptimizations(templateName);
    
    // Add Twitter-specific posting recommendations
    optimized.bestPostingTime = getBestTwitterPostingTime(data.category);
    
    // Add trending hashtag suggestions
    optimized.trendingHashtags = getTrendingHashtags(data.category);
    
    return optimized;
}

/**
 * Get Twitter engagement tactics by category
 * @param {string} category - Content category
 * @returns {Array} Engagement tactics
 */
function getTwitterEngagementTactics(category) {
    const tacticsByCategory = {
        politica: [
            'Usar emojis de bandera 🇦🇷',
            'Hacer preguntas directas',
            'Crear hilos informativos',
            'Mencionar figuras públicas relevantes'
        ],
        economia: [
            'Usar emojis de dinero 💰📈',
            'Incluir datos específicos',
            'Crear polls sobre impacto económico',
            'Compartir gráficos o infografías'
        ],
        deportes: [
            'Usar emojis deportivos ⚽🏆',
            'Crear contenido en tiempo real',
            'Mencionar equipos y jugadores',
            'Usar hashtags de eventos deportivos'
        ],
        tecnologia: [
            'Usar emojis tech 💻📱',
            'Compartir threads explicativos',
            'Mencionar empresas tecnológicas',
            'Incluir enlaces a fuentes técnicas'
        ],
        general: [
            'Usar emojis relevantes',
            'Hacer preguntas abiertas',
            'Crear contenido visual atractivo',
            'Responder rápidamente a comentarios'
        ]
    };
    
    return tacticsByCategory[category] || tacticsByCategory.general;
}

/**
 * Get Twitter algorithm optimizations
 * @param {string} templateName - Template name
 * @returns {Object} Algorithm optimization suggestions
 */
function getTwitterAlgorithmOptimizations(templateName) {
    return {
        post: {
            postWithImages: true,
            useThreadsForLongContent: true,
            engageQuicklyWithReplies: true,
            postAtOptimalTimes: true
        },
        header: {
            updateRegularly: true,
            alignWithCurrentEvents: true,
            useSeasonalElements: true
        },
        card: {
            optimizeImageSize: true,
            useCompellingTitles: true,
            includeCallToAction: true
        }
    }[templateName] || {};
}

/**
 * Get best posting time for Twitter
 * @param {string} category - Content category
 * @returns {Object} Best posting time information
 */
function getBestTwitterPostingTime(category) {
    // Based on Twitter engagement data for news content in Argentina
    const bestTimes = {
        politica: { day: 'weekday', time: '08:00', timezone: 'America/Argentina/Buenos_Aires' },
        economia: { day: 'weekday', time: '09:30', timezone: 'America/Argentina/Buenos_Aires' },
        deportes: { day: 'weekend', time: '15:00', timezone: 'America/Argentina/Buenos_Aires' },
        tecnologia: { day: 'weekday', time: '10:00', timezone: 'America/Argentina/Buenos_Aires' },
        general: { day: 'weekday', time: '12:00', timezone: 'America/Argentina/Buenos_Aires' }
    };
    
    return bestTimes[category] || bestTimes.general;
}

/**
 * Get trending hashtags suggestions
 * @param {string} category - Content category
 * @returns {Array} Trending hashtags
 */
function getTrendingHashtags(category) {
    // This would ideally connect to Twitter API for real trending hashtags
    const trendingByCategory = {
        politica: ['#Argentina', '#Política', '#Elecciones2023', '#Congreso'],
        economia: ['#Economía', '#Inflación', '#Dólar', '#Mercados'],
        deportes: ['#Fútbol', '#Argentina', '#DeporteArgentino', '#Copa'],
        tecnologia: ['#Tech', '#Innovación', '#Startup', '#IA'],
        general: ['#Noticias', '#Argentina', '#Actualidad', '#Info']
    };
    
    return trendingByCategory[category] || trendingByCategory.general;
}

/**
 * Generate Twitter thread
 * @param {Object} data - Content data
 * @param {number} maxTweets - Maximum number of tweets in thread
 * @returns {Array} Array of tweet texts
 */
export function generateTwitterThread(data, maxTweets = 5) {
    const thread = [];
    
    // First tweet - introduction
    const firstTweet = generateTwitterTweetText(data, 'post');
    thread.push({
        ...firstTweet,
        text: firstTweet.text.replace('\n\n📰 Leer más: [LINK]', ''),
        order: 1
    });
    
    // Split content into additional tweets if needed
    if (data.content && data.content.length > 200) {
        const contentChunks = splitContentIntoTweets(data.content, maxTweets - 1);
        
        contentChunks.forEach((chunk, index) => {
            const tweetNumber = index + 2;
            const isLastTweet = tweetNumber === Math.min(maxTweets, contentChunks.length + 1);
            
            let tweetText = `${tweetNumber}/${Math.min(maxTweets, contentChunks.length + 1)} ${chunk}`;
            
            // Add link and hashtags to last tweet
            if (isLastTweet) {
                tweetText += '\n\n📰 Leer más: [LINK]';
                const hashtags = generateTwitterHashtags(data.tags, { textAreas: { hashtags: { maxCount: 3 } } });
                if (hashtags.length > 0) {
                    tweetText += '\n\n' + hashtags.join(' ');
                }
            }
            
            thread.push({
                text: tweetText,
                length: tweetText.replace('[LINK]', 'https://t.co/xxxxxxxxxx').length,
                isValid: tweetText.replace('[LINK]', 'https://t.co/xxxxxxxxxx').length <= twitterConstraints.maxTweetLength,
                order: tweetNumber
            });
        });
    }
    
    return thread;
}

/**
 * Split content into tweet-sized chunks
 * @param {string} content - Content to split
 * @param {number} maxChunks - Maximum number of chunks
 * @returns {Array} Array of content chunks
 */
function splitContentIntoTweets(content, maxChunks) {
    const maxChunkLength = 250; // Leave room for tweet numbering and other elements
    const chunks = [];
    
    // Split by sentences first
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkLength) {
            currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk + '.');
                currentChunk = trimmedSentence;
            } else {
                // Sentence is too long, split it
                chunks.push(truncateText(trimmedSentence, maxChunkLength));
            }
        }
        
        if (chunks.length >= maxChunks) break;
    }
    
    // Add remaining content
    if (currentChunk && chunks.length < maxChunks) {
        chunks.push(currentChunk + '.');
    }
    
    return chunks;
}

/**
 * Register Twitter template helpers
 */
function registerTwitterHelpers() {
    // Register global helpers for Twitter templates
    window.TwitterTemplateHelpers = {
        generateContent: generateTwitterContent,
        generateTweetText: generateTwitterTweetText,
        generateCardMetadata: generateTwitterCardMetadata,
        generateThread: generateTwitterThread,
        optimizeForAlgorithm: optimizeForTwitterAlgorithm
    };
    
    console.log('📝 Twitter template helpers registered');
}

/**
 * Setup Twitter template event listeners
 */
function setupTwitterEventListeners() {
    // Listen for Twitter-specific template changes
    document.addEventListener('twitter:templateChanged', (e) => {
        const { templateName, data } = e.detail;
        console.log(`🐦 Twitter template changed to: ${templateName}`);
        
        // Update template-specific UI elements
        updateTwitterTemplateUI(templateName, data);
    });
    
    // Listen for Twitter optimization requests
    document.addEventListener('twitter:optimize', (e) => {
        const { data, templateName } = e.detail;
        const optimized = optimizeForTwitterAlgorithm(data, templateName);
        
        // Dispatch optimized data
        document.dispatchEvent(new CustomEvent('twitter:optimized', {
            detail: { optimizedData: optimized }
        }));
    });
    
    // Listen for tweet length validation
    document.addEventListener('twitter:validateTweet', (e) => {
        const { tweetText } = e.detail;
        const isValid = tweetText.length <= twitterConstraints.maxTweetLength;
        
        document.dispatchEvent(new CustomEvent('twitter:tweetValidated', {
            detail: { isValid, length: tweetText.length, maxLength: twitterConstraints.maxTweetLength }
        }));
    });
}

/**
 * Update Twitter template UI elements
 * @param {string} templateName - Template name
 * @param {Object} data - Template data
 */
function updateTwitterTemplateUI(templateName, data) {
    const config = getTwitterTemplateConfig(templateName);
    
    // Update character counters for Twitter limits
    updateTwitterCharacterCounters(config);
    
    // Update tweet preview
    updateTwitterTweetPreview(data, templateName);
    
    // Update engagement suggestions
    updateTwitterEngagementSuggestions(templateName, data.category);
    
    // Update posting time recommendations
    updateTwitterPostingTimeRecommendations(data.category);
}

/**
 * Update character counters for Twitter limits
 * @param {Object} config - Template configuration
 */
function updateTwitterCharacterCounters(config) {
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
 * Update Twitter tweet preview
 * @param {Object} data - Content data
 * @param {string} templateName - Template name
 */
function updateTwitterTweetPreview(data, templateName) {
    const tweetPreview = document.getElementById('twitterTweetPreview');
    if (tweetPreview) {
        const tweetData = generateTwitterTweetText(data, templateName);
        
        tweetPreview.innerHTML = `
            <div class="tweet-preview ${tweetData.isValid ? 'valid' : 'invalid'}">
                <div class="tweet-header">
                    <img src="assets/images/logos/rdv-logo.svg" width="40" height="40" alt="RDV">
                    <div class="tweet-author">
                        <strong>Radio del Volga</strong>
                        <span>@RadioDelVolga</span>
                    </div>
                </div>
                <div class="tweet-content">
                    ${tweetData.text.replace('[LINK]', 'radiodelvolga.com/noticia')}
                </div>
                <div class="tweet-stats">
                    <span class="tweet-length ${tweetData.isValid ? 'valid' : 'invalid'}">
                        ${tweetData.length}/${twitterConstraints.maxTweetLength}
                    </span>
                    <span class="characters-remaining">
                        ${tweetData.charactersRemaining} caracteres restantes
                    </span>
                </div>
            </div>
        `;
    }
}

/**
 * Update engagement suggestions for Twitter
 * @param {string} templateName - Template name
 * @param {string} category - Content category
 */
function updateTwitterEngagementSuggestions(templateName, category) {
    const engagementSuggestions = document.getElementById('engagementSuggestions');
    if (engagementSuggestions) {
        const tactics = getTwitterEngagementTactics(category);
        const trending = getTrendingHashtags(category);
        
        engagementSuggestions.innerHTML = `
            <h4>💡 Tácticas de engagement para Twitter:</h4>
            <ul>
                ${tactics.map(tactic => `<li>${tactic}</li>`).join('')}
            </ul>
            <h4>📈 Hashtags trending sugeridos:</h4>
            <div class="trending-hashtags">
                ${trending.map(hashtag => `<span class="hashtag">${hashtag}</span>`).join('')}
            </div>
        `;
    }
}

/**
 * Update posting time recommendations
 * @param {string} category - Content category
 */
function updateTwitterPostingTimeRecommendations(category) {
    const timeRecommendations = document.getElementById('postingTimeRecommendations');
    if (timeRecommendations) {
        const bestTime = getBestTwitterPostingTime(category);
        timeRecommendations.innerHTML = `
            <h4>⏰ Mejor horario para Twitter:</h4>
            <p>${bestTime.day === 'weekday' ? 'Días de semana' : 'Fines de semana'} a las ${bestTime.time}</p>
        `;
    }
}

/**
 * Export Twitter template configuration
 * @returns {Object} Twitter template export data
 */
export function exportTwitterTemplateConfig() {
    return {
        templateConfigs: twitterTemplateConfigs,
        stylePresets: twitterStylePresets,
        constraints: twitterConstraints,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Get Twitter style presets
 * @returns {Object} Twitter style presets
 */
export function getTwitterStylePresets() {
    return { ...twitterStylePresets };
}

/**
 * Get Twitter constraints
 * @returns {Object} Twitter platform constraints
 */
export function getTwitterConstraints() {
    return { ...twitterConstraints };
}

// Make functions globally available
window.TwitterTemplates = {
    initialize: initializeTwitterTemplates,
    getConfig: getTwitterTemplateConfig,
    generateContent: generateTwitterContent,
    generateTweetText: generateTwitterTweetText,
    generateThread: generateTwitterThread,
    applyStyling: applyTwitterStyling,
    optimizeForAlgorithm: optimizeForTwitterAlgorithm,
    exportConfig: exportTwitterTemplateConfig
};
