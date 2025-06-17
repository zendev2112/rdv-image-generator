/**
 * Environment Configuration for RDV Image Generator
 * Predefined Airtable settings for seamless integration
 */

export const ENV_CONFIG = {
    // Airtable Configuration (Predefined)

    
    // App Configuration
    APP: {
        NAME: 'RDV Image Generator',
        VERSION: '1.0.0',
        ENVIRONMENT: 'production', // 'development' | 'production'
        DEBUG: false
    },
    
 
    
    // UI Defaults
    DEFAULTS: {
        THEME: 'brand',
        PLATFORM: 'universal',
        TEMPLATE: 'news-card',
        AUTO_SAVE: true,
        AUTO_PREVIEW: true
    }
};

// Field mapping for your specific Airtable structure
export const AIRTABLE_FIELD_MAP = {
    // Direct field mappings (no alternatives needed)
    id: 'id',
    title: 'title',
    excerpt: 'excerpt',
    overline: 'overline',
    imgUrl: 'imgUrl',
    url: 'url',
    tags: 'tags',
    socialMediaText: 'socialMediaText',
    section: 'section',
    created_at: 'created_at',
    
    // Social media image fields
    social_image_facebook: 'social_image_facebook',
    social_image_twitter: 'social_image_twitter',
    social_image_instagram: 'social_image_instagram',
    social_images: 'social_images',
    
    // Attachment fields
    image: 'image',
    
    // Button fields (for reference)
    publish: 'publish',
    generate_social_media: 'generate social media'
};

// Environment detection
export function getEnvironment() {
    // Check if running locally
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    
    // Check for staging environment
    if (window.location.hostname.includes('staging') || window.location.hostname.includes('test')) {
        return 'staging';
    }
    
    return 'production';
}

// Get configuration based on environment
export function getConfig() {
    const environment = getEnvironment();
    
    // You can have different configs per environment
    const configs = {
        development: {
            ...ENV_CONFIG,
            APP: {
                ...ENV_CONFIG.APP,
                DEBUG: true,
                ENVIRONMENT: 'development'
            }
        },
        staging: {
            ...ENV_CONFIG,
            AIRTABLE: {
                ...ENV_CONFIG.AIRTABLE,
                TABLE_NAME: 'Noticias_Test' // Use test table in staging
            }
        },
        production: ENV_CONFIG
    };
    
    return configs[environment] || ENV_CONFIG;
}