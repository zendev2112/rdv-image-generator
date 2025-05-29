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

/**
 * NEW: Select Instagram template and render content
 */
function selectInstagramTemplate(templateType) {
  console.log('🎨 Selecting Instagram template:', templateType)
  
  // Update active template button
  const templateButtons = document.querySelectorAll('.template-btn')
  templateButtons.forEach(btn => btn.classList.remove('active'))
  
  const selectedButton = document.querySelector(`[data-template="${templateType}"]`)
  if (selectedButton) {
    selectedButton.classList.add('active')
  }
  
  // Update global state
  if (window.RDVImageGenerator) {
    window.RDVImageGenerator.currentTemplate = templateType
  }
  
  // Update UI info
  updateTemplateInfoDisplay(templateType)
  
  // Get current form data and render template
  const formData = getCurrentFormData()
  renderInstagramTemplateWithData(formData, templateType)
  
  showToast(`Template cambiado a Instagram ${templateType}`, 'success')
}

/**
 * NEW: Get current form data
 */
function getCurrentFormData() {
  return {
    title: document.getElementById('title')?.value || '',
    excerpt: document.getElementById('excerpt')?.value || '',
    tags: document.getElementById('tags')?.value || '',
    category: document.getElementById('category')?.value || 'general',
    backgroundImage: document.getElementById('backgroundImage')?.value || '',
    source: document.getElementById('source')?.value || 'RDV Noticias',
    author: document.getElementById('author')?.value || 'Redacción RDV'
  }
}

/**
 * NEW: Update template info display
 */
function updateTemplateInfoDisplay(templateType) {
  const platformName = document.getElementById('currentPlatform')
  const templateName = document.getElementById('currentTemplate')
  const dimensions = document.getElementById('currentDimensions')
  
  const configs = {
    'story': { name: 'Instagram Story', dims: '1080 × 1920' },
    'post': { name: 'Instagram Post', dims: '1080 × 1080' },
    'reel-cover': { name: 'Instagram Reel Cover', dims: '1080 × 1920' }
  }
  
  const config = configs[templateType] || configs.story
  
  if (platformName) platformName.textContent = 'Instagram'
  if (templateName) templateName.textContent = config.name
  if (dimensions) dimensions.textContent = config.dims
}

/**
 * NEW: Update template info (wrapper function)
 */
function updateTemplateInfo(content, templateType) {
  console.log('📋 Updating template info UI')
  
  try {
    // Call the existing display function
    updateTemplateInfoDisplay(templateType)
    
    // Update character counters if they exist
    updateCharacterCounters(content)
    
    // Update preview indicators
    updatePreviewIndicators(content, templateType)
    
    // Update meta info display
    updateMetaInfoDisplay(content, templateType)
    
  } catch (error) {
    console.warn('Could not update template info:', error)
    // Don't throw error, just log warning
  }
}

/**
 * Update character counters for current content
 */
function updateCharacterCounters(content) {
  try {
    const counters = [
      { elementId: 'titleCounter', value: content.title || '', max: 100 },
      { elementId: 'excerptCounter', value: content.excerpt || '', max: 280 },
      { elementId: 'tagsCounter', value: content.hashtags?.join(' ') || '', max: 200 }
    ]
    
    counters.forEach(({ elementId, value, max }) => {
      const counter = document.getElementById(elementId)
      if (counter) {
        const length = value.length
        const percentage = (length / max) * 100
        
        counter.textContent = `${length}/${max}`
        counter.style.color = percentage > 90 ? '#e53e3e' : percentage > 70 ? '#ff9800' : '#4CAF50'
      }
    })
  } catch (error) {
    console.warn('Could not update character counters:', error)
  }
}

/**
 * Update preview indicators
 */
function updatePreviewIndicators(content, templateType) {
  try {
    // Update preview status
    const previewStatus = document.getElementById('previewStatus')
    if (previewStatus) {
      previewStatus.innerHTML = `
        <span class="status-indicator success">✅</span>
        <span>Preview updated</span>
      `
    }
    
    // Update template badge
    const templateBadge = document.getElementById('templateBadge')
    if (templateBadge) {
      templateBadge.textContent = templateType.toUpperCase()
      templateBadge.className = `template-badge ${templateType}`
    }
    
  } catch (error) {
    console.warn('Could not update preview indicators:', error)
  }
}

/**
 * Update meta info display
 */
function updateMetaInfoDisplay(content, templateType) {
  try {
    // Update content stats
    const contentStats = document.getElementById('contentStats')
    if (contentStats) {
      const stats = {
        'Title length': content.title?.length || 0,
        'Excerpt length': content.excerpt?.length || 0,
        'Hashtags': content.hashtags?.length || 0,
        'Has image': content.backgroundImage ? 'Yes' : 'No'
      }
      
      contentStats.innerHTML = Object.entries(stats)
        .map(([key, value]) => `<div class="stat-item"><span>${key}:</span> <strong>${value}</strong></div>`)
        .join('')
    }
    
  } catch (error) {
    console.warn('Could not update meta info display:', error)
  }
}

/**
 * ENHANCED: Render Instagram template with specific template type
 */
function renderInstagramTemplateWithData(data, templateType = null) {
  console.log('🎨 Rendering Instagram template with data:', data)
  
  const currentTemplate = templateType || getCurrentTemplate()
  
  console.log('Current template:', currentTemplate)
  
  // Generate Instagram-optimized content
  const instagramContent = generateInstagramOptimizedContent(data, currentTemplate)
  
  // Apply the content to the canvas
  applyInstagramContentToCanvas(instagramContent, currentTemplate)
}

/**
 * NEW: Generate Instagram-optimized content
 */
function generateInstagramOptimizedContent(data, templateType) {
  // Use the existing Instagram template functions if available
  if (typeof window.InstagramTemplates?.generateContent === 'function') {
    return window.InstagramTemplates.generateContent(data, templateType)
  }
  
  // Fallback content generation
  return {
    title: data.title || 'Título de la noticia',
    excerpt: data.excerpt || 'Descripción de la noticia',
    hashtags: data.tags ? data.tags.split(',').map(tag => `#${tag.trim()}`) : ['#RDVNoticias'],
    author: data.author || 'Redacción RDV',
    source: data.source || '@rdvnoticias',
    date: new Date().toLocaleDateString('es-AR'),
    backgroundImage: data.backgroundImage || '',
    category: data.category || 'GENERAL',
    template: templateType
  }
}

/**
 * NEW: Select Facebook template and render content
 */
function selectFacebookTemplate(templateType) {
  console.log('🎨 Selecting Facebook template:', templateType)
  
  // Update active template button
  const templateButtons = document.querySelectorAll('.template-btn')
  templateButtons.forEach(btn => btn.classList.remove('active'))
  
  const selectedButton = document.querySelector(`[data-template="${templateType}"][data-platform="facebook"]`)
  if (selectedButton) {
    selectedButton.classList.add('active')
  }
  
  // Update global state
  if (window.RDVImageGenerator) {
    window.RDVImageGenerator.currentTemplate = templateType
    window.RDVImageGenerator.currentPlatform = 'facebook'
  }
  
  // Update UI info
  updateFacebookTemplateInfoDisplay(templateType)
  
  // Get current form data and render template
  const formData = getCurrentFormData()
  renderFacebookTemplateWithData(formData, templateType)
  
  showToast(`Template cambiado a Facebook ${templateType}`, 'success')
}

/**
 * NEW: Update Facebook template info display
 */
function updateFacebookTemplateInfoDisplay(templateType) {
  const platformName = document.getElementById('currentPlatform')
  const templateName = document.getElementById('currentTemplate')
  const dimensions = document.getElementById('currentDimensions')
  
  const configs = {
    'post': { name: 'Facebook Post', dims: '1200 × 630' },
    'story': { name: 'Facebook Story', dims: '1080 × 1920' },
    'cover': { name: 'Facebook Cover', dims: '1640 × 859' }
  }
  
  const config = configs[templateType] || configs.post
  
  if (platformName) platformName.textContent = 'Facebook'
  if (templateName) templateName.textContent = config.name
  if (dimensions) dimensions.textContent = config.dims
}

/**
 * NEW: Render Facebook template with specific template type
 */
function renderFacebookTemplateWithData(data, templateType = null) {
  console.log('🎨 Rendering Facebook template with data:', data)
  
  const currentTemplate = templateType || getCurrentTemplate()
  
  console.log('Current Facebook template:', currentTemplate)
  
  // Generate Facebook-optimized content
  const facebookContent = generateFacebookOptimizedContent(data, currentTemplate)
  
  // Apply the content to the canvas
  applyFacebookContentToCanvas(facebookContent, currentTemplate)
}

/**
 * NEW: Generate Facebook-optimized content
 */
function generateFacebookOptimizedContent(data, templateType) {
  // Use the existing Facebook template functions if available
  if (typeof window.FacebookTemplates?.generateContent === 'function') {
    return window.FacebookTemplates.generateContent(data, templateType)
  }
  
  // Fallback content generation
  return {
    title: data.title || 'Título de la noticia',
    excerpt: data.excerpt || 'Descripción de la noticia',
    hashtags: data.tags ? data.tags.split(',').map(tag => `#${tag.trim()}`).slice(0, 3) : ['#RDVNoticias'],
    author: data.author || 'Redacción RDV',
    source: data.source || 'Radio del Volga',
    date: new Date().toLocaleDateString('es-AR'),
    backgroundImage: data.backgroundImage || '',
    category: data.category || 'GENERAL',
    template: templateType
  }
}

/**
 * NEW: Select Twitter template and render content
 */
function selectTwitterTemplate(templateType) {
  console.log('🎨 Selecting Twitter template:', templateType)
  
  // Update active template button
  const templateButtons = document.querySelectorAll('.template-btn')
  templateButtons.forEach(btn => btn.classList.remove('active'))
  
  const selectedButton = document.querySelector(`[data-template="${templateType}"][data-platform="twitter"]`)
  if (selectedButton) {
    selectedButton.classList.add('active')
  }
  
  // Update global state
  if (window.RDVImageGenerator) {
    window.RDVImageGenerator.currentTemplate = templateType
    window.RDVImageGenerator.currentPlatform = 'twitter'
  }
  
  // Update UI info
  updateTwitterTemplateInfoDisplay(templateType)
  
  // Get current form data and render template
  const formData = getCurrentFormData()
  renderTwitterTemplateWithData(formData, templateType)
  
  showToast(`Template cambiado a Twitter ${templateType}`, 'success')
}

/**
 * NEW: Update Twitter template info display
 */
function updateTwitterTemplateInfoDisplay(templateType) {
  const platformName = document.getElementById('currentPlatform')
  const templateName = document.getElementById('currentTemplate')
  const dimensions = document.getElementById('currentDimensions')
  
  const configs = {
    'post': { name: 'Twitter Post', dims: '1200 × 675' },
    'header': { name: 'Twitter Header', dims: '1500 × 500' },
    'card': { name: 'Twitter Card', dims: '1200 × 628' }
  }
  
  const config = configs[templateType] || configs.post
  
  if (platformName) platformName.textContent = 'Twitter'
  if (templateName) templateName.textContent = config.name
  if (dimensions) dimensions.textContent = config.dims
}

/**
 * NEW: Render Twitter template with specific template type
 */
function renderTwitterTemplateWithData(data, templateType = null) {
  console.log('🎨 Rendering Twitter template with data:', data)
  
  const currentTemplate = templateType || getCurrentTemplate()
  
  console.log('Current Twitter template:', currentTemplate)
  
  // Generate Twitter-optimized content
  const twitterContent = generateTwitterOptimizedContent(data, currentTemplate)
  
  // Apply the content to the canvas
  applyTwitterContentToCanvas(twitterContent, currentTemplate)
}

/**
 * NEW: Generate Twitter-optimized content
 */
function generateTwitterOptimizedContent(data, templateType) {
  // Use the existing Twitter template functions if available
  if (typeof window.TwitterTemplates?.generateContent === 'function') {
    return window.TwitterTemplates.generateContent(data, templateType)
  }
  
  // Fallback content generation with Twitter optimizations
  return {
    title: data.title || 'Título de la noticia',
    excerpt: data.excerpt || 'Descripción de la noticia',
    hashtags: data.tags ? data.tags.split(',').map(tag => `#${tag.trim()}`).slice(0, 5) : ['#RDVNoticias'],
    author: data.author || 'Redacción RDV',
    source: data.source || '@RadioDelVolga',
    date: new Date().toLocaleDateString('es-AR'),
    backgroundImage: data.backgroundImage || '',
    category: data.category || 'GENERAL',
    template: templateType,
    tweetText: generateSimpleTweetText(data)
  }
}

/**
 * NEW: Generate simple tweet text for preview
 */
function generateSimpleTweetText(data) {
  let tweetText = data.title || 'Noticia desde RDV'
  
  // Add hashtags
  const hashtags = data.tags ? 
    data.tags.split(',').map(tag => `#${tag.trim()}`).slice(0, 3).join(' ') : 
    '#RDVNoticias'
  
  // Keep within Twitter's 280 character limit
  const maxLength = 280 - hashtags.length - 25 // Reserve space for link and hashtags
  
  if (tweetText.length > maxLength) {
    tweetText = tweetText.substring(0, maxLength - 3) + '...'
  }
  
  return `${tweetText}\n\n📰 Leer más: [LINK]\n\n${hashtags}`
}

/**
 * NEW: Apply Twitter content to canvas
 */
function applyTwitterContentToCanvas(content, templateType) {
  console.log('🐦 Applying Twitter content to canvas')
  
  const canvas = document.getElementById('canvas')
  if (!canvas) return
  
  // Set canvas for Twitter dimensions
  setCanvasForTwitter(canvas, templateType)
  
  // Generate the template HTML
  const templateHTML = generateTwitterTemplateHTML(content, templateType)
  
  // Apply to canvas
  canvas.innerHTML = templateHTML
  
  // Update UI info
  updateTemplateInfo(content, templateType)
}

/**
 * NEW: Set canvas dimensions for Twitter
 */
function setCanvasForTwitter(canvas, templateType) {
  const dimensions = {
    'post': { width: 1200, height: 675, ratio: '16/9', maxWidth: '500px' },
    'header': { width: 1500, height: 500, ratio: '3/1', maxWidth: '600px' },
    'card': { width: 1200, height: 628, ratio: '1.91/1', maxWidth: '500px' }
  }
  
  const dim = dimensions[templateType] || dimensions.post
  
  canvas.style.aspectRatio = dim.ratio
  canvas.style.maxWidth = dim.maxWidth
  canvas.style.width = '100%'
  canvas.style.borderRadius = '12px'
  canvas.style.overflow = 'hidden'
  canvas.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
  canvas.style.transition = 'all 0.3s ease'
  
  console.log(`📐 Canvas set for Twitter ${templateType}: ${dim.ratio}`)
}

/**
 * NEW: Generate Twitter template HTML
 */
function generateTwitterTemplateHTML(content, templateType) {
  switch (templateType) {
    case 'post':
      return generateTwitterPostHTML(content)
    case 'header':
      return generateTwitterHeaderHTML(content)
    case 'card':
      return generateTwitterCardHTML(content)
    default:
      return generateTwitterPostHTML(content)
  }
}

/**
 * NEW: Generate Twitter Post HTML
 */
function generateTwitterPostHTML(content) {
  return `
    <div class="twitter-post-template" style="
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(29,161,242,0.1) 0%, rgba(29,161,242,0.3) 100%);
      display: flex;
      align-items: center;
      padding: 40px;
      color: #14171A;
      font-family: 'Inter', sans-serif;
      aspect-ratio: 16/9;
      border: 1px solid #E1E8ED;
      border-radius: 16px;
      overflow: hidden;
    ">
      <!-- Left Content -->
      <div style="flex: 1; padding-right: 40px;">
        <!-- Header with Profile -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="
            width: 48px;
            height: 48px;
            background: #1DA1F2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 20px;
          ">RDV</div>
          <div>
            <div style="font-weight: 700; font-size: 15px; color: #14171A;">Radio del Volga</div>
            <div style="font-size: 13px; color: #657786;">${content.source} • ${content.date}</div>
          </div>
          <div style="
            margin-left: auto;
            color: #1DA1F2;
            font-size: 24px;
          ">🐦</div>
        </div>

        <!-- Tweet Content -->
        <div style="margin-bottom: 16px;">
          <!-- Title as main tweet -->
          <div style="
            font-size: 20px;
            font-weight: 400;
            line-height: 1.3;
            margin-bottom: 12px;
            color: #14171A;
          ">${content.title}</div>
          
          <!-- Excerpt -->
          <div style="
            font-size: 15px;
            font-weight: 400;
            line-height: 1.4;
            color: #14171A;
            margin-bottom: 12px;
          ">${content.excerpt.length > 100 ? content.excerpt.substring(0, 100) + '...' : content.excerpt}</div>
          
          <!-- Hashtags -->
          <div style="
            font-size: 15px;
            color: #1DA1F2;
            line-height: 1.4;
          ">${content.hashtags.slice(0, 4).join(' ')}</div>
        </div>

        <!-- Link Preview Card -->
        <div style="
          border: 1px solid #E1E8ED;
          border-radius: 14px;
          overflow: hidden;
          background: white;
          margin-bottom: 16px;
        ">
          <div style="
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
          ">📰</div>
          <div style="padding: 12px;">
            <div style="font-size: 13px; color: #657786; margin-bottom: 4px;">radiodelvolga.com</div>
            <div style="font-size: 14px; font-weight: 400; color: #14171A; line-height: 1.3;">
              ${content.title.length > 60 ? content.title.substring(0, 60) + '...' : content.title}
            </div>
          </div>
        </div>

        <!-- Engagement Stats -->
        <div style="
          display: flex;
          gap: 20px;
          align-items: center;
          font-size: 13px;
          color: #657786;
        ">
          <span style="display: flex; align-items: center; gap: 6px;">
            💬 24
          </span>
          <span style="display: flex; align-items: center; gap: 6px;">
            🔄 12
          </span>
          <span style="display: flex; align-items: center; gap: 6px;">
            ❤️ 89
          </span>
          <span style="display: flex; align-items: center; gap: 6px;">
            📊 1.2K
          </span>
        </div>
      </div>

      <!-- Right QR Code / Branding -->
      <div style="
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #0277BD;
        text-align: center;
        position: relative;
        flex-shrink: 0;
      ">
        <div style="font-size: 40px; margin-bottom: 8px;">📱</div>
        <div style="font-weight: 600;">Síguenos en</div>
        <div style="font-weight: 700;">Twitter</div>
      </div>
    </div>
  `
}

/**
 * NEW: Generate Twitter Header HTML
 */
function generateTwitterHeaderHTML(content) {
  return `
    <div class="twitter-header-template" style="
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1DA1F2 0%, #0084B4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: 'Inter', sans-serif;
      text-align: center;
      aspect-ratio: 3/1;
      overflow: hidden;
    ">
      <!-- Background Pattern -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(255,255,255,0.1) 20px,
          rgba(255,255,255,0.1) 40px
        );
      "></div>

      <!-- Main Content -->
      <div style="position: relative; z-index: 2; max-width: 80%;">
        <!-- Logo Section -->
        <div style="margin-bottom: 20px;">
          <div style="
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #1DA1F2;
            font-size: 32px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            margin: 0 auto 20px auto;
          ">RDV</div>
        </div>

        <!-- Main Title -->
        <h1 style="
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 16px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">Radio del Volga</h1>

        <!-- Subtitle -->
        <p style="
          font-size: 18px;
          font-weight: 400;
          line-height: 1.4;
          margin: 0 0 20px 0;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        ">🐦 Síguenos para las últimas noticias y actualidad</p>

        <!-- Features -->
        <div style="
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
        ">
          <span>📻 Radio en vivo</span>
          <span>📰 Noticias</span>
          <span>🎙️ Programas</span>
          <span>🌐 Actualidad</span>
        </div>

        <!-- Social Links -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          opacity: 0.8;
          display: flex;
          gap: 20px;
        ">
          <span>📧 info@radiodelvolga.com</span>
          <span>🌐 radiodelvolga.com</span>
          <span>📱 @RadioDelVolga</span>
        </div>
      </div>

      <!-- Twitter Bird Pattern -->
      <div style="
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 60px;
        opacity: 0.15;
        color: white;
      ">🐦</div>
      
      <div style="
        position: absolute;
        bottom: 20px;
        left: 20px;
        font-size: 40px;
        opacity: 0.15;
        color: white;
      ">🐦</div>
    </div>
  `
}

/**
 * NEW: Generate Twitter Card HTML
 */
function generateTwitterCardHTML(content) {
  return `
    <div class="twitter-card-template" style="
      position: relative;
      width: 100%;
      height: 100%;
      background: white;
      display: flex;
      border: 1px solid #E1E8ED;
      border-radius: 14px;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      aspect-ratio: 1.91/1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    ">
      <!-- Left Content -->
      <div style="flex: 1; padding: 30px; display: flex; flex-direction: column; justify-content: center;">
        <!-- Category Badge -->
        <div style="
          background: #1DA1F2;
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 16px;
          align-self: flex-start;
        ">${content.category}</div>

        <!-- Title -->
        <h1 style="
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 12px 0;
          color: #14171A;
        ">${content.title}</h1>

        <!-- Excerpt -->
        <p style="
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
          margin: 0 0 16px 0;
          color: #657786;
        ">${content.excerpt.length > 120 ? content.excerpt.substring(0, 120) + '...' : content.excerpt}</p>

        <!-- Card Footer -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 24px;
              height: 24px;
              background: #1DA1F2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 12px;
            ">RDV</div>
            <div>
              <div style="font-size: 12px; font-weight: 600; color: #14171A;">Radio del Volga</div>
              <div style="font-size: 11px; color: #657786;">radiodelvolga.com</div>
            </div>
          </div>
          
          <div style="
            background: #F7F9FA;
            color: #657786;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 500;
          ">${content.date}</div>
        </div>
      </div>

      <!-- Right Image Area -->
      <div style="
        width: 200px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        position: relative;
        flex-shrink: 0;
      ">
        <!-- Image Placeholder -->
        <div style="font-size: 48px; margin-bottom: 12px;">📰</div>
        <div style="font-size: 12px; font-weight: 600; opacity: 0.9;">Imagen de</div>
        <div style="font-size: 12px; font-weight: 600; opacity: 0.9;">la noticia</div>
        
        <!-- Twitter Card indicator -->
        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 600;
        ">
          🐦 CARD
        </div>
      </div>

      <!-- Link Preview Indicator -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #1DA1F2 0%, #0084B4 100%);
      "></div>
    </div>
  `
}

// Update the switchPlatform function to include Twitter
// Add this to the existing switchPlatform function:
const templateSections = {
  'instagram': document.getElementById('instagramTemplates'),
  'facebook': document.getElementById('facebookTemplates'),
  'twitter': document.getElementById('twitterTemplates')
}

// Add to window exports
window.selectTwitterTemplate = selectTwitterTemplate
window.updateTwitterTemplateInfoDisplay = updateTwitterTemplateInfoDisplay
window.renderTwitterTemplateWithData = renderTwitterTemplateWithData
window.generateTwitterOptimizedContent = generateTwitterOptimizedContent
window.generateSimpleTweetText = generateSimpleTweetText
window.applyTwitterContentToCanvas = applyTwitterContentToCanvas
window.setCanvasForTwitter = setCanvasForTwitter
window.generateTwitterTemplateHTML = generateTwitterTemplateHTML
window.generateTwitterPostHTML = generateTwitterPostHTML
window.generateTwitterHeaderHTML = generateTwitterHeaderHTML
window.generateTwitterCardHTML = generateTwitterCardHTML
