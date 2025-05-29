/**
 * RDV Image Generator - Helper Utilities Module (Functional Approach with ES6 Modules)
 * Provides common utility functions used throughout the application
 * @version 1.0.0
 */

/**
 * Sanitize text for safe HTML output
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Sanitize URL for safe usage
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    // Remove potentially dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase().trim();
    
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            return '';
        }
    }
    
    // Ensure URL starts with http or https for external URLs
    if (url.includes('://') && !url.startsWith('http://') && !url.startsWith('https://')) {
        return '';
    }
    
    return url.trim();
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (!text || typeof text !== 'string') return '';
    if (!maxLength || maxLength <= 0) return text;
    
    if (text.length <= maxLength) return text;
    
    // Try to break at word boundary
    const truncated = text.substring(0, maxLength - suffix.length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0 && lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + suffix;
    }
    
    return truncated + suffix;
}

/**
 * Format date with various patterns
 * @param {Date|string} date - Date to format
 * @param {string} format - Format pattern (DD/MM/YYYY, YYYY-MM-DD, etc.)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthNamesShort = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    return format
        .replace('YYYY', year)
        .replace('YY', String(year).slice(-2))
        .replace('MMMM', monthNames[dateObj.getMonth()])
        .replace('MMM', monthNamesShort[dateObj.getMonth()])
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('YYYYMMDD_HHmmss', `${year}${month}${day}_${hours}${minutes}${seconds}`);
}

/**
 * Generate filename for downloads
 * @param {string} prefix - Filename prefix
 * @param {string} platform - Platform name
 * @param {string} template - Template name
 * @param {string} extension - File extension
 * @returns {string} Generated filename
 */
export function generateFileName(prefix = 'RDV', platform = 'universal', template = 'image', extension = 'png') {
    const timestamp = formatDate(new Date(), 'YYYYMMDD_HHmmss');
    const cleanPlatform = platform.replace(/[^\w]/g, '');
    const cleanTemplate = template.replace(/[^\w]/g, '');
    
    return `${prefix}_${cleanPlatform}_${cleanTemplate}_${timestamp}.${extension}`;
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string
 * @returns {Object} RGB object {r, g, b}
 */
export function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-character hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    if (hex.length !== 6) return { r: 0, g: 0, b: 0 };
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust brightness of a color
 * @param {string} color - Hex color string
 * @param {number} amount - Amount to adjust (-100 to 100)
 * @returns {string} Adjusted hex color
 */
export function adjustBrightness(color, amount) {
    const { r, g, b } = hexToRgb(color);
    const adjust = (value) => Math.max(0, Math.min(255, value + (amount * 2.55)));
    
    return rgbToHex(adjust(r), adjust(g), adjust(b));
}

/**
 * Get contrast color (black or white) for given background
 * @param {string} backgroundColor - Background color hex
 * @returns {string} Contrasting color (black or white)
 */
export function getContrastColor(backgroundColor) {
    const { r, g, b } = hexToRgb(backgroundColor);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Generate CSS gradient string
 * @param {string} color1 - Start color
 * @param {string} color2 - End color
 * @param {string} color3 - Optional third color
 * @param {string} direction - Gradient direction (default: '135deg')
 * @returns {string} CSS gradient string
 */
export function generateGradient(color1, color2, color3 = null, direction = '135deg') {
    if (color3) {
        return `linear-gradient(${direction}, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
    }
    return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
}

/**
 * Generate share URL for social platforms
 * @param {string} platform - Platform name
 * @param {Object} data - Share data
 * @returns {string} Share URL
 */
export function generateShareUrl(platform, data) {
    const { title, text, url, hashtags } = data;
    
    const encodedTitle = encodeURIComponent(title || '');
    const encodedText = encodeURIComponent(text || '');
    const encodedUrl = encodeURIComponent(url || '');
    const hashtagString = hashtags ? hashtags.join(' ') : '';
    
    switch (platform.toLowerCase()) {
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        
        case 'twitter':
            const twitterText = `${text} ${hashtagString}`.trim();
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}`;
        
        case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
        
        case 'whatsapp':
            const whatsappText = `${text}\n${url}`;
            return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        
        case 'telegram':
            return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        
        default:
            return '';
    }
}

/**
 * Encode string for URL usage
 * @param {string} str - String to encode
 * @returns {string} URL-encoded string
 */
export function encodeForUrl(str) {
    if (!str || typeof str !== 'string') return '';
    return encodeURIComponent(str);
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Convert data URL to blob
 * @param {string} dataURL - Data URL string
 * @returns {Blob} Converted blob
 */
export function dataURLtoBlob(dataURL) {
    if (!dataURL || typeof dataURL !== 'string') return null;
    
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    if (!text || typeof text !== 'string') return false;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Generate random ID string
 * @param {number} length - ID length (default: 8)
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} True if object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get file extension from filename or URL
 * @param {string} filename - Filename or URL
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
    if (!filename || typeof filename !== 'string') return '';
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if string is valid URL
 * @param {string} string - String to check
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Convert string to slug format
 * @param {string} text - Text to convert
 * @returns {string} Slug string
 */
export function slugify(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed parameters
 */
export function parseQueryString(queryString) {
    if (!queryString || typeof queryString !== 'string') return {};
    
    const params = {};
    const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    
    query.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key) {
            params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
    });
    
    return params;
}

/**
 * Convert object to query string
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export function objectToQueryString(params) {
    if (!params || typeof params !== 'object') return '';
    
    return Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to kebab-case
 * @param {string} str - CamelCase string
 * @returns {string} kebab-case string
 */
export function camelToKebab(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 * @param {string} str - kebab-case string
 * @returns {string} camelCase string
 */
export function kebabToCamel(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after timeout
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                throw lastError;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            await sleep(delay);
        }
    }
}

/**
 * Load image and return promise
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Promise that resolves with loaded image
 */
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Get image dimensions from URL
 * @param {string} src - Image source URL
 * @returns {Promise<Object>} Promise that resolves with {width, height}
 */
export async function getImageDimensions(src) {
    try {
        const img = await loadImage(src);
        return {
            width: img.naturalWidth,
            height: img.naturalHeight
        };
    } catch (error) {
        console.error('Failed to get image dimensions:', error);
        return { width: 0, height: 0 };
    }
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 * @returns {boolean} True if iOS device
 */
export function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Get browser information
 * @returns {Object} Browser info object
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    
    return {
        isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
        isFirefox: /Firefox/.test(ua),
        isSafari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
        isEdge: /Edge/.test(ua),
        isIE: /Trident/.test(ua),
        isMobile: isMobile(),
        isIOS: isIOS()
    };
}

// Make functions globally available for backwards compatibility
if (typeof window !== 'undefined') {
    window.RDVHelpers = {
        sanitizeText,
        sanitizeUrl,
        truncateText,
        formatDate,
        generateFileName,
        hexToRgb,
        rgbToHex,
        adjustBrightness,
        getContrastColor,
        generateGradient,
        generateShareUrl,
        encodeForUrl,
        debounce,
        throttle,
        downloadBlob,
        dataURLtoBlob,
        copyToClipboard,
        generateId,
        deepClone,
        deepMerge,
        getFileExtension,
        isValidUrl,
        slugify,
        parseQueryString,
        objectToQueryString,
        formatFileSize,
        capitalize,
        camelToKebab,
        kebabToCamel,
        sleep,
        retryWithBackoff,
        loadImage,
        getImageDimensions,
        isMobile,
        isIOS,
        getBrowserInfo
    };
}