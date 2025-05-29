/**
 * Airtable Integration with Predefined Configuration
 * No environment variables needed - direct configuration
 */

// PREDEFINED AIRTABLE CONFIGURATION
const AIRTABLE_CONFIG = {
  API_KEY:
    'patlPzRF8YzZNnogn.8b3d2d68528bfa5b0643a212f832966d1a327f6ca85e8c0f373609452318af4c',
  BASE_ID: 'appWtDlgG21KUI3IN',
  TABLE_NAME: 'Redes Sociales', // Corrected table name
  TIMEOUT: 30000,
}

// CORS Proxy for external images
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

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
  image: 'image',
}

/**
 * Test Airtable connection
 */
async function testAirtableConnection() {
  try {
    console.log('Testing Airtable connection...')
    console.log(
      'Using API Key:',
      AIRTABLE_CONFIG.API_KEY.substring(0, 20) + '...'
    )
    console.log('Using Base ID:', AIRTABLE_CONFIG.BASE_ID)
    console.log('Using Table Name:', AIRTABLE_CONFIG.TABLE_NAME)

    // First list available tables
    const tables = await listAvailableTables()

    if (tables) {
      const tableExists = tables.find(
        (t) => t.name === AIRTABLE_CONFIG.TABLE_NAME
      )
      if (!tableExists) {
        console.error(
          `Table "${AIRTABLE_CONFIG.TABLE_NAME}" not found. Available tables:`,
          tables.map((t) => t.name)
        )
        showToast(`Table "${AIRTABLE_CONFIG.TABLE_NAME}" not found`, 'error')
        return false
      }
    }

    // Now test access to the specific table
    const response = await fetch(
      `https://api.airtable.com/v0/${
        AIRTABLE_CONFIG.BASE_ID
      }/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}?maxRecords=1`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Airtable connection successful')
      console.log('Sample data:', data)
      showToast('✅ Conexión a Airtable exitosa', 'success')
      return true
    } else {
      const errorData = await response.text()
      console.error('❌ Response error:', errorData)
      showToast(`❌ Error ${response.status}: ${errorData}`, 'error')
      return false
    }
  } catch (error) {
    console.error('❌ Airtable connection failed:', error)
    showToast('❌ Error de conexión a Airtable', 'error')
    return false
  }
}

/**
 * Load content from Airtable record
 */
async function loadFromAirtable(recordId = null) {
  try {
    // Get record ID from URL params or input field
    const id =
      recordId ||
      getRecordIdFromUrl() ||
      document.getElementById('recordId')?.value?.trim()

    if (!id) {
      console.warn('No record ID provided')
      if (typeof showToast === 'function') {
        showToast('Por favor ingresa un ID de registro válido', 'warning')
      }
      return
    }

    console.log('Loading record:', id)

    if (typeof showToast === 'function') {
      showToast('Cargando desde Airtable...', 'info')
    }

    // Fetch from Airtable using predefined config
    const response = await fetch(
      `https://api.airtable.com/v0/${
        AIRTABLE_CONFIG.BASE_ID
      }/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Error ${response.status}: ${errorData}`)
    }

    const data = await response.json()
    const fields = data.fields

    console.log('Record data:', data)

    // Fill form with data
    fillFormFromAirtable(fields)

    // Update preview if function exists
    if (typeof updatePreview === 'function') {
      updatePreview()
    }

    if (typeof showToast === 'function') {
      showToast('✅ Datos cargados correctamente', 'success')
    }

    return data
  } catch (error) {
    console.error('Error loading from Airtable:', error)
    if (typeof showToast === 'function') {
      showToast(`Error: ${error.message}`, 'error')
    }
  }
}

/**
 * Upload images to Airtable
 */
async function uploadToAirtable() {
  try {
    const recordId =
      getRecordIdFromUrl() || document.getElementById('recordId')?.value?.trim()

    if (!recordId) {
      showToast('Necesitas un Record ID para guardar', 'warning')
      return
    }

    showToast('Generando y subiendo imagen...', 'info')

    // Generate image
    const imageBlob = await generateCurrentImage()

    // Convert to base64 data URL for Airtable attachments
    const base64Image = await blobToBase64(imageBlob)

    // Create attachment format for Airtable
    const attachmentData = [
      {
        url: base64Image,
        filename: `rdv-social-${recordId}-${Date.now()}.png`,
      },
    ]

    // Update Airtable record with proper field names
    const updateData = {
      fields: {
        social_image_facebook: attachmentData,
        social_image_twitter: attachmentData,
        social_image_instagram: attachmentData,
      },
    }

    console.log('Updating Airtable with data:', updateData)

    const response = await fetch(
      `https://api.airtable.com/v0/${
        AIRTABLE_CONFIG.BASE_ID
      }/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    )

    if (response.ok) {
      const result = await response.json()
      console.log('Upload successful:', result)
      showToast('✅ Imagen guardada en Airtable', 'success')
    } else {
      const errorText = await response.text()
      console.error('Upload failed:', response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error('Error uploading to Airtable:', error)
    showToast(`Error guardando imagen: ${error.message}`, 'error')
  }
}

/**
 * Fill form from Airtable data (Enhanced to load image)
 */
function fillFormFromAirtable(fields) {
  console.log('Filling form with fields:', fields)

  // Map Airtable fields to form fields
  const formData = {
    title: fields[FIELD_MAP.title] || '',
    excerpt:
      fields[FIELD_MAP.excerpt] || fields[FIELD_MAP.socialMediaText] || '',
    tags: fields[FIELD_MAP.tags] || '',
    category: fields[FIELD_MAP.section] || 'general',
    backgroundImage:
      fields[FIELD_MAP.imgUrl] || fields[FIELD_MAP.image]?.[0]?.url || '',
    source: 'RDV Noticias',
    author: 'Redacción RDV',
  }

  console.log('Mapped form data:', formData)

  // Fill form fields
  Object.keys(formData).forEach((fieldId) => {
    const element = document.getElementById(fieldId)
    if (element && formData[fieldId]) {
      console.log(`Setting ${fieldId} to:`, formData[fieldId])
      element.value = formData[fieldId]

      // Trigger input event for character counters
      element.dispatchEvent(new Event('input'))

      // Special handling for background image
      if (fieldId === 'backgroundImage' && formData[fieldId]) {
        // Trigger image load event
        element.dispatchEvent(new Event('change'))

        // Also try to update the canvas background directly
        setTimeout(() => {
          loadBackgroundImage(formData[fieldId])
        }, 500)
      }
    } else if (!element) {
      console.warn(`Form element not found: ${fieldId}`)
    }
  })

  // Force preview update after data is loaded
  setTimeout(() => {
    if (typeof updatePreview === 'function') {
      updatePreview()
    }
  }, 1000)
}

/**
 * Check if URL needs CORS proxy
 */
function needsCorsProxy(url) {
  if (!url) return false

  // Check if it's a data URL or blob URL
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return false
  }

  // Check if it's from the same origin
  const currentOrigin = window.location.origin
  try {
    const urlOrigin = new URL(url).origin
    return urlOrigin !== currentOrigin
  } catch (e) {
    return false
  }
}

/**
 * Get proxied URL for CORS issues
 */
function getProxiedUrl(originalUrl) {
  if (!needsCorsProxy(originalUrl)) {
    return originalUrl
  }

  console.log('Using CORS proxy for:', originalUrl)
  return `${CORS_PROXY}${encodeURIComponent(originalUrl)}`
}

/**
 * Load background image into canvas with CORS handling
 */
function loadBackgroundImage(imageUrl) {
  try {
    const canvas = document.getElementById('canvas')
    if (!canvas || !imageUrl) {
      console.warn('Canvas or imageUrl not found')
      return
    }

    console.log('Loading background image:', imageUrl)
    showToast('Cargando imagen de fondo...', 'info')

    // Try multiple methods to load the image
    loadImageWithFallback(imageUrl)
      .then((finalUrl) => {
        // Apply image as background
        canvas.style.backgroundImage = `url("${finalUrl}")`
        canvas.style.backgroundSize = 'cover'
        canvas.style.backgroundPosition = 'center'
        canvas.style.backgroundRepeat = 'no-repeat'

        console.log('Background image loaded successfully:', finalUrl)
        showToast('✅ Imagen de fondo cargada', 'success')

        // Trigger preview update
        if (typeof updatePreview === 'function') {
          setTimeout(updatePreview, 100)
        }
      })
      .catch((error) => {
        console.error('Failed to load background image:', error)
        showToast('⚠️ Error cargando imagen, usando placeholder', 'warning')

        // Use a placeholder gradient
        canvas.style.backgroundImage =
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        canvas.style.backgroundSize = 'cover'
        canvas.style.backgroundPosition = 'center'
      })
  } catch (error) {
    console.error('Error in loadBackgroundImage:', error)
    showToast('Error cargando imagen de fondo', 'error')
  }
}

/**
 * Load image with multiple fallback methods
 */
async function loadImageWithFallback(originalUrl) {
  const methods = [
    // Method 1: Try original URL first
    () => testImageLoad(originalUrl),
    // Method 2: Try with CORS proxy
    () => testImageLoad(getProxiedUrl(originalUrl)),
    // Method 3: Try converting to blob and creating object URL
    () => fetchImageAsBlob(originalUrl),
    // Method 4: Try alternative CORS proxy
    () => testImageLoad(`https://cors-anywhere.herokuapp.com/${originalUrl}`),
  ]

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying image load method ${i + 1}...`)
      const result = await methods[i]()
      console.log(`Method ${i + 1} successful`)
      return result
    } catch (error) {
      console.log(`Method ${i + 1} failed:`, error.message)
      if (i === methods.length - 1) {
        throw new Error('All image loading methods failed')
      }
    }
  }
}

/**
 * Test if an image URL can be loaded
 */
function testImageLoad(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      resolve(url)
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }

    // Set timeout
    setTimeout(() => {
      reject(new Error(`Timeout loading image: ${url}`))
    }, 10000)

    img.src = url
  })
}

/**
 * Fetch image as blob and create object URL
 */
async function fetchImageAsBlob(url) {
  try {
    const response = await fetch(getProxiedUrl(url))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    // Clean up object URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 60000)

    return objectUrl
  } catch (error) {
    throw new Error(`Fetch as blob failed: ${error.message}`)
  }
}

/**
 * Get record ID from URL parameters
 */
function getRecordIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const recordId = urlParams.get('recordId') || urlParams.get('id')
  console.log('Record ID from URL:', recordId)
  return recordId
}

/**
 * Helper functions for image generation and upload
 */
async function generateCurrentImage() {
  try {
    // Try to use the existing generateImage function from image-capture module
    if (typeof window.generateImage === 'function') {
      return await window.generateImage()
    }

    // Fallback: capture the canvas element directly
    const canvas = document.getElementById('canvas')
    if (canvas) {
      // Use html2canvas to capture the template
      const canvasElement = await html2canvas(canvas, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        proxy: CORS_PROXY,
      })

      return new Promise((resolve) => {
        canvasElement.toBlob(resolve, 'image/png', 1.0)
      })
    }

    // Last resort: create a placeholder
    const placeholderCanvas = document.createElement('canvas')
    placeholderCanvas.width = 1200
    placeholderCanvas.height = 630
    const ctx = placeholderCanvas.getContext('2d')

    ctx.fillStyle = '#e53e3e'
    ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height)
    ctx.fillStyle = 'white'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      'RDV Image Generated',
      placeholderCanvas.width / 2,
      placeholderCanvas.height / 2
    )

    return new Promise((resolve) => {
      placeholderCanvas.toBlob(resolve, 'image/png')
    })
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

/**
 * Simple placeholder functions for missing dependencies
 */
function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`)
  // Create a simple toast notification
  const toast = document.createElement('div')
  toast.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 20px;
              background: ${
                type === 'success'
                  ? '#4CAF50'
                  : type === 'error'
                  ? '#f44336'
                  : type === 'warning'
                  ? '#ff9800'
                  : '#2196F3'
              };
              color: white;
              border-radius: 4px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              font-size: 14px;
              max-width: 300px;
          `
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 4000)
}

// Add this test function to check what tables are actually available
async function listAvailableTables() {
  try {
    console.log('Checking available tables in base:', AIRTABLE_CONFIG.BASE_ID)

    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_CONFIG.BASE_ID}/tables`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      console.log(
        'Available tables:',
        data.tables.map((t) => ({ name: t.name, id: t.id }))
      )
      return data.tables
    } else {
      console.error(
        'Failed to list tables:',
        response.status,
        await response.text()
      )
      return null
    }
  } catch (error) {
    console.error('Error listing tables:', error)
    return null
  }
}

// Make functions globally available
window.loadFromAirtable = loadFromAirtable
window.uploadToAirtable = uploadToAirtable
window.testAirtableConnection = testAirtableConnection
window.fillFormFromAirtable = fillFormFromAirtable
window.getRecordIdFromUrl = getRecordIdFromUrl
window.showToast = showToast
window.listAvailableTables = listAvailableTables
window.generateCurrentImage = generateCurrentImage
window.blobToBase64 = blobToBase64
window.loadBackgroundImage = loadBackgroundImage
window.getProxiedUrl = getProxiedUrl
window.needsCorsProxy = needsCorsProxy
window.loadImageWithFallback = loadImageWithFallback

console.log('🚀 Airtable Integration loaded with predefined config')

// Auto-test connection when loaded
setTimeout(() => {
  console.log('Auto-testing Airtable connection...')
  testAirtableConnection()
}, 1000)
