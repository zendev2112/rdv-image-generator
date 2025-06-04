/**
 * Facebook Sharing Integration for RDV Image Generator
 * Clean, production-ready version
 * Author: RDV Team
 */

// Configuration
const RDV_API_CONFIG = {
  baseUrl: 'https://rdv-news-api.vercel.app',
  endpoints: {
    quickPublish: '/api/social-media-publishing/quick-publish',
    testConnection: '/api/social-media-publishing/test/facebook',
    platforms: '/api/social-media-publishing/platforms',
  },
}

/**
 * Initialize Facebook sharing module
 */
function initializeFacebookSharing() {
  console.log('✅ Facebook sharing module initialized')
  testAPIConnection()
}

/**
 * Test API connection
 */
async function testAPIConnection() {
  try {
    console.log('🔍 Testing API connection...')

    const response = await fetch(
      `${RDV_API_CONFIG.baseUrl}${RDV_API_CONFIG.endpoints.platforms}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend API connection successful:', data)
      return true
    } else {
      console.warn('⚠️ Backend API connection failed:', response.status)
      return false
    }
  } catch (error) {
    console.warn('⚠️ Backend API not available:', error.message)
    return false
  }
}

/**
 * Main Facebook sharing function
 */
async function shareToFacebook() {
  console.log('📘 Starting Facebook sharing...')

  try {
    // Security check
    if (
      location.protocol !== 'https:' &&
      !location.hostname.includes('localhost')
    ) {
      console.warn('⚠️ HTTPS required in production')
      return
    }

    showToast('🔄 Preparando contenido para Facebook...', 'info')

    // Get form data
    const content = getCurrentFormData()
    console.log('📝 Content:', content)

    // Generate image
    const imageBlob = await generateCurrentImage()
    console.log('🖼️ Image generated:', imageBlob?.size || 0, 'bytes')

    // Create Facebook post object
    const facebookPost = {
      message: generateFacebookPostText(content),
      image: imageBlob,
      link: content.url || 'https://radiodelvolga.com',
      title: content.title,
      description: content.excerpt,
    }

    console.log('📋 Facebook post created')

    // Show sharing options
    await shareToFacebookMultipleMethods(facebookPost)

    console.log('✅ Facebook sharing completed')
  } catch (error) {
    console.error('❌ Error sharing to Facebook:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

/**
 * Generate Facebook post text from content
 */
function generateFacebookPostText(content) {
  let postText = ''

  // Add title
  if (content.title) {
    postText += `${content.title}\n\n`
  }

  // Add excerpt/description
  if (content.excerpt) {
    postText += `${content.excerpt}\n\n`
  }

  // Add hashtags
  if (content.tags) {
    const hashtags = content.tags
      .split(',')
      .map((tag) => `#${tag.trim()}`)
      .slice(0, 5)
      .join(' ')
    postText += `${hashtags}\n\n`
  }

  // Add footer
  postText += `📻 Radio del Volga\n🌐 radiodelvolga.com`

  // Add link if available
  if (content.url) {
    postText += `\n\n🔗 ${content.url}`
  }

  return postText
}

/**
 * Show sharing options modal
 */
async function shareToFacebookMultipleMethods(facebookPost) {
  try {
    console.log('📱 Showing Facebook sharing options...')

    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
    `

    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%;
                  text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 3px solid #4267B2;">
        
        <div style="width: 70px; height: 70px; background: linear-gradient(45deg, #4267B2, #365899);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 35px; margin: 0 auto 20px auto;">📘</div>
        
        <h3 style="color: #4267B2; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
          Compartir en Facebook
        </h3>
        
        <p style="color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 15px;">
          Elige el método que prefieras:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="useDirectMethod()" style="background: #4267B2; color: white; border: none;
                       padding: 16px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🌐</span>
              <span>Abrir Facebook Directamente</span>
            </div>
            <span>→</span>
          </button>
          
          <button onclick="useDownloadMethod()" style="background: #42b883; color: white; border: none;
                       padding: 16px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">📥</span>
              <span>Descargar imagen + copiar texto</span>
            </div>
            <span>→</span>
          </button>
        </div>
        
        <button onclick="closeModal()" style="background: #f0f0f0; color: #666; border: none;
                     padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; 
                     margin-top: 20px; font-size: 14px;">
          Cancelar
        </button>
      </div>
    `

    document.body.appendChild(modal)

    // Modal functions
    window.useDirectMethod = function () {
      document.body.removeChild(modal)
      shareViaFacebookWebIntent(facebookPost)
      cleanup()
    }

    window.useDownloadMethod = function () {
      document.body.removeChild(modal)
      downloadImageForManualSharing(facebookPost)
      cleanup()
    }

    window.closeModal = function () {
      document.body.removeChild(modal)
      cleanup()
    }

    function cleanup() {
      delete window.useDirectMethod
      delete window.useDownloadMethod
      delete window.closeModal
    }
  } catch (error) {
    console.error('❌ Error in sharing modal:', error)
    // Fallback to direct method
    shareViaFacebookWebIntent(facebookPost)
  }
}

/**
 * Share via Facebook web (direct method)
 */
function shareViaFacebookWebIntent(facebookPost) {
  try {
    console.log('🌐 Opening Facebook directly...')

    // Copy text to clipboard
    navigator.clipboard
      .writeText(facebookPost.message)
      .then(() => {
        showToast('📋 Texto copiado al portapapeles', 'success')
      })
      .catch(() => {
        console.log('Clipboard failed')
      })

    // Open Facebook
    window.open('https://www.facebook.com/', '_blank')
    showToast('🌐 Facebook abierto - pega el texto copiado', 'info')

    // Show instructions
    showFacebookSharingInstructions(facebookPost)
  } catch (error) {
    console.error('❌ Error opening Facebook:', error)
    showToast('Error abriendo Facebook', 'error')
  }
}

/**
 * Download image and copy text
 */
async function downloadImageForManualSharing(facebookPost) {
  try {
    console.log('📥 Downloading image...')

    // Download the image
    const imageUrl = URL.createObjectURL(facebookPost.image)
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `facebook-post-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(imageUrl)

    // Copy text to clipboard
    await navigator.clipboard.writeText(facebookPost.message)

    showToast('📥 Imagen descargada y texto copiado', 'success')
    showFacebookSharingInstructions(facebookPost)
  } catch (error) {
    console.error('❌ Error downloading:', error)
    showToast('Error descargando imagen', 'error')
  }
}

/**
 * Show Facebook sharing instructions
 */
function showFacebookSharingInstructions(facebookPost) {
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10001;
    max-width: 450px;
    width: 90%;
    text-align: center;
    font-family: 'Inter', sans-serif;
    border: 3px solid #4267B2;
  `

  modal.innerHTML = `
    <div style="width: 70px; height: 70px; background: linear-gradient(45deg, #4267B2, #365899);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                font-size: 35px; margin: 0 auto 20px auto;">📘</div>
    
    <h3 style="color: #4267B2; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
      ¡Listo para Facebook!
    </h3>
    
    <div style="text-align: left; margin-bottom: 20px; line-height: 1.6; color: #333;">
      <p><strong>Pasos en Facebook:</strong></p>
      <ol style="padding-left: 20px; font-size: 14px;">
        <li>Haz clic en "¿Qué estás pensando?"</li>
        <li>Pega el texto (Ctrl+V)</li>
        <li>Sube la imagen descargada (si aplica)</li>
        <li>¡Publica!</li>
      </ol>
    </div>
    
    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; 
                font-size: 12px; max-height: 120px; overflow-y: auto; text-align: left;">
      <strong>Texto copiado:</strong><br>
      ${facebookPost.message.replace(/\n/g, '<br>')}
    </div>
    
    <div style="display: flex; gap: 12px;">
      <button onclick="window.open('https://facebook.com', '_blank')" style="flex: 1; background: #4267B2;
                     color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600;
                     cursor: pointer; font-size: 14px;">
        Ir a Facebook
      </button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="flex: 1; background: #f0f0f0;
                     color: #666; border: none; padding: 12px; border-radius: 8px; font-weight: 600;
                     cursor: pointer; font-size: 14px;">
        Cerrar
      </button>
    </div>
  `

  document.body.appendChild(modal)

  // Auto-close after 30 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }, 30000)
}

/**
 * Get current form data
 */
function getCurrentFormData() {
  return {
    title: document.getElementById('title')?.value || 'Test Post from RDV',
    excerpt:
      document.getElementById('excerpt')?.value ||
      'This is a test post from Radio del Volga',
    tags: document.getElementById('tags')?.value || 'rdv,noticias,facebook',
    source: 'RDV Noticias',
    url: 'https://radiodelvolga.com',
  }
}

/**
 * Get current platform
 */
function getCurrentPlatform() {
  return window.RDVImageGenerator?.currentPlatform || 'facebook'
}

/**
 * Get current template
 */
function getCurrentTemplate() {
  return window.RDVImageGenerator?.currentTemplate || 'post'
}

/**
 * Generate current image
 */
async function generateCurrentImage() {
  try {
    // Try to use existing generateImage function
    if (typeof window.generateImage === 'function') {
      const imageBlob = await window.generateImage(false)
      if (imageBlob && imageBlob instanceof Blob) {
        console.log('✅ Image generated using existing function')
        return imageBlob
      }
    }

    // Fallback: Create test image
    console.log('📝 Creating test image...')
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
    gradient.addColorStop(0, '#4267B2')
    gradient.addColorStop(1, '#365899')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    // Text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Test Facebook Post', 600, 280)

    ctx.font = '24px Arial'
    ctx.fillText('Radio del Volga', 600, 350)

    ctx.font = '18px Arial'
    ctx.fillText(new Date().toLocaleString(), 600, 400)

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Try to use existing toast function
  if (typeof window.showToast === 'function') {
    window.showToast(message, type)
    return
  }

  // Fallback toast
  console.log(`TOAST [${type.toUpperCase()}]: ${message}`)

  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: ${
      type === 'success'
        ? '#4caf50'
        : type === 'error'
        ? '#f44336'
        : type === 'warning'
        ? '#ff9800'
        : '#2196f3'
    };
    color: white; padding: 12px 24px; border-radius: 8px;
    font-family: Arial, sans-serif; font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}

/**
 * Add Facebook share button to container
 */
function addFacebookShareButton(containerId) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`Container ${containerId} not found`)
    return
  }

  const button = document.createElement('button')
  button.innerHTML = `
    <span style="font-size: 20px; margin-right: 8px;">📘</span>
    Compartir en Facebook
  `
  button.style.cssText = `
    background: linear-gradient(45deg, #4267B2, #365899);
    color: white; border: none; padding: 12px 24px; border-radius: 8px;
    font-weight: 600; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    width: 100%; transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(66, 103, 178, 0.3);
  `

  button.addEventListener('click', shareToFacebook)
  container.appendChild(button)
  console.log('✅ Facebook share button added')
}

// Global assignments
window.shareToFacebook = shareToFacebook
window.generateFacebookPostText = generateFacebookPostText
window.shareToFacebookMultipleMethods = shareToFacebookMultipleMethods
window.shareViaFacebookWebIntent = shareViaFacebookWebIntent
window.downloadImageForManualSharing = downloadImageForManualSharing
window.showFacebookSharingInstructions = showFacebookSharingInstructions
window.addFacebookShareButton = addFacebookShareButton
window.initializeFacebookSharing = initializeFacebookSharing
window.testAPIConnection = testAPIConnection
window.generateCurrentImage = generateCurrentImage
window.getCurrentFormData = getCurrentFormData
window.getCurrentPlatform = getCurrentPlatform
window.getCurrentTemplate = getCurrentTemplate
window.showToast = showToast

console.log('✅ Facebook sharing functions loaded and available globally')
console.log(
  'shareToFacebook available:',
  typeof window.shareToFacebook === 'function'
)

// Initialize
initializeFacebookSharing()
