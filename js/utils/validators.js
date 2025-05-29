/**
 * RDV Image Generator - Validation Utilities Module (Functional Approach with ES6 Modules)
 * Provides validation functions for various data types and formats
 * @version 1.0.0
 */

/**
 * Validate hex color format
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export function validateColorHex(color) {
    if (!color || typeof color !== 'string') return false;
    
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Check if it's 3 or 6 character hex
    return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Validate theme name format
 * @param {string} themeName - Theme name to validate
 * @returns {boolean} True if valid theme name
 */
export function validateThemeName(themeName) {
    if (!themeName || typeof themeName !== 'string') return false;
    
    // Theme name should be alphanumeric with hyphens/underscores, 3-50 chars
    return /^[a-zA-Z0-9_-]{3,50}$/.test(themeName);
}

/**
 * Validate platform name
 * @param {string} platform - Platform name to validate
 * @returns {boolean} True if valid platform
 */
export function validatePlatform(platform) {
    if (!platform || typeof platform !== 'string') return false;
    
    const validPlatforms = [
        'instagram',
        'facebook', 
        'twitter',
        'linkedin',
        'whatsapp',
        'telegram',
        'universal'
    ];
    
    return validPlatforms.includes(platform.toLowerCase());
}

/**
 * Validate template name format
 * @param {string} templateName - Template name to validate
 * @returns {boolean} True if valid template name
 */
export function validateTemplateName(templateName) {
    if (!templateName || typeof templateName !== 'string') return false;
    
    // Template name should be alphanumeric with hyphens, 2-50 chars
    return /^[a-zA-Z0-9-]{2,50}$/.test(templateName);
}

/**
 * Validate template data object
 * @param {Object} data - Template data to validate
 * @returns {boolean} True if valid template data
 */
export function validateTemplateData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields exist (can be empty but must be present)
    const requiredFields = ['title', 'excerpt', 'author', 'source'];
    
    for (const field of requiredFields) {
        if (!(field in data)) return false;
    }
    
    // Validate field types
    if (data.title && typeof data.title !== 'string') return false;
    if (data.excerpt && typeof data.excerpt !== 'string') return false;
    if (data.author && typeof data.author !== 'string') return false;
    if (data.source && typeof data.source !== 'string') return false;
    if (data.category && typeof data.category !== 'string') return false;
    if (data.tags && typeof data.tags !== 'string') return false;
    if (data.backgroundImage && typeof data.backgroundImage !== 'string') return false;
    
    // Validate date if present
    if (data.date) {
        const date = data.date instanceof Date ? data.date : new Date(data.date);
        if (isNaN(date.getTime())) return false;
    }
    
    return true;
}

/**
 * Validate image options for generation
 * @param {Object} options - Image generation options
 * @returns {boolean} True if valid options
 */
export function validateImageOptions(options) {
    if (!options || typeof options !== 'object') return false;
    
    // Validate quality
    if (options.quality && !['standard', 'high', 'ultra'].includes(options.quality)) {
        return false;
    }
    
    // Validate format
    if (options.format && !['png', 'jpg', 'jpeg', 'webp'].includes(options.format.toLowerCase())) {
        return false;
    }
    
    // Validate scale
    if (options.scale && (typeof options.scale !== 'number' || options.scale < 0.1 || options.scale > 5)) {
        return false;
    }
    
    // Validate background color
    if (options.background && !validateColorHex(options.background)) {
        return false;
    }
    
    return true;
}

/**
 * Validate element for image capture
 * @param {HTMLElement} element - Element to validate
 * @returns {boolean} True if valid capture element
 */
export function validateCaptureElement(element) {
    if (!element || !(element instanceof HTMLElement)) return false;
    
    // Check if element is visible
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden') return false;
    
    // Check if element has dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    return true;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function validateUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Airtable configuration
 * @param {Object} config - Airtable config to validate
 * @returns {boolean} True if valid configuration
 */
export function validateAirtableConfig(config) {
    if (!config || typeof config !== 'object') return false;
    
    // Check required fields
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.length < 10) {
        return false;
    }
    
    if (!config.baseId || typeof config.baseId !== 'string' || !config.baseId.startsWith('app')) {
        return false;
    }
    
    if (!config.tableName || typeof config.tableName !== 'string' || config.tableName.length === 0) {
        return false;
    }
    
    // Validate timeout if present
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 1000 || config.timeout > 120000)) {
        return false;
    }
    
    return true;
}

/**
 * Validate Airtable record ID format
 * @param {string} recordId - Record ID to validate
 * @returns {boolean} True if valid record ID
 */
export function validateRecordId(recordId) {
    if (!recordId || typeof recordId !== 'string') return false;
    
    // Airtable record IDs start with 'rec' followed by 14 alphanumeric characters
    return /^rec[a-zA-Z0-9]{14}$/.test(recordId);
}

/**
 * Validate share data for social media
 * @param {Object} shareData - Share data to validate
 * @returns {boolean} True if valid share data
 */
export function validateShareData(shareData) {
    if (!shareData || typeof shareData !== 'object') return false;
    
    // Check required fields
    if (!shareData.title || typeof shareData.title !== 'string') return false;
    if (!shareData.platform || !validatePlatform(shareData.platform)) return false;
    
    // Validate optional fields if present
    if (shareData.text && typeof shareData.text !== 'string') return false;
    if (shareData.url && !validateUrl(shareData.url)) return false;
    if (shareData.imageUrl && !validateUrl(shareData.imageUrl)) return false;
    if (shareData.hashtags && !Array.isArray(shareData.hashtags)) return false;
    
    return true;
}

/**
 * Validate text length for platform constraints
 * @param {string} text - Text to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {Object} Validation result {isValid, length, exceededBy}
 */
export function validateTextLength(text, maxLength) {
    if (!text || typeof text !== 'string') {
        return { isValid: true, length: 0, exceededBy: 0 };
    }
    
    const length = text.length;
    const isValid = length <= maxLength;
    const exceededBy = Math.max(0, length - maxLength);
    
    return { isValid, length, exceededBy };
}

/**
 * Validate hashtag format
 * @param {string} hashtag - Hashtag to validate
 * @returns {boolean} True if valid hashtag
 */
export function validateHashtag(hashtag) {
    if (!hashtag || typeof hashtag !== 'string') return false;
    
    // Remove # if present for validation
    const tag = hashtag.replace('#', '');
    
    // Hashtag should be 1-100 characters, alphanumeric and underscores
    return /^[a-zA-Z0-9_]{1,100}$/.test(tag);
}

/**
 * Validate file type for upload
 * @param {File|string} file - File object or filename
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {boolean} True if valid file type
 */
export function validateFileType(file, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']) {
    if (!file) return false;
    
    let filename = '';
    if (file instanceof File) {
        filename = file.name;
    } else if (typeof file === 'string') {
        filename = file;
    } else {
        return false;
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && allowedTypes.includes(extension);
}

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSizeBytes - Maximum size in bytes
 * @returns {boolean} True if file size is valid
 */
export function validateFileSize(file, maxSizeBytes = 10 * 1024 * 1024) { // 10MB default
    if (!file || !(file instanceof File)) return false;
    return file.size <= maxSizeBytes;
}

/**
 * Validate JSON string
 * @param {string} jsonString - JSON string to validate
 * @returns {boolean} True if valid JSON
 */
export function validateJSON(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') return false;
    
    try {
        JSON.parse(jsonString);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Basic international phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone.trim());
}

/**
 * Validate date string or object
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if valid date
 */
export function validateDate(date) {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength score
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, strength: 0, issues: ['Password is required'] };
    }
    
    const issues = [];
    let strength = 0;
    
    // Length check
    if (password.length < 8) issues.push('Password must be at least 8 characters');
    else strength += 1;
    
    // Uppercase check
    if (!/[A-Z]/.test(password)) issues.push('Password must contain uppercase letters');
    else strength += 1;
    
    // Lowercase check
    if (!/[a-z]/.test(password)) issues.push('Password must contain lowercase letters');
    else strength += 1;
    
    // Number check
    if (!/\d/.test(password)) issues.push('Password must contain numbers');
    else strength += 1;
    
    // Special character check
    if (!/[^a-zA-Z0-9]/.test(password)) issues.push('Password must contain special characters');
    else strength += 1;
    
    return {
        isValid: issues.length === 0,
        strength: Math.min(strength, 5),
        issues
    };
}

/**
 * Validate Twitter handle format
 * @param {string} handle - Twitter handle to validate
 * @returns {boolean} True if valid Twitter handle
 */
export function validateTwitterHandle(handle) {
    if (!handle || typeof handle !== 'string') return false;
    
    // Remove @ if present
    const username = handle.replace('@', '');
    
    // Twitter username rules: 1-15 characters, alphanumeric and underscores
    return /^[a-zA-Z0-9_]{1,15}$/.test(username);
}

/**
 * Validate Instagram handle format
 * @param {string} handle - Instagram handle to validate
 * @returns {boolean} True if valid Instagram handle
 */
export function validateInstagramHandle(handle) {
    if (!handle || typeof handle !== 'string') return false;
    
    // Remove @ if present
    const username = handle.replace('@', '');
    
    // Instagram username rules: 1-30 characters, alphanumeric, periods, and underscores
    return /^[a-zA-Z0-9._]{1,30}$/.test(username);
}

/**
 * Validate CSS color value
 * @param {string} color - Color value to validate
 * @returns {boolean} True if valid CSS color
 */
export function validateCSSColor(color) {
    if (!color || typeof color !== 'string') return false;
    
    // Create a temporary element to test color validity
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    
    return tempElement.style.color !== '';
}

/**
 * Validate dimensions object
 * @param {Object} dimensions - Dimensions object to validate
 * @returns {boolean} True if valid dimensions
 */
export function validateDimensions(dimensions) {
    if (!dimensions || typeof dimensions !== 'object') return false;
    
    const { width, height } = dimensions;
    
    return (
        typeof width === 'number' && 
        typeof height === 'number' && 
        width > 0 && 
        height > 0 &&
        width <= 8000 && // Reasonable max dimensions
        height <= 8000
    );
}

/**
 * Validate HTML string (basic XSS protection)
 * @param {string} html - HTML string to validate
 * @returns {boolean} True if HTML appears safe
 */
export function validateHTML(html) {
    if (!html || typeof html !== 'string') return false;
    
    // Check for potentially dangerous tags/attributes
    const dangerousPatterns = [
        /<script/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i,
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /onload=/i,
        /onclick=/i,
        /onerror=/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(html));
}

/**
 * Validate form data object
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export function validateFormData(formData, rules) {
    if (!formData || typeof formData !== 'object') {
        return { isValid: false, errors: { form: 'Invalid form data' } };
    }
    
    if (!rules || typeof rules !== 'object') {
        return { isValid: false, errors: { form: 'Invalid validation rules' } };
    }
    
    const errors = {};
    
    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = formData[field];
        const fieldErrors = [];
        
        // Required validation
        if (fieldRules.required && (!value || value.toString().trim() === '')) {
            fieldErrors.push(`${field} is required`);
        }
        
        // Type validation
        if (value && fieldRules.type) {
            const expectedType = fieldRules.type;
            const actualType = typeof value;
            
            if (expectedType === 'email' && !validateEmail(value)) {
                fieldErrors.push(`${field} must be a valid email`);
            } else if (expectedType === 'url' && !validateUrl(value)) {
                fieldErrors.push(`${field} must be a valid URL`);
            } else if (expectedType === 'number' && actualType !== 'number') {
                fieldErrors.push(`${field} must be a number`);
            } else if (expectedType === 'string' && actualType !== 'string') {
                fieldErrors.push(`${field} must be a string`);
            }
        }
        
        // Length validation
        if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
            fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`);
        }
        
        if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
            fieldErrors.push(`${field} must be no more than ${fieldRules.maxLength} characters`);
        }
        
        // Custom validation
        if (value && fieldRules.validate && typeof fieldRules.validate === 'function') {
            const customResult = fieldRules.validate(value);
            if (customResult !== true) {
                fieldErrors.push(customResult || `${field} is invalid`);
            }
        }
        
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Sanitize and validate user input
 * @param {string} input - User input to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateUserInput(input, options = {}) {
    const {
        maxLength = 1000,
        minLength = 0,
        allowHTML = false,
        allowSpecialChars = true,
        trim = true
    } = options;
    
    if (typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a string', sanitized: '' };
    }
    
    let sanitized = trim ? input.trim() : input;
    
    // Length validation
    if (sanitized.length < minLength) {
        return { isValid: false, error: `Input too short (minimum ${minLength} characters)`, sanitized };
    }
    
    if (sanitized.length > maxLength) {
        return { isValid: false, error: `Input too long (maximum ${maxLength} characters)`, sanitized };
    }
    
    // HTML validation
    if (!allowHTML && /<[^>]*>/.test(sanitized)) {
        return { isValid: false, error: 'HTML tags not allowed', sanitized };
    }
    
    if (allowHTML && !validateHTML(sanitized)) {
        return { isValid: false, error: 'Potentially unsafe HTML detected', sanitized };
    }
    
    // Special characters validation
    if (!allowSpecialChars && /[<>'"&]/.test(sanitized)) {
        return { isValid: false, error: 'Special characters not allowed', sanitized };
    }
    
    return { isValid: true, sanitized };
}

// Make functions globally available for backwards compatibility
if (typeof window !== 'undefined') {
    window.RDVValidators = {
        validateColorHex,
        validateThemeName,
        validatePlatform,
        validateTemplateName,
        validateTemplateData,
        validateImageOptions,
        validateCaptureElement,
        validateUrl,
        validateEmail,
        validateAirtableConfig,
        validateRecordId,
        validateShareData,
        validateTextLength,
        validateHashtag,
        validateFileType,
        validateFileSize,
        validateJSON,
        validatePhone,
        validateDate,
        validatePassword,
        validateTwitterHandle,
        validateInstagramHandle,
        validateCSSColor,
        validateDimensions,
        validateHTML,
        validateFormData,
        validateUserInput
    };
}