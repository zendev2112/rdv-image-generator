/**
 * Airtable Integration with Predefined Configuration
 * No environment variables needed - direct configuration
 */

// PREDEFINED AIRTABLE CONFIGURATION
const AIRTABLE_CONFIG = {
  API_KEY: 'patlPzRF8YzZNnogn.8b3d2d68528bfa5b0643a212f832966d1a327f6ca85e8c0f373609452318af4c',
  BASE_ID: 'appWtDlgG21KUI3IN',
  TABLE_NAME: 'Test', // This matches your .env
  TIMEOUT: 30000,
}

// Field mapping for your Airtable structure
const FIELD_MAP = {
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
    social_image_facebook: 'social_image_facebook',
    social_image_twitter: 'social_image_twitter',
    social_image_instagram: 'social_image_instagram',
    social_images: 'social_images',
    image: 'image'
};

/**
 * Test Airtable connection
 */
async function testAirtableConnection() {
    try {
        console.log('Testing Airtable connection...');
        console.log('Using API Key:', AIRTABLE_CONFIG.API_KEY.substring(0, 20) + '...');
        console.log('Using Base ID:', AIRTABLE_CONFIG.BASE_ID);
        console.log('Using Table Name:', AIRTABLE_CONFIG.TABLE_NAME);
        
        // First list available tables
        const tables = await listAvailableTables();
        
        if (tables) {
            const tableExists = tables.find(t => t.name === AIRTABLE_CONFIG.TABLE_NAME);
            if (!tableExists) {
                console.error(`Table "${AIRTABLE_CONFIG.TABLE_NAME}" not found. Available tables:`, tables.map(t => t.name));
                showToast(`Table "${AIRTABLE_CONFIG.TABLE_NAME}" not found`, 'error');
                return false;
            }
        }
        
        // Now test access to the specific table
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}?maxRecords=1`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Airtable connection successful');
            console.log('Sample data:', data);
            showToast('✅ Conexión a Airtable exitosa', 'success');
            return true;
        } else {
            const errorData = await response.text();
            console.error('❌ Response error:', errorData);
            showToast(`❌ Error ${response.status}: ${errorData}`, 'error');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Airtable connection failed:', error);
        showToast('❌ Error de conexión a Airtable', 'error');
        return false;
    }
}

/**
 * Load content from Airtable record
 */
async function loadFromAirtable(recordId = null) {
    try {
        // Get record ID from URL params or input field
        const id = recordId || getRecordIdFromUrl() || document.getElementById('recordId')?.value?.trim();
        
        if (!id) {
            console.warn('No record ID provided');
            if (typeof showToast === 'function') {
                showToast('Por favor ingresa un ID de registro válido', 'warning');
            }
            return;
        }
        
        console.log('Loading record:', id);
        
        if (typeof showToast === 'function') {
            showToast('Cargando desde Airtable...', 'info');
        }
        
        // Fetch from Airtable using predefined config
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}/${id}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error ${response.status}: ${errorData}`);
        }
        
        const data = await response.json();
        const fields = data.fields;
        
        console.log('Record data:', data);
        
        // Fill form with data
        fillFormFromAirtable(fields);
        
        // Update preview if function exists
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
        
        if (typeof showToast === 'function') {
            showToast('✅ Datos cargados correctamente', 'success');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error loading from Airtable:', error);
        if (typeof showToast === 'function') {
            showToast(`Error: ${error.message}`, 'error');
        }
    }
}

/**
 * Fill form from Airtable data
 */
function fillFormFromAirtable(fields) {
    console.log('Filling form with fields:', fields);
    
    // Map Airtable fields to form fields
    const formData = {
        title: fields[FIELD_MAP.title] || '',
        excerpt: fields[FIELD_MAP.excerpt] || fields[FIELD_MAP.socialMediaText] || '',
        tags: fields[FIELD_MAP.tags] || '',
        category: fields[FIELD_MAP.section] || 'general',
        backgroundImage: fields[FIELD_MAP.imgUrl] || (fields[FIELD_MAP.image]?.[0]?.url) || '',
        source: 'RDV Noticias',
        author: 'Redacción RDV'
    };
    
    console.log('Mapped form data:', formData);
    
    // Fill form fields
    Object.keys(formData).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && formData[fieldId]) {
            console.log(`Setting ${fieldId} to:`, formData[fieldId]);
            element.value = formData[fieldId];
            
            // Trigger input event for character counters
            element.dispatchEvent(new Event('input'));
        } else if (!element) {
            console.warn(`Form element not found: ${fieldId}`);
        }
    });
}

/**
 * Get record ID from URL parameters
 */
function getRecordIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('recordId') || urlParams.get('id');
    console.log('Record ID from URL:', recordId);
    return recordId;
}

/**
 * Simple placeholder functions for missing dependencies
 */
function showToast(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Add this test function to check what tables are actually available
async function listAvailableTables() {
    try {
        console.log('Checking available tables in base:', AIRTABLE_CONFIG.BASE_ID);
        
        const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_CONFIG.BASE_ID}/tables`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Available tables:', data.tables.map(t => ({ name: t.name, id: t.id })));
            return data.tables;
        } else {
            console.error('Failed to list tables:', response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.error('Error listing tables:', error);
        return null;
    }
}

// Make functions globally available
window.loadFromAirtable = loadFromAirtable;
window.testAirtableConnection = testAirtableConnection;
window.fillFormFromAirtable = fillFormFromAirtable;
window.getRecordIdFromUrl = getRecordIdFromUrl;
window.showToast = showToast;
window.listAvailableTables = listAvailableTables;

console.log('🚀 Airtable Integration loaded with predefined config');

// Auto-test connection when loaded
setTimeout(() => {
    console.log('Auto-testing Airtable connection...');
    testAirtableConnection();
}, 1000);