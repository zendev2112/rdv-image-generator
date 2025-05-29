/**
 * RDV Image Generator - Social Preview Module (Functional Approach with ES6 Modules)
 * Handles social media sharing, preview generation, and direct publishing
 * @version 1.0.0
 */

// ES6 Imports
import { sanitizeText, formatDate, generateShareUrl, encodeForUrl } from '../utils/helpers.js';
import { validatePlatform, validateShareData } from '../utils/validators.js';
import { generateImage } from '../core/image-capture.js';
import { getCurrentTemplateData, getPlatformConfig } from '../core/template-engine.js';

// Social Preview State
let shareOptions = {
    includeWatermark: true,
    optimizeForPlatform: true,
    autoResize: true,
    shareWithPreview: true
};

// Platform Share Configurations
const platformShareConfigs = {
    instagram: {
        name: 'Instagram',
        icon: '📷',
        shareUrl: null, // Instagram doesn't support direct web sharing
        supportsDirectShare: false,
        supportsWebShare: true,
        maxTextLength: 2200,
        hashtagLimit: 30,
        aspectRatios: {
            story: { width: 9, height: 16 },
            post: { width: 1, height: 1 },
            'reel-cover': { width: 9, height: 16 }
        }
    },
    facebook: {
        name: 'Facebook',
        icon: '👥',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php',
        supportsDirectShare: true,
        supportsWebShare: true,
        maxTextLength: 63206,
        hashtagLimit: null,
        aspectRatios: {
            post: { width: 16, height: 9 },
            story: { width: 9, height: 16 },
            cover: { width: 16, height: 9 }
        }
    },
    twitter: {
        name: 'Twitter',
        icon: '🐦',
        shareUrl: 'https://twitter.com/intent/tweet',
        supportsDirectShare: true,
        supportsWebShare: true,
        maxTextLength: 280,
        hashtagLimit: null,
        aspectRatios: {
            post: { width: 16, height: 9 },
            header: { width: 3, height: 1 },
            card: { width: 2, height: 1 }
        }
    },
    linkedin: {
        name: 'LinkedIn',
        icon: '💼',
        shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
        supportsDirectShare: true,
        supportsWebShare: true,
        maxTextLength: 3000,
        hashtagLimit: null,
        aspectRatios: {
            post: { width: 16, height: 9 }
        }
    },
    whatsapp: {
        name: 'WhatsApp',
        icon: '📱',
        shareUrl: 'https://wa.me/',
        supportsDirectShare: true,
        supportsWebShare: true,
        maxTextLength: 65536,
        hashtagLimit: null,
        aspectRatios: {
            post: { width: 1, height: 1 }
        }
    },
    telegram: {
        name: 'Telegram',
        icon: '✈️',
        shareUrl: 'https://t.me/share/url',
        supportsDirectShare: true,
        supportsWebShare: true,
        maxTextLength: 4096,
        hashtagLimit: null,
        aspectRatios: {
            post: { width: 1, height: 1 }
        }
    }
};

// RDV News API Integration
const rdvApiConfig = {
    baseUrl: 'https://rdv-news-api.vercel.app/api',
    endpoints: {
        socialMediaImages: '/social-media-images',
        publish: '/publish',
        schedule: '/schedule'
    }
};

/**
 * Initialize social preview module
 */
export async function initializeSocialPreview() {
    console.log('🚀 Initializing Social Preview...');
    
    try {
        // Load saved share options
        loadShareOptions();
        
        // Setup social preview event listeners
        setupSocialPreviewEventListeners();
        
        // Initialize Web Share API if available
        initializeWebShareAPI();
        
        console.log('✅ Social Preview initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Social Preview:', error);
        throw error;
    }
}

/**
 * Load share options from localStorage
 */
function loadShareOptions() {
    try {
        const saved = localStorage.getItem('rdv_share_options');
        if (saved) {
            shareOptions = { ...shareOptions, ...JSON.parse(saved) };
        }
        console.log('📋 Share options loaded');
    } catch (error) {
        console.warn('⚠️ Failed to load share options:', error);
    }
}

/**
 * Save share options to localStorage
 */
function saveShareOptions() {
    try {
        localStorage.setItem('rdv_share_options', JSON.stringify(shareOptions));
        console.log('💾 Share options saved');
    } catch (error) {
        console.warn('⚠️ Failed to save share options:', error);
    }
}

/**
 * Share to social media platform
 * @param {string} platform - Target platform
 * @param {Object} customData - Custom share data
 * @returns {Promise<boolean>} Share success status
 */
export async function shareToSocial(platform = null, customData = {}) {
    try {
        // Detect platform from current selection if not provided
        if (!platform) {
            platform = window.RDVImageGenerator?.currentPlatform || 'facebook';
        }
        
        if (!validatePlatform(platform)) {
            throw new Error(`Invalid platform: ${platform}`);
        }
        
        // Show sharing modal
        showSharingModal(platform);
        
        // Update progress
        updateSharingProgress(20, 'Preparando contenido...');
        
        // Generate image for sharing
        const imageBlob = await generateImage({ 
            autoDownload: false,
            format: getOptimalFormat(platform)
        });
        
        // Update progress
        updateSharingProgress(50, 'Optimizando para la plataforma...');
        
        // Prepare share data
        const shareData = await prepareShareData(platform, imageBlob, customData);
        
        // Update progress
        updateSharingProgress(70, 'Configurando compartir...');
        
        // Attempt different share methods based on platform support
        const success = await attemptShare(platform, shareData);
        
        // Update progress
        updateSharingProgress(100, success ? 'Compartido exitosamente' : 'Preparado para compartir');
        
        // Hide modal after delay
        setTimeout(() => hideSharingModal(), 1500);
        
        if (typeof window.showToast === 'function') {
            const message = success ? 'Contenido compartido exitosamente' : 'Ventana de compartir abierta';
            window.showToast(message, 'success');
        }
        
        console.log(`✅ Share initiated for ${platform}`);
        return success;
        
    } catch (error) {
        console.error('❌ Error sharing to social:', error);
        
        hideSharingModal();
        
        if (typeof window.showToast === 'function') {
            window.showToast(`Error al compartir: ${error.message}`, 'error');
        }
        
        return false;
    }
}

/**
 * Prepare share data for platform
 * @param {string} platform - Target platform
 * @param {Blob} imageBlob - Generated image
 * @param {Object} customData - Custom data override
 * @returns {Promise<Object>} Prepared share data
 */
async function prepareShareData(platform, imageBlob, customData = {}) {
    const config = platformShareConfigs[platform];
    const templateData = getCurrentTemplateData();
    const formData = collectCurrentFormData();
    
    // Create image URL for sharing
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Prepare text content
    const shareText = generateShareText(platform, formData, customData);
    
    // Prepare hashtags
    const hashtags = generateHashtags(formData.tags, platform);
    
    // Prepare URLs
    const shareUrl = customData.url || generateArticleUrl(formData);
    
    const shareData = {
        title: formData.title || 'RDV Noticias',
        text: shareText,
        url: shareUrl,
        imageUrl: imageUrl,
        imageBlob: imageBlob,
        hashtags: hashtags,
        platform: platform,
        config: config,
        ...customData
    };
    
    // Validate share data
    if (!validateShareData(shareData)) {
        console.warn('⚠️ Share data validation failed, using defaults');
    }
    
    return shareData;
}

/**
 * Generate share text optimized for platform
 * @param {string} platform - Target platform
 * @param {Object} formData - Form data
 * @param {Object} customData - Custom text overrides
 * @returns {string} Generated share text
 */
function generateShareText(platform, formData, customData = {}) {
    const config = platformShareConfigs[platform];
    
    // Use custom text if provided
    if (customData.text) {
        return truncateText(customData.text, config.maxTextLength);
    }
    
    // Generate platform-specific text
    let shareText = '';
    
    switch (platform) {
        case 'twitter':
            shareText = `📰 ${formData.title}\n\n${formData.excerpt}`;
            break;
            
        case 'facebook':
            shareText = `📰 ${formData.title}\n\n${formData.excerpt}\n\n👉 Lee más en RDV Noticias`;
            break;
            
        case 'linkedin':
            shareText = `📰 ${formData.title}\n\n${formData.excerpt}\n\nFuente: ${formData.source || 'RDV Noticias'}`;
            break;
            
        case 'whatsapp':
            shareText = `📰 *${formData.title}*\n\n${formData.excerpt}\n\n_Vía RDV Noticias_`;
            break;
            
        case 'telegram':
            shareText = `📰 *${formData.title}*\n\n${formData.excerpt}\n\n@rdvnoticias`;
            break;
            
        default:
            shareText = `${formData.title}\n\n${formData.excerpt}`;
    }
    
    // Truncate if necessary
    return truncateText(shareText, config.maxTextLength);
}

/**
 * Generate hashtags for platform
 * @param {string} tagsString - Comma-separated tags
 * @param {string} platform - Target platform
 * @returns {Array} Array of hashtags
 */
function generateHashtags(tagsString, platform) {
    if (!tagsString) return [];
    
    const config = platformShareConfigs[platform];
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // Convert to hashtags
    let hashtags = tags.map(tag => 
        '#' + tag.replace(/\s+/g, '').replace(/[^\w]/g, '')
    );
    
    // Add default RDV hashtags
    const defaultHashtags = ['#RDVNoticias', '#RadioDelVolga'];
    hashtags = [...hashtags, ...defaultHashtags];
    
    // Remove duplicates
    hashtags = [...new Set(hashtags)];
    
    // Limit hashtags if platform has limit
    if (config.hashtagLimit && hashtags.length > config.hashtagLimit) {
        hashtags = hashtags.slice(0, config.hashtagLimit);
    }
    
    return hashtags;
}

/**
 * Generate article URL for sharing
 * @param {Object} formData - Form data
 * @returns {string} Article URL
 */
function generateArticleUrl(formData) {
    // This would typically link to the actual article
    // For now, return a placeholder or RDV website
    const baseUrl = 'https://radiodelvolga.com';
    const slug = formData.title ? 
        formData.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) : 
        'noticia';
    
    return `${baseUrl}/noticias/${slug}`;
}

/**
 * Attempt to share using various methods
 * @param {string} platform - Target platform
 * @param {Object} shareData - Share data
 * @returns {Promise<boolean>} Share success status
 */
async function attemptShare(platform, shareData) {
    const config = shareData.config;
    
    // Try Web Share API first (if supported and available)
    if (navigator.share && config.supportsWebShare) {
        try {
            await navigator.share({
                title: shareData.title,
                text: shareData.text,
                url: shareData.url
                // Note: files/images not widely supported yet
            });
            return true;
        } catch (error) {
            console.log('Web Share API failed, trying fallback methods');
        }
    }
    
    // Try platform-specific sharing
    if (config.supportsDirectShare && config.shareUrl) {
        return shareToPlatformUrl(platform, shareData);
    }
    
    // Fallback to showing share modal with instructions
    showShareInstructionsModal(platform, shareData);
    return false;
}

/**
 * Share to platform-specific URL
 * @param {string} platform - Target platform
 * @param {Object} shareData - Share data
 * @returns {boolean} Success status
 */
function shareToPlatformUrl(platform, shareData) {
    const config = shareData.config;
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `${config.shareUrl}?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
            break;
            
        case 'twitter':
            const twitterText = `${shareData.text} ${shareData.hashtags.join(' ')}`;
            shareUrl = `${config.shareUrl}?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareData.url)}`;
            break;
            
        case 'linkedin':
            shareUrl = `${config.shareUrl}?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`;
            break;
            
        case 'whatsapp':
            const whatsappText = `${shareData.text}\n${shareData.url}`;
            shareUrl = `${config.shareUrl}?text=${encodeURIComponent(whatsappText)}`;
            break;
            
        case 'telegram':
            shareUrl = `${config.shareUrl}?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
            break;
            
        default:
            return false;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        return true;
    }
    
    return false;
}

/**
 * Show share instructions modal for platforms without direct sharing
 * @param {string} platform - Target platform
 * @param {Object} shareData - Share data
 */
function showShareInstructionsModal(platform, shareData) {
    const modal = document.getElementById('shareInstructionsModal') || createShareInstructionsModal();
    
    const instructions = generateShareInstructions(platform, shareData);
    
    modal.querySelector('.share-instructions-content').innerHTML = `
        <div class="share-platform-info">
            <div class="platform-icon">${shareData.config.icon}</div>
            <h3>Compartir en ${shareData.config.name}</h3>
        </div>
        
        <div class="share-steps">
            ${instructions}
        </div>
        
        <div class="share-content-preview">
            <h4>Contenido para compartir:</h4>
            <div class="share-text">${shareData.text}</div>
            ${shareData.hashtags.length > 0 ? `
                <div class="share-hashtags">
                    ${shareData.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="share-actions">
            <button class="btn-primary" onclick="copyShareContent('${platform}')">
                📋 Copiar Contenido
            </button>
            <button class="btn-secondary" onclick="downloadShareImage('${platform}')">
                💾 Descargar Imagen
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Generate platform-specific share instructions
 * @param {string} platform - Target platform
 * @param {Object} shareData - Share data
 * @returns {string} HTML instructions
 */
function generateShareInstructions(platform, shareData) {
    switch (platform) {
        case 'instagram':
            return `
                <ol>
                    <li>Abre la app de Instagram en tu dispositivo móvil</li>
                    <li>Toca el ícono "+" para crear una nueva publicación</li>
                    <li>Selecciona la imagen descargada de tu galería</li>
                    <li>Agrega el texto y hashtags proporcionados</li>
                    <li>Publica tu contenido</li>
                </ol>
            `;
            
        default:
            return `
                <ol>
                    <li>Descarga la imagen generada</li>
                    <li>Copia el texto proporcionado</li>
                    <li>Abre ${shareData.config.name}</li>
                    <li>Crea una nueva publicación</li>
                    <li>Sube la imagen y pega el texto</li>
                    <li>Publica tu contenido</li>
                </ol>
            `;
    }
}

/**
 * Create share instructions modal
 * @returns {HTMLElement} Modal element
 */
function createShareInstructionsModal() {
    const modal = document.createElement('div');
    modal.id = 'shareInstructionsModal';
    modal.className = 'modal hidden';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Instrucciones para Compartir</h3>
                <button class="btn-icon" onclick="closeShareInstructions()">×</button>
            </div>
            <div class="share-instructions-content">
                <!-- Dynamic content will be inserted here -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

/**
 * Copy share content to clipboard
 * @param {string} platform - Platform name
 */
export async function copyShareContent(platform) {
    try {
        const shareData = window.currentShareData || {};
        const textToCopy = `${shareData.text}\n\n${shareData.hashtags ? shareData.hashtags.join(' ') : ''}\n\n${shareData.url || ''}`;
        
        await navigator.clipboard.writeText(textToCopy);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Contenido copiado al portapapeles', 'success');
        }
    } catch (error) {
        console.error('Error copying share content:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al copiar contenido', 'error');
        }
    }
}

/**
 * Download image optimized for sharing platform
 * @param {string} platform - Platform name
 */
export async function downloadShareImage(platform) {
    try {
        const shareData = window.currentShareData || {};
        
        if (shareData.imageBlob) {
            const filename = `RDV_${platform}_${formatDate(new Date(), 'YYYYMMDD_HHmmss')}.png`;
            
            // Create download link
            const url = URL.createObjectURL(shareData.imageBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (typeof window.showToast === 'function') {
                window.showToast('Imagen descargada para compartir', 'success');
            }
        }
    } catch (error) {
        console.error('Error downloading share image:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al descargar imagen', 'error');
        }
    }
}

/**
 * Schedule post for later publishing
 * @param {Object} scheduleData - Schedule configuration
 * @returns {Promise<boolean>} Schedule success status
 */
export async function schedulePost(scheduleData) {
    try {
        // Show scheduling modal
        updateSharingProgress(0, 'Programando publicación...');
        
        // Generate image for scheduled post
        const imageBlob = await generateImage({ autoDownload: false });
        
        // Prepare scheduled post data
        const postData = {
            ...scheduleData,
            imageBlob: imageBlob,
            content: collectCurrentFormData(),
            createdAt: new Date().toISOString()
        };
        
        // Save to RDV News API or local storage
        const success = await saveScheduledPost(postData);
        
        if (success) {
            if (typeof window.showToast === 'function') {
                window.showToast('Publicación programada exitosamente', 'success');
            }
        }
        
        return success;
    } catch (error) {
        console.error('Error scheduling post:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al programar publicación', 'error');
        }
        
        return false;
    }
}

/**
 * Save scheduled post
 * @param {Object} postData - Post data to schedule
 * @returns {Promise<boolean>} Save success status
 */
async function saveScheduledPost(postData) {
    try {
        // Try to save to RDV News API first
        const response = await fetch(`${rdvApiConfig.baseUrl}${rdvApiConfig.endpoints.schedule}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            console.log('✅ Post scheduled via RDV News API');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ RDV News API not available, saving locally');
    }
    
    // Fallback to local storage
    try {
        const scheduledPosts = getScheduledPosts();
        const postId = generatePostId();
        
        scheduledPosts[postId] = {
            id: postId,
            ...postData
        };
        
        localStorage.setItem('rdv_scheduled_posts', JSON.stringify(scheduledPosts));
        console.log('✅ Post scheduled locally');
        return true;
    } catch (error) {
        console.error('❌ Failed to save scheduled post:', error);
        return false;
    }
}

/**
 * Get scheduled posts from storage
 * @returns {Object} Scheduled posts object
 */
function getScheduledPosts() {
    try {
        const saved = localStorage.getItem('rdv_scheduled_posts');
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.warn('⚠️ Failed to load scheduled posts:', error);
        return {};
    }
}

/**
 * Generate unique post ID
 * @returns {string} Unique post ID
 */
function generatePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get optimal image format for platform
 * @param {string} platform - Target platform
 * @returns {string} Optimal format
 */
function getOptimalFormat(platform) {
    // Most platforms prefer PNG for quality, JPG for smaller size
    switch (platform) {
        case 'instagram':
        case 'facebook':
            return 'jpg'; // Better compression for social media
        case 'twitter':
            return 'png'; // Better quality for Twitter cards
        default:
            return 'png';
    }
}

/**
 * Collect current form data
 * @returns {Object} Current form data
 */
function collectCurrentFormData() {
    return {
        title: document.getElementById('title')?.value || '',
        excerpt: document.getElementById('excerpt')?.value || '',
        source: document.getElementById('source')?.value || 'RDV Noticias',
        author: document.getElementById('author')?.value || 'Redacción RDV',
        category: document.getElementById('category')?.value || 'general',
        tags: document.getElementById('tags')?.value || '',
        backgroundImage: document.getElementById('backgroundImage')?.value || '',
        date: new Date()
    };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || !maxLength) return text;
    
    if (text.length <= maxLength) return text;
    
    // Truncate at word boundary
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? 
        truncated.substring(0, lastSpace) + '...' : 
        truncated + '...';
}

/**
 * Show sharing progress modal
 * @param {string} platform - Target platform
 */
function showSharingModal(platform) {
    const modal = document.getElementById('sharingModal') || createSharingModal();
    const config = platformShareConfigs[platform];
    
    modal.querySelector('.sharing-platform').textContent = config.name;
    modal.querySelector('.sharing-icon').textContent = config.icon;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide sharing progress modal
 */
function hideSharingModal() {
    const modal = document.getElementById('sharingModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Update sharing progress
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 */
function updateSharingProgress(progress, message) {
    const progressFill = document.getElementById('sharingProgressFill');
    const progressText = document.getElementById('sharingProgressText');
    
    if (progressFill) {
        progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    if (progressText) {
        progressText.textContent = message;
    }
}

/**
 * Create sharing progress modal
 * @returns {HTMLElement} Modal element
 */
function createSharingModal() {
    const modal = document.createElement('div');
    modal.id = 'sharingModal';
    modal.className = 'modal hidden';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="sharing-progress">
                <div class="sharing-icon">🚀</div>
                <h3>Compartiendo en <span class="sharing-platform">Red Social</span></h3>
                <div class="progress-bar">
                    <div class="progress-fill" id="sharingProgressFill"></div>
                </div>
                <p class="progress-text" id="sharingProgressText">Iniciando...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

/**
 * Initialize Web Share API support detection
 */
function initializeWebShareAPI() {
    if (navigator.share) {
        console.log('✅ Web Share API supported');
        
        // Add Web Share API capability indicators to UI
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.classList.add('web-share-supported');
        });
    } else {
        console.log('ℹ️ Web Share API not supported, using fallback methods');
    }
}

/**
 * Setup social preview event listeners
 */
function setupSocialPreviewEventListeners() {
    // Quick share buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.quick-share-btn') || e.target.closest('.quick-share-btn')) {
            const btn = e.target.closest('.quick-share-btn');
            const platform = btn.dataset.platform;
            
            if (platform) {
                shareToSocial(platform);
            }
        }
    });
    
    // Share options form
    const shareForm = document.getElementById('shareOptionsForm');
    if (shareForm) {
        shareForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(shareForm);
            const platform = formData.get('platform');
            const customData = {
                text: formData.get('customText'),
                url: formData.get('customUrl')
            };
            
            shareToSocial(platform, customData);
        });
    }
}

/**
 * Show share options modal
 */
export function showShareOptions() {
    const modal = document.getElementById('shareOptionsModal') || createShareOptionsModal();
    modal.classList.remove('hidden');
}

/**
 * Hide share options modal
 */
export function hideShareOptions() {
    const modal = document.getElementById('shareOptionsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Create share options modal
 * @returns {HTMLElement} Modal element
 */
function createShareOptionsModal() {
    const modal = document.createElement('div');
    modal.id = 'shareOptionsModal';
    modal.className = 'modal hidden';
    
    const platformOptions = Object.entries(platformShareConfigs).map(([key, config]) => `
        <label class="platform-option">
            <input type="radio" name="platform" value="${key}" ${key === 'facebook' ? 'checked' : ''}>
            <span class="platform-info">
                <span class="platform-icon">${config.icon}</span>
                <span class="platform-name">${config.name}</span>
            </span>
        </label>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Opciones de Compartir</h3>
                <button class="btn-icon" onclick="hideShareOptions()">×</button>
            </div>
            <form id="shareOptionsForm" class="share-options-form">
                <div class="form-group">
                    <label>Plataforma:</label>
                    <div class="platform-options">
                        ${platformOptions}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="customText">Texto personalizado (opcional):</label>
                    <textarea id="customText" name="customText" rows="4" 
                        placeholder="Deja vacío para usar el texto generado automáticamente"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="customUrl">URL personalizada (opcional):</label>
                    <input type="url" id="customUrl" name="customUrl" 
                        placeholder="https://radiodelvolga.com/noticia">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        🚀 Compartir Ahora
                    </button>
                    <button type="button" class="btn-secondary" onclick="hideShareOptions()">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

/**
 * Export share settings
 * @returns {Object} Share settings export data
 */
export function exportShareSettings() {
    return {
        shareOptions: shareOptions,
        platformConfigs: platformShareConfigs,
        scheduledPosts: getScheduledPosts(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Import share settings
 * @param {Object} settingsData - Settings data to import
 * @returns {boolean} Success status
 */
export function importShareSettings(settingsData) {
    try {
        if (!settingsData || typeof settingsData !== 'object') {
            throw new Error('Invalid settings data');
        }
        
        if (settingsData.shareOptions) {
            shareOptions = { ...shareOptions, ...settingsData.shareOptions };
            saveShareOptions();
        }
        
        if (settingsData.scheduledPosts) {
            localStorage.setItem('rdv_scheduled_posts', JSON.stringify(settingsData.scheduledPosts));
        }
        
        console.log('✅ Share settings imported successfully');
        
        if (typeof window.showToast === 'function') {
            window.showToast('Configuración de compartir importada exitosamente', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to import share settings:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al importar configuración de compartir', 'error');
        }
        
        return false;
    }
}

/**
 * Get platform share configurations
 * @returns {Object} Platform configurations
 */
export function getPlatformShareConfigs() {
    return { ...platformShareConfigs };
}

/**
 * Update share options
 * @param {Object} newOptions - New share options
 */
export function updateShareOptions(newOptions) {
    shareOptions = { ...shareOptions, ...newOptions };
    saveShareOptions();
    
    console.log('🔧 Share options updated');
}

// Close functions for modals (make globally available)
window.closeShareInstructions = function() {
    const modal = document.getElementById('shareInstructionsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Make functions globally available for HTML onclick handlers
window.shareToSocial = shareToSocial;
window.showShareOptions = showShareOptions;
window.hideShareOptions = hideShareOptions;
window.copyShareContent = copyShareContent;
window.downloadShareImage = downloadShareImage;
window.schedulePost = schedulePost;
window.exportShareSettings = exportShareSettings;
window.importShareSettings = importShareSettings;