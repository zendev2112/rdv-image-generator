/**
 * RDV Image Generator - Image Capture Module (Functional Approach with ES6 Modules)
 * Handles image generation, capture, and export functionality
 * @version 1.0.0
 */

// ES6 Imports
import { formatDate, generateFileName, downloadBlob, dataURLtoBlob } from '../utils/helpers.js';
import { validateImageOptions, validateCaptureElement } from '../utils/validators.js';
import { getPlatformConfig, getCurrentTemplateData } from './template-engine.js';

// Image Capture State
let captureOptions = {
    quality: 'high',
    format: 'png',
    scale: 1,
    background: '#ffffff',
    allowTaint: true,
    useCORS: true,
    logging: false
};

// Quality presets
const qualityPresets = {
    standard: {
        scale: 1,
        quality: 0.8,
        backgroundColor: '#ffffff'
    },
    high: {
        scale: 2,
        quality: 0.95,
        backgroundColor: '#ffffff'
    },
    ultra: {
        scale: 3,
        quality: 1.0,
        backgroundColor: '#ffffff'
    }
};

// Format configurations
const formatConfig = {
    png: {
        type: 'image/png',
        quality: 1.0,
        extension: 'png'
    },
    jpg: {
        type: 'image/jpeg',
        quality: 0.9,
        extension: 'jpg'
    },
    webp: {
        type: 'image/webp',
        quality: 0.9,
        extension: 'webp'
    }
};

/**
 * Initialize the image capture module
 */
export async function initializeImageCapture() {
    console.log('🚀 Initializing Image Capture...');
    
    try {
        // Check for required libraries
        await checkDependencies();
        
        // Setup image capture event listeners
        setupImageCaptureEventListeners();
        
        // Load capture options from storage
        loadCaptureOptions();
        
        console.log('✅ Image Capture initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Image Capture:', error);
        throw error;
    }
}

/**
 * Check if required dependencies are available
 */
async function checkDependencies() {
    const dependencies = [
        { name: 'html2canvas', check: () => typeof window.html2canvas !== 'undefined' },
        { name: 'domtoimage', check: () => typeof window.domtoimage !== 'undefined' }
    ];

    const missing = dependencies.filter(dep => !dep.check());
    
    if (missing.length > 0) {
        const missingNames = missing.map(dep => dep.name).join(', ');
        throw new Error(`Missing dependencies: ${missingNames}`);
    }
    
    console.log('✅ All image capture dependencies available');
}

/**
 * Generate image from current template
 * @param {Object} options - Generation options
 * @returns {Promise<Blob>} Generated image blob
 */
export async function generateImage(options = {}) {
    try {
        // Show generation modal
        showGenerationModal();
        
        // Update progress
        updateGenerationProgress(10, 'Preparando captura...');
        
        // Get canvas element
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Validate canvas content
        if (!validateCaptureElement(canvas)) {
            throw new Error('Invalid canvas content for capture');
        }
        
        // Get current template data for filename
        const templateData = getCurrentTemplateData();
        const platform = window.RDVImageGenerator?.currentPlatform || 'unknown';
        const template = window.RDVImageGenerator?.currentTemplate || 'unknown';
        
        // Merge options with defaults
        const captureOpts = mergeOptions(options);
        
        // Update progress
        updateGenerationProgress(30, 'Configurando captura...');
        
        // Prepare element for capture
        await prepareElementForCapture(canvas, captureOpts);
        
        // Update progress
        updateGenerationProgress(50, 'Capturando imagen...');
        
        // Capture image using preferred method
        const imageBlob = await captureElementToBlob(canvas, captureOpts);
        
        // Update progress
        updateGenerationProgress(80, 'Procesando imagen...');
        
        // Post-process image if needed
        const processedBlob = await postProcessImage(imageBlob, captureOpts);
        
        // Update progress
        updateGenerationProgress(100, 'Imagen generada exitosamente');
        
        // Hide modal after delay
        setTimeout(hideGenerationModal, 1000);
        
        // Auto-download if requested
        if (captureOpts.autoDownload !== false) {
            const filename = generateImageFilename(platform, template, templateData);
            downloadBlob(processedBlob, filename);
        }
        
        console.log('✅ Image generated successfully');
        
        // Show success notification
        if (typeof window.showToast === 'function') {
            window.showToast('Imagen generada exitosamente', 'success');
        }
        
        return processedBlob;
        
    } catch (error) {
        console.error('❌ Error generating image:', error);
        
        // Hide modal and show error
        hideGenerationModal();
        
        if (typeof window.showToast === 'function') {
            window.showToast(`Error al generar imagen: ${error.message}`, 'error');
        }
        
        throw error;
    }
}

/**
 * Capture element to blob using html2canvas
 * @param {HTMLElement} element - Element to capture
 * @param {Object} options - Capture options
 * @returns {Promise<Blob>} Image blob
 */
async function captureElementToBlob(element, options) {
    try {
        // Get platform config for exact dimensions
        const platform = window.RDVImageGenerator?.currentPlatform || 'instagram';
        const template = window.RDVImageGenerator?.currentTemplate || 'story';
        const config = getPlatformConfig(platform, template);
        
        // Prepare html2canvas options
        const html2canvasOptions = {
            allowTaint: options.allowTaint,
            useCORS: options.useCORS,
            scale: options.scale,
            backgroundColor: options.background,
            width: config.width,
            height: config.height,
            logging: options.logging,
            removeContainer: true,
            imageTimeout: 15000,
            onclone: (clonedDoc, element) => {
                // Ensure fonts are loaded in cloned document
                const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
                fontLinks.forEach(link => {
                    if (!clonedDoc.querySelector(`link[href="${link.href}"]`)) {
                        clonedDoc.head.appendChild(link.cloneNode(true));
                    }
                });
                
                // Apply inline styles for better capture
                const clonedElement = clonedDoc.querySelector('#canvas');
                if (clonedElement) {
                    clonedElement.style.width = `${config.width}px`;
                    clonedElement.style.height = `${config.height}px`;
                    clonedElement.style.overflow = 'hidden';
                }
            }
        };
        
        // Capture using html2canvas
        const canvas = await window.html2canvas(element, html2canvasOptions);
        
        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            const format = formatConfig[options.format] || formatConfig.png;
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert canvas to blob'));
                    }
                },
                format.type,
                format.quality
            );
        });
        
    } catch (error) {
        console.error('❌ html2canvas capture failed, trying fallback:', error);
        
        // Fallback to dom-to-image
        return await captureWithDomToImage(element, options);
    }
}

/**
 * Fallback capture method using dom-to-image
 * @param {HTMLElement} element - Element to capture
 * @param {Object} options - Capture options
 * @returns {Promise<Blob>} Image blob
 */
async function captureWithDomToImage(element, options) {
    try {
        const platform = window.RDVImageGenerator?.currentPlatform || 'instagram';
        const template = window.RDVImageGenerator?.currentTemplate || 'story';
        const config = getPlatformConfig(platform, template);
        
        const domToImageOptions = {
            width: config.width * options.scale,
            height: config.height * options.scale,
            style: {
                transform: `scale(${options.scale})`,
                transformOrigin: 'top left',
                width: `${config.width}px`,
                height: `${config.height}px`
            },
            bgcolor: options.background,
            quality: formatConfig[options.format]?.quality || 0.9
        };
        
        // Use appropriate dom-to-image method based on format
        let dataUrl;
        if (options.format === 'png') {
            dataUrl = await window.domtoimage.toPng(element, domToImageOptions);
        } else if (options.format === 'jpg') {
            dataUrl = await window.domtoimage.toJpeg(element, domToImageOptions);
        } else {
            // Default to PNG for unsupported formats
            dataUrl = await window.domtoimage.toPng(element, domToImageOptions);
        }
        
        return dataURLtoBlob(dataUrl);
        
    } catch (error) {
        console.error('❌ dom-to-image capture failed:', error);
        throw new Error('All capture methods failed');
    }
}

/**
 * Prepare element for capture (ensure fonts loaded, styles applied, etc.)
 * @param {HTMLElement} element - Element to prepare
 * @param {Object} options - Capture options
 */
async function prepareElementForCapture(element, options) {
    // Ensure all images are loaded
    await waitForImages(element);
    
    // Ensure fonts are loaded
    await waitForFonts();
    
    // Apply capture-specific styles
    element.style.transform = 'none';
    element.style.transition = 'none';
    
    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Wait for all images in element to load
 * @param {HTMLElement} element - Element containing images
 */
async function waitForImages(element) {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Image load timeout: ${img.src}`));
            }, 10000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.warn(`Failed to load image: ${img.src}`);
                resolve(); // Don't fail the whole process for one image
            };
        });
    });
    
    try {
        await Promise.all(imagePromises);
        console.log('✅ All images loaded');
    } catch (error) {
        console.warn('⚠️ Some images failed to load:', error);
    }
}

/**
 * Wait for fonts to be loaded
 */
async function waitForFonts() {
    if ('fonts' in document) {
        try {
            await document.fonts.ready;
            console.log('✅ All fonts loaded');
        } catch (error) {
            console.warn('⚠️ Font loading timeout:', error);
        }
    } else {
        // Fallback for browsers without Font Loading API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

/**
 * Post-process captured image
 * @param {Blob} imageBlob - Original image blob
 * @param {Object} options - Processing options
 * @returns {Promise<Blob>} Processed image blob
 */
async function postProcessImage(imageBlob, options) {
    // For now, return the original blob
    // Future enhancements could include:
    // - Image compression
    // - Watermarking
    // - Color adjustments
    // - Filters
    
    return imageBlob;
}

/**
 * Generate filename for captured image
 * @param {string} platform - Platform name
 * @param {string} template - Template name
 * @param {Object} templateData - Template data
 * @returns {string} Generated filename
 */
function generateImageFilename(platform, template, templateData) {
    const timestamp = formatDate(new Date(), 'YYYYMMDD_HHmmss');
    const title = templateData?.data?.title || 'noticia';
    
    // Sanitize title for filename
    const sanitizedTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);
    
    const format = captureOptions.format || 'png';
    
    return `RDV_${platform}_${template}_${sanitizedTitle}_${timestamp}.${format}`;
}

/**
 * Merge capture options with defaults and quality preset
 * @param {Object} options - User provided options
 * @returns {Object} Merged options
 */
function mergeOptions(options = {}) {
    const qualityLevel = options.quality || 
                        document.getElementById('imageQuality')?.value || 
                        'high';
    
    const preset = qualityPresets[qualityLevel] || qualityPresets.high;
    
    return {
        ...captureOptions,
        ...preset,
        ...options,
        format: options.format || 'png'
    };
}

/**
 * Download captured image
 * @param {Blob} imageBlob - Image blob to download
 * @param {string} filename - Filename for download
 */
export function downloadImage(imageBlob, filename) {
    if (!imageBlob) {
        console.error('❌ No image blob provided for download');
        return;
    }
    
    try {
        downloadBlob(imageBlob, filename || 'rdv_image.png');
        
        if (typeof window.showToast === 'function') {
            window.showToast('Imagen descargada exitosamente', 'success');
        }
    } catch (error) {
        console.error('❌ Error downloading image:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al descargar imagen', 'error');
        }
    }
}

/**
 * Copy image to clipboard
 * @param {Blob} imageBlob - Image blob to copy
 */
export async function copyImageToClipboard(imageBlob) {
    if (!imageBlob) {
        // Generate image if not provided
        try {
            imageBlob = await generateImage({ autoDownload: false });
        } catch (error) {
            console.error('❌ Failed to generate image for clipboard:', error);
            return;
        }
    }
    
    try {
        if (navigator.clipboard && navigator.clipboard.write) {
            const clipboardItem = new ClipboardItem({
                [imageBlob.type]: imageBlob
            });
            
            await navigator.clipboard.write([clipboardItem]);
            
            if (typeof window.showToast === 'function') {
                window.showToast('Imagen copiada al portapapeles', 'success');
            }
        } else {
            throw new Error('Clipboard API not supported');
        }
    } catch (error) {
        console.error('❌ Error copying to clipboard:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('No se pudo copiar al portapapeles', 'warning');
        }
    }
}

/**
 * Generate images for all platforms
 * @param {Object} baseOptions - Base options for all generations
 * @returns {Promise<Array>} Array of generated image blobs
 */
export async function generateAllPlatforms(baseOptions = {}) {
    const platforms = ['instagram', 'facebook', 'twitter', 'universal'];
    const results = [];
    
    try {
        showGenerationModal();
        updateGenerationProgress(0, 'Generando para todas las plataformas...');
        
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            
            // Update current platform
            window.RDVImageGenerator.currentPlatform = platform;
            
            // Get available templates for platform
            const templates = Object.keys(getPlatformConfig(platform));
            
            for (let j = 0; j < templates.length; j++) {
                const template = templates[j];
                
                // Update current template
                window.RDVImageGenerator.currentTemplate = template;
                
                // Update preview
                if (typeof window.updatePreview === 'function') {
                    await window.updatePreview();
                }
                
                // Wait for preview to render
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Generate image
                const imageBlob = await generateImage({
                    ...baseOptions,
                    autoDownload: true
                });
                
                results.push({
                    platform,
                    template,
                    blob: imageBlob
                });
                
                // Update progress
                const progress = ((i * templates.length + j + 1) / (platforms.length * templates.length)) * 100;
                updateGenerationProgress(progress, `Generando ${platform} ${template}...`);
            }
        }
        
        hideGenerationModal();
        
        if (typeof window.showToast === 'function') {
            window.showToast(`${results.length} imágenes generadas exitosamente`, 'success');
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Error generating all platforms:', error);
        hideGenerationModal();
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error generando imágenes para todas las plataformas', 'error');
        }
        
        throw error;
    }
}

/**
 * Show generation progress modal
 */
function showGenerationModal() {
    const modal = document.getElementById('generationModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide generation progress modal
 */
function hideGenerationModal() {
    const modal = document.getElementById('generationModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Update generation progress
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 */
function updateGenerationProgress(progress, message) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    if (progressText) {
        progressText.textContent = message;
    }
}

/**
 * Cancel ongoing generation
 */
export function cancelGeneration() {
    hideGenerationModal();
    
    if (typeof window.showToast === 'function') {
        window.showToast('Generación cancelada', 'info');
    }
}

/**
 * Setup image capture event listeners
 */
function setupImageCaptureEventListeners() {
    // Quality selector changes
    const qualitySelect = document.getElementById('imageQuality');
    if (qualitySelect) {
        qualitySelect.addEventListener('change', (e) => {
            const quality = e.target.value;
            updateCaptureOptions({ quality });
            saveCaptureOptions();
        });
    }
}

/**
 * Update capture options
 * @param {Object} newOptions - New options to merge
 */
export function updateCaptureOptions(newOptions) {
    captureOptions = { ...captureOptions, ...newOptions };
    console.log('📋 Capture options updated:', captureOptions);
}

/**
 * Load capture options from localStorage
 */
function loadCaptureOptions() {
    try {
        const saved = localStorage.getItem('rdv_capture_options');
        if (saved) {
            const parsedOptions = JSON.parse(saved);
            captureOptions = { ...captureOptions, ...parsedOptions };
            console.log('📋 Capture options loaded from storage');
        }
    } catch (error) {
        console.warn('⚠️ Failed to load capture options from storage:', error);
    }
}

/**
 * Save capture options to localStorage
 */
function saveCaptureOptions() {
    try {
        localStorage.setItem('rdv_capture_options', JSON.stringify(captureOptions));
        console.log('💾 Capture options saved to storage');
    } catch (error) {
        console.warn('⚠️ Failed to save capture options to storage:', error);
    }
}

/**
 * Get current capture options
 * @returns {Object} Current capture options
 */
export function getCaptureOptions() {
    return { ...captureOptions };
}

/**
 * Print generated image
 * @param {Blob} imageBlob - Image blob to print
 */
export async function printImage(imageBlob) {
    if (!imageBlob) {
        try {
            imageBlob = await generateImage({ autoDownload: false });
        } catch (error) {
            console.error('❌ Failed to generate image for printing:', error);
            return;
        }
    }
    
    try {
        const imageUrl = URL.createObjectURL(imageBlob);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>RDV Image Print</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }
                        @media print {
                            body { margin: 0; }
                            img { width: 100%; height: auto; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${imageUrl}" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Clean up URL after print
        setTimeout(() => {
            URL.revokeObjectURL(imageUrl);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error printing image:', error);
        
        if (typeof window.showToast === 'function') {
            window.showToast('Error al imprimir imagen', 'error');
        }
    }
}

/**
 * Get image dimensions for current template
 * @returns {Object} Width and height
 */
export function getCurrentImageDimensions() {
    const platform = window.RDVImageGenerator?.currentPlatform || 'instagram';
    const template = window.RDVImageGenerator?.currentTemplate || 'story';
    return getPlatformConfig(platform, template);
}

// Add these functions to the end of your existing image-capture.js
// filepath: /home/zen/Documents/rdv-image-generator/js/core/image-capture.js

/**
 * Generate image for specific social media platform
 * @param {Object} content - Content data for the image
 * @param {string} platform - Target platform (instagram, facebook, twitter)
 * @param {Object} options - Generation options
 * @returns {Promise<Blob>} Generated image blob
 */
export async function generateImageForPlatform(content, platform, options = {}) {
    try {
        console.log(`🎨 Generating image for ${platform}...`);
        
        // Save current state
        const originalPlatform = window.RDVImageGenerator?.currentPlatform;
        const originalTemplate = window.RDVImageGenerator?.currentTemplate;
        
        // Set platform and template
        if (window.RDVImageGenerator) {
            window.RDVImageGenerator.currentPlatform = platform;
            window.RDVImageGenerator.currentTemplate = getDefaultTemplateForPlatform(platform);
        }
        
        // Update template with content
        await updateTemplateWithContent(content);
        
        // Generate image using existing function
        const imageBlob = await generateImage({
            ...options,
            autoDownload: false // Don't auto-download for social publishing
        });
        
        // Restore original state
        if (window.RDVImageGenerator) {
            window.RDVImageGenerator.currentPlatform = originalPlatform;
            window.RDVImageGenerator.currentTemplate = originalTemplate;
        }
        
        return imageBlob;
        
    } catch (error) {
        console.error(`❌ Failed to generate image for ${platform}:`, error);
        throw error;
    }
}

/**
 * Update template with content data
 * @param {Object} content - Content to apply to template
 */
async function updateTemplateWithContent(content) {
    // Update form fields with content
    const fieldMappings = {
        title: content.title,
        excerpt: content.excerpt,
        tags: content.tags,
        category: content.category,
        source: content.source,
        author: content.author,
        backgroundImage: content.backgroundImage
    };
    
    Object.entries(fieldMappings).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element && value) {
            element.value = value;
            // Trigger input event to update preview
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    
    // Wait for template to update
    if (typeof window.updatePreview === 'function') {
        await window.updatePreview();
    }
    
    // Additional wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Get default template for platform
 * @param {string} platform - Platform name
 * @returns {string} Default template name
 */
function getDefaultTemplateForPlatform(platform) {
    const defaults = {
        instagram: 'story',
        facebook: 'post',
        twitter: 'post'
    };
    return defaults[platform] || 'story';
}

// Make new functions globally available
window.generateImageForPlatform = generateImageForPlatform;
window.updateTemplateWithContent = updateTemplateWithContent;
window.getDefaultTemplateForPlatform = getDefaultTemplateForPlatform;

console.log('✅ Social publishing extensions loaded for image-capture.js');

// Make functions available globally for HTML onclick handlers
window.generateImage = generateImage;
window.downloadImage = downloadImage;
window.copyImageToClipboard = copyImageToClipboard;
window.generateAll = generateAllPlatforms;
window.cancelGeneration = cancelGeneration;
window.printImage = printImage;