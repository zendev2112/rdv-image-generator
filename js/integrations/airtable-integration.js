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

// Enhanced CORS Proxies with more options and dedicated image proxies
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://yacdn.org/proxy/',
  'https://cors.eu.org/',
  'https://cors-proxy.htmldriven.com/?url=',
]

// Specific image proxy services
const IMAGE_PROXIES = [
  'https://images.weserv.nl/?url=',
  'https://imageproxy.pimg.tw/resize?url=',
  'https://wsrv.nl/?url=',
]

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

        // Apply image directly to the canvas element with enhanced loading
        setTimeout(() => {
          applyImageToCanvasEnhanced(formData[fieldId])
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
 * ENHANCED: Apply image to canvas with all possible methods
 */
function applyImageToCanvasEnhanced(imageUrl) {
  console.log('🎯 Enhanced image loading for:', imageUrl)
  
  // Find the canvas element - try multiple selectors
  const canvasSelectors = [
    '#canvas',
    '.template-canvas', 
    '.canvas',
    '.preview-container > div',
    '[id*="canvas"]'
  ]
  
  let canvas = null
  for (const selector of canvasSelectors) {
    canvas = document.querySelector(selector)
    if (canvas) {
      console.log('✅ Found canvas with selector:', selector)
      break
    }
  }
  
  if (!canvas) {
    console.error('❌ No canvas element found')
    return
  }

  showToast('🔄 Cargando imagen con métodos avanzados...', 'info')

  // Try comprehensive image loading
  loadImageComprehensive(imageUrl)
    .then((finalUrl) => {
      console.log('✅ Image loaded with enhanced method:', finalUrl)
      
      // Apply image with multiple fallback methods
      applyImageToCanvasMultiple(canvas, finalUrl)
      
      showToast('✅ Imagen cargada exitosamente', 'success')
    })
    .catch((error) => {
      console.error('❌ All enhanced methods failed:', error)
      showToast('⚠️ No se pudo cargar la imagen, usando placeholder', 'warning')
      
      // Enhanced placeholder with image info
      createEnhancedPlaceholder(canvas, imageUrl)
    })
}

/**
 * Comprehensive image loading with ALL methods
 */
async function loadImageComprehensive(originalUrl) {
  console.log('🔄 Starting comprehensive image loading for:', originalUrl)
  
  const allMethods = [
    // Method 1: Original URL
    () => testImageUrl(originalUrl),
    
    // Method 2-9: CORS Proxies
    ...CORS_PROXIES.map((proxy, index) => 
      () => testImageUrl(proxy + encodeURIComponent(originalUrl))
    ),
    
    // Method 10-12: Image-specific proxies
    ...IMAGE_PROXIES.map((proxy, index) => 
      () => testImageUrl(proxy + encodeURIComponent(originalUrl))
    ),
    
    // Method 13: Fetch as blob with original
    () => fetchAsDataUrl(originalUrl),
    
    // Method 14-21: Fetch as blob with CORS proxies
    ...CORS_PROXIES.map((proxy, index) => 
      () => fetchAsDataUrl(proxy + encodeURIComponent(originalUrl))
    ),
    
    // Method 22: Try without https (if https fails)
    () => {
      if (originalUrl.startsWith('https://')) {
        const httpUrl = originalUrl.replace('https://', 'http://')
        return testImageUrl(httpUrl)
      }
      throw new Error('Not HTTPS URL')
    },
    
    // Method 23: Try adding cache buster
    () => {
      const separator = originalUrl.includes('?') ? '&' : '?'
      const cacheBustedUrl = originalUrl + separator + 'cb=' + Date.now()
      return testImageUrl(cacheBustedUrl)
    },
    
    // Method 24: Try Google proxy (for public images)
    () => testImageUrl(`https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(originalUrl)}`),
  ]

  for (let i = 0; i < allMethods.length; i++) {
    try {
      console.log(`🔄 Trying method ${i + 1}/${allMethods.length}...`)
      const result = await allMethods[i]()
      console.log(`✅ Method ${i + 1} SUCCESS:`, result)
      return result
    } catch (error) {
      console.log(`❌ Method ${i + 1} failed:`, error.message)
      
      // Add small delay between attempts to avoid rate limiting
      if (i < allMethods.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }
  
  throw new Error(`All ${allMethods.length} methods failed for: ${originalUrl}`)
}

/**
 * Apply image to canvas with multiple rendering methods
 */
function applyImageToCanvasMultiple(canvas, imageUrl) {
  console.log('🎨 Applying image with multiple methods')
  
  // Prepare canvas
  canvas.style.display = 'block'
  canvas.style.position = 'relative'
  canvas.style.width = '100%'
  canvas.style.minHeight = '600px'
  
  // Method 1: CSS Background
  try {
    canvas.style.setProperty('background-image', `url("${imageUrl}")`, 'important')
    canvas.style.setProperty('background-size', 'cover', 'important')
    canvas.style.setProperty('background-position', 'center', 'important')
    canvas.style.setProperty('background-repeat', 'no-repeat', 'important')
    canvas.setAttribute('data-bg-loaded', 'true')
    
    // Check if CSS background worked
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(canvas)
      if (computedStyle.backgroundImage === 'none' || computedStyle.backgroundImage === '') {
        console.warn('CSS background failed, trying overlay method')
        createImageOverlay(canvas, imageUrl)
      } else {
        console.log('✅ CSS background applied successfully')
        hideCanvasPlaceholder(canvas)
      }
    }, 200)
    
  } catch (error) {
    console.warn('CSS background method failed:', error)
    createImageOverlay(canvas, imageUrl)
  }
}

/**
 * Hide canvas placeholder content
 */
function hideCanvasPlaceholder(canvas) {
  const placeholder = canvas.querySelector('.placeholder-content')
  if (placeholder) {
    placeholder.style.opacity = '0.2'
    placeholder.style.pointerEvents = 'none'
    placeholder.style.zIndex = '1'
  }
}

/**
 * Create enhanced placeholder with image information
 */
function createEnhancedPlaceholder(canvas, failedUrl) {
  console.log('🎨 Creating enhanced placeholder')
  
  // Extract domain from failed URL for display
  let domain = 'Unknown source'
  try {
    domain = new URL(failedUrl).hostname
  } catch (e) {}
  
  canvas.style.setProperty('background-image', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'important')
  canvas.style.setProperty('background-size', 'cover', 'important')
  
  // Create info overlay
  const infoOverlay = document.createElement('div')
  infoOverlay.className = 'image-failed-overlay'
  infoOverlay.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 5;
    max-width: 200px;
    word-wrap: break-word;
  `
  infoOverlay.innerHTML = `
    <div>❌ Image failed to load</div>
    <div style="font-size: 10px; opacity: 0.8;">Source: ${domain}</div>
    <div style="font-size: 10px; margin-top: 4px;">
      <a href="${failedUrl}" target="_blank" style="color: #87CEEB;">View original</a>
    </div>
  `
  
  // Remove existing overlay
  const existing = canvas.querySelector('.image-failed-overlay')
  if (existing) existing.remove()
  
  canvas.style.position = 'relative'
  canvas.appendChild(infoOverlay)
}

/**
 * Fetch image as data URL
 */
async function fetchAsDataUrl(url) {
  console.log('🔄 Fetching as data URL:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const blob = await response.blob()
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Create image overlay as fallback method
 */
function createImageOverlay(canvas, imageUrl) {
  console.log('🔄 Creating image overlay as fallback')
  
  // Remove existing overlay
  const existingOverlay = canvas.querySelector('.canvas-image-overlay')
  if (existingOverlay) existingOverlay.remove()
  
  // Create image overlay element
  const overlay = document.createElement('div')
  overlay.className = 'canvas-image-overlay'
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("${imageUrl}");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
    pointer-events: none;
  `
  
  // Ensure canvas is positioned relative
  canvas.style.position = 'relative'
  
  // Insert overlay as first child
  canvas.insertBefore(overlay, canvas.firstChild)
  
  // Ensure other content is above overlay
  Array.from(canvas.children).forEach((child, index) => {
    if (index > 0) { // Skip the overlay itself
      child.style.position = 'relative'
      child.style.zIndex = '1'
    }
  })
  
  hideCanvasPlaceholder(canvas)
  console.log('✅ Image overlay created successfully')
}

/**
 * Test if an image URL loads successfully
 */
function testImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('✅ Image loaded:', url)
      resolve(url)
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load: ${url}`))
    }
    
    // Reduced timeout for faster fallback
    setTimeout(() => {
      reject(new Error(`Timeout: ${url}`))
    }, 3000)
    
    img.src = url
  })
}

/**
 * Load image with CORS proxy handling (LEGACY)
 */
async function loadImageWithCorsProxy(originalUrl) {
  return loadImageComprehensive(originalUrl)
}

/**
 * LEGACY FUNCTIONS FOR COMPATIBILITY
 */
function applyImageToCanvas(imageUrl) {
  applyImageToCanvasEnhanced(imageUrl)
}

function loadBackgroundImage(imageUrl) {
  applyImageToCanvasEnhanced(imageUrl)
}

function needsCorsProxy(url) {
  if (!url) return false
  if (url.startsWith('data:') || url.startsWith('blob:')) return false
  
  const currentOrigin = window.location.origin
  try {
    const urlOrigin = new URL(url).origin
    return urlOrigin !== currentOrigin
  } catch (e) {
    return false
  }
}

function getProxiedUrl(originalUrl, proxyIndex = 0) {
  if (!needsCorsProxy(originalUrl)) return originalUrl
  
  const proxy = CORS_PROXIES[proxyIndex] || CORS_PROXIES[0]
  return `${proxy}${encodeURIComponent(originalUrl)}`
}

async function loadImageWithFallback(originalUrl) {
  return loadImageComprehensive(originalUrl)
}

function testImageLoad(url) {
  return testImageUrl(url)
}

async function fetchImageAsBlob(url, proxyIndex = 0) {
  try {
    const proxiedUrl = getProxiedUrl(url, proxyIndex)
    const response = await fetch(proxiedUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 60000)

    return objectUrl
  } catch (error) {
    throw new Error(`Fetch as blob failed: ${error.message}`)
  }
}

function getRecordIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const recordId = urlParams.get('recordId') || urlParams.get('id')
  console.log('Record ID from URL:', recordId)
  return recordId
}

async function generateCurrentImage() {
  try {
    if (typeof window.generateImage === 'function') {
      return await window.generateImage()
    }

    const canvas = document.getElementById('canvas')
    if (canvas) {
      const canvasElement = await html2canvas(canvas, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      return new Promise((resolve) => {
        canvasElement.toBlob(resolve, 'image/png', 1.0)
      })
    }

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

function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`)
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
window.applyImageToCanvas = applyImageToCanvas
window.applyImageToCanvasEnhanced = applyImageToCanvasEnhanced
window.createImageOverlay = createImageOverlay
window.loadImageWithCorsProxy = loadImageWithCorsProxy
window.loadImageComprehensive = loadImageComprehensive
window.testImageUrl = testImageUrl
window.getProxiedUrl = getProxiedUrl
window.needsCorsProxy = needsCorsProxy
window.loadImageWithFallback = loadImageWithFallback
window.createEnhancedPlaceholder = createEnhancedPlaceholder
window.fetchAsDataUrl = fetchAsDataUrl

console.log('🚀 Airtable Integration loaded with ENHANCED image loading (24 methods)')

setTimeout(() => {
  console.log('Auto-testing Airtable connection...')
  testAirtableConnection()
}, 1000)
