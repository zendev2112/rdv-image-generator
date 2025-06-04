/**
 * Facebook Sharing Integration for RDV Image Generator
 * Enhanced with Graph API support via secure backend
 * Author: RDV Team
 * Last Updated: 2024
 */

// SECURE configuration - NO KEYS EXPOSED
const RDV_API_CONFIG = {
  baseUrl: 'https://rdv-news-api.vercel.app',
  apiKey: null, // NO API KEY NEEDED
  endpoints: {
    quickPublish: '/api/social-media-publishing/quick-publish',
    testConnection: '/api/social-media-publishing/test/facebook',
    pageInfo: '/api/social-media-publishing/facebook/page-info',
    platforms: '/api/social-media-publishing/platforms',
  },
}

/**
 * Initialize Facebook sharing module
 */
function initializeFacebookSharing() {
  console.log('✅ Facebook sharing module initialized with Graph API support')

  // Test API connection on initialization
  testAPIConnection()
}

/**
 * Test API connection - NO AUTH REQUIRED
 */
async function testAPIConnection() {
  try {
    console.log('🔍 Testing API connection to your backend...')
    
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
 * Enhanced main Facebook sharing function with Graph API option - DEBUG VERSION
 */
async function shareToFacebook() {
  console.log('📘 Sharing to Facebook...')

  try {
    console.log('🔍 Step 1: Showing toast...')
    showToast('🔄 Preparando para compartir en Facebook...', 'info')

    console.log('🔍 Step 2: Getting form data...')
    const content = getCurrentFormData()
    console.log('📝 Content:', content)

    console.log('🔍 Step 3: Getting platform...')
    const platform = getCurrentPlatform()
    console.log('🎯 Platform:', platform)

    console.log('🔍 Step 4: Getting template...')
    const template = getCurrentTemplate()
    console.log('📋 Template:', template)

    // SKIP platform validation for now to test
    console.log('🔍 Step 5: Skipping platform validation for testing...')

    console.log('🔍 Step 6: Generating image...')
    const imageBlob = await generateCurrentImage()
    console.log('🖼️ Image generated:', imageBlob.size, 'bytes')

    console.log('🔍 Step 7: Showing sharing modal...')

    // SIMPLIFY: Skip the enhanced modal and go straight to manual methods
    console.log('🔍 Going directly to manual methods for testing...')

    const facebookPost = {
      message: generateFacebookPostText(content),
      image: imageBlob,
      link: content.url || 'https://radiodelvolga.com',
      name: content.title,
      description: content.excerpt,
      caption: 'Radio del Volga',
    }

    console.log('📝 Facebook post object:', facebookPost)

    console.log('🔍 Step 8: Calling manual sharing methods...')
    await shareToFacebookMultipleMethods(facebookPost)

    console.log('✅ Facebook sharing completed successfully!')
  } catch (error) {
    console.error('❌ Error sharing to Facebook:', error)
    console.error('❌ Error stack:', error.stack)
    showToast(`❌ Error compartiendo: ${error.message}`, 'error')
  }
}

/**
 * NEW: Show enhanced sharing modal with Graph API option
 */
function showEnhancedSharingModal() {
  return new Promise((resolve) => {
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
    `

    modal.innerHTML = `
      <div style="
        background: white;
        padding: 35px;
        border-radius: 16px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        border: 3px solid #4267B2;
      ">
        <div style="
          width: 70px;
          height: 70px;
          background: linear-gradient(45deg, #4267B2, #365899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          margin: 0 auto 20px auto;
        ">📘</div>
        
        <h3 style="color: #4267B2; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
          Compartir en Facebook
        </h3>
        <p style="color: #666; margin-bottom: 30px; line-height: 1.5; font-size: 15px;">
          Elige el método de publicación:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <button onclick="selectSharingMethod('graph-api')" style="
            background: linear-gradient(45deg, #4267B2, #365899);
            color: white;
            border: none;
            padding: 20px 24px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(66, 103, 178, 0.3);
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">🤖</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Automático con Graph API</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Un click y listo</div>
              </div>
            </div>
            <span style="font-size: 18px;">→</span>
          </button>
          
          <button onclick="selectSharingMethod('manual')" style="
            background: #42b883;
            color: white;
            border: none;
            padding: 20px 24px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(66, 181, 131, 0.3);
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">📱</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Método Manual</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Como siempre</div>
              </div>
            </div>
            <span style="font-size: 18px;">→</span>
          </button>
        </div>
        
        <button onclick="closeSharingModal()" style="
          background: #f0f0f0;
          color: #666;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          font-size: 14px;
        ">Cancelar</button>
      </div>
    `

    document.body.appendChild(modal)

    window.selectSharingMethod = function (method) {
      document.body.removeChild(modal)
      delete window.selectSharingMethod
      delete window.closeSharingModal
      resolve(method)
    }

    window.closeSharingModal = function () {
      document.body.removeChild(modal)
      delete window.selectSharingMethod
      delete window.closeSharingModal
      resolve('manual')
    }
  })
}

/**
 * NEW: Share via secure Graph API backend - NO FRONTEND KEYS
 */
async function shareViaSecureAPI(content, imageBlob) {
  try {
    console.log('🤖 Using your secure backend API...')
    showToast('🤖 Publicando automáticamente via backend...', 'info')

    // Convert blob to base64
    const base64Image = await blobToBase64(imageBlob)

    // Prepare post data - NO API KEY NEEDED
    const postData = {
      platform: 'facebook',
      imageBlob: base64Image,
      caption: generateFacebookPostText(content),
      metadata: {
        title: content.title,
        excerpt: content.excerpt,
        url: content.url || 'https://radiodelvolga.com',
        timestamp: new Date().toISOString(),
        source: 'rdv-image-generator',
      },
    }

    console.log('📤 Sending to your backend API...')
    
    // Call your existing quick-publish endpoint WITHOUT API KEY
    const response = await fetch(
      `${RDV_API_CONFIG.baseUrl}${RDV_API_CONFIG.endpoints.quickPublish}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NO API KEY HEADER
        },
        body: JSON.stringify(postData),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `API request failed: ${response.status}`)
    }

    if (result.success) {
      showToast('✅ ¡Publicado automáticamente via backend!', 'success')
      showGraphAPISuccessModal(result)
      return result
    } else {
      throw new Error(result.error || 'Publishing failed')
    }
  } catch (error) {
    console.error('❌ Backend API failed:', error)
    showToast(`❌ Backend Error: ${error.message}`, 'error')

    // Fallback to manual methods
    showToast('🔄 Usando método manual como respaldo...', 'warning')
    const facebookPost = {
      message: generateFacebookPostText(content),
      image: imageBlob,
      link: content.url || 'https://radiodelvolga.com',
      name: content.title,
      description: content.excerpt,
      caption: 'Radio del Volga',
    }
    await shareToFacebookMultipleMethods(facebookPost)
  }
}

/**
 * NEW: Convert blob to base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * NEW: Show Graph API success modal
 */
function showGraphAPISuccessModal(result) {
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 450px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    border: 3px solid #42b883;
  `

  modal.innerHTML = `
    <div style="
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #42b883, #36d975);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin: 0 auto 20px auto;
      animation: successPulse 1s ease-out;
    ">✅</div>
    
    <h3 style="color: #42b883; margin-bottom: 15px; font-size: 24px; font-weight: 700;">
      ¡Publicado Automáticamente!
    </h3>
    
    <p style="color: #666; margin-bottom: 15px; font-size: 16px; line-height: 1.5;">
      Tu contenido se publicó en Facebook usando Graph API
    </p>
    
    <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 13px;">
      <div><strong>Post ID:</strong> ${result.id}</div>
      <div><strong>Método:</strong> ${result.method}</div>
      <div><strong>Publicado:</strong> ${new Date(
        result.publishedAt
      ).toLocaleString()}</div>
      ${
        result.note
          ? `<div style="color: #666; margin-top: 8px;"><em>${result.note}</em></div>`
          : ''
      }
    </div>
    
    <div style="display: flex; gap: 12px;">
      ${
        result.postUrl
          ? `
        <button onclick="window.open('${result.postUrl}', '_blank')" style="
          flex: 1;
          background: #4267B2;
          color: white;
          border: none;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        ">
          <span>📘</span>
          <span>Ver Post</span>
        </button>
      `
          : ''
      }
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        flex: 1;
        background: #f0f0f0;
        color: #666;
        border: none;
        padding: 14px 20px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">Cerrar</button>
    </div>
    
    <style>
      @keyframes successPulse {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `

  document.body.appendChild(modal)

  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }, 15000)
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

  // Add hashtags (limit for Facebook)
  if (content.hashtags || content.tags) {
    const tags = content.hashtags || content.tags.split(',')
    const hashtags = Array.isArray(tags)
      ? tags
          .map((tag) => `#${tag.trim()}`)
          .slice(0, 5)
          .join(' ')
      : tags
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
 * Enhanced Facebook sharing with multiple methods (EXISTING FUNCTION - ENHANCED)
 */
async function shareToFacebookMultipleMethods(facebookPost) {
  try {
    console.log('📱 Using multi-method Facebook sharing...')

    // Show sharing instruction modal with enhanced options
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

    // Update the modal in shareToFacebookMultipleMethods function
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%;
                  text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 3px solid #42b883;">
        
        <div style="width: 70px; height: 70px; background: linear-gradient(45deg, #42b883, #36d975);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 35px; margin: 0 auto 20px auto;">📱</div>
        
        <h3 style="color: #42b883; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
          Método Manual - Facebook
        </h3>
        
        <p style="color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 15px;">
          Elige cómo quieres compartir manualmente:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="shareViaSimpleDialog()" style="background: #4267B2; color: white; border: none;
                       padding: 16px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🚀</span>
              <span>Facebook Share (Método Simple)</span>
            </div>
            <span>→</span>
          </button>
          
          <button onclick="shareViaWebIntent()" style="background: #4267B2; color: white; border: none;
                       padding: 16px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🌐</span>
              <span>Abrir Facebook Directamente</span>
            </div>
            <span>→</span>
          </button>
          
          <button onclick="downloadAndCopy()" style="background: #1da1f2; color: white; border: none;
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
                     padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px;">
          Cerrar
        </button>
      </div>
    `

    document.body.appendChild(modal)

    // Update the modal functions
    window.shareViaSimpleDialog = function () {
      document.body.removeChild(modal)
      shareViaSimpleFacebookShare(facebookPost) // Use the improved simple method
      cleanupModalFunctions()
    }

    window.shareViaWebIntent = function () {
      document.body.removeChild(modal)
      shareViaFacebookWebIntent(facebookPost)
      cleanupModalFunctions()
    }

    window.downloadAndCopy = function () {
      document.body.removeChild(modal)
      downloadImageForManualSharing(facebookPost)
      cleanupModalFunctions()
    }

    window.closeModal = function () {
      document.body.removeChild(modal)
      cleanupModalFunctions()
    }

    function cleanupModalFunctions() {
      delete window.shareViaSimpleDialog
      delete window.shareViaWebIntent
      delete window.downloadAndCopy
      delete window.closeModal
    }
  } catch (error) {
    console.error('❌ Error in multi-method sharing:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

/**
 * Share via Facebook Share Dialog - IMPROVED VERSION
 */
function shareViaFacebookShareDialog(facebookPost) {
  try {
    console.log('🚀 Opening Facebook Share Dialog...')

    // Method 1: Try the simple Facebook share URL first
    const shareUrl = encodeURIComponent(facebookPost.link || 'https://radiodelvolga.com')
    
    // Use the simpler Facebook share URL that's more reliable
    const facebookShareUrl = `https://www.facebook.com/share.php?u=${shareUrl}`

    // Open in a popup window with better specs
    const popup = window.open(
      facebookShareUrl,
      'facebook-share',
      'width=600,height=500,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no'
    )

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.warn('⚠️ Popup blocked, trying alternative method...')
      
      // Fallback: Open in new tab
      window.open(facebookShareUrl, '_blank')
      showToast('🌐 Facebook Share abierto en nueva pestaña', 'info')
    } else {
      showToast('🚀 Facebook Share Dialog abierto', 'success')
    }

    // Show instructions with the text to copy
    showFacebookSharingInstructions(facebookPost)
    
  } catch (error) {
    console.error('❌ Error opening Facebook Share Dialog:', error)
    
    // Ultimate fallback: Just open Facebook and copy text
    console.log('🔄 Falling back to manual sharing...')
    shareViaFacebookWebIntent(facebookPost)
  }
}

/**
 * ALTERNATIVE: Advanced Facebook Share Dialog with multiple fallbacks
 */
function shareViaAdvancedFacebookDialog(facebookPost) {
  try {
    console.log('🚀 Trying advanced Facebook share methods...')

    // Method 1: FB Share API (if available)
    if (typeof FB !== 'undefined' && FB.ui) {
      console.log('📱 Using Facebook SDK...')
      
      FB.ui({
        method: 'share',
        href: facebookPost.link || 'https://radiodelvolga.com',
        quote: facebookPost.message,
      }, function(response) {
        if (response && !response.error_message) {
          showToast('✅ Compartido via Facebook SDK', 'success')
        } else {
          console.warn('FB SDK failed, falling back...')
          shareViaSimpleFacebookShare(facebookPost)
        }
      })
      return
    }

    // Method 2: Simple share URL
    shareViaSimpleFacebookShare(facebookPost)
    
  } catch (error) {
    console.error('❌ Advanced dialog failed:', error)
    shareViaSimpleFacebookShare(facebookPost)
  }
}

/**
 * Simple Facebook share that always works
 */
function shareViaSimpleFacebookShare(facebookPost) {
  console.log('🌐 Using simple Facebook share...')
  
  const shareUrl = encodeURIComponent(facebookPost.link || 'https://radiodelvolga.com')
  const facebookUrl = `https://www.facebook.com/share.php?u=${shareUrl}`
  
  // Try popup first, then fallback to new tab
  const popup = window.open(facebookUrl, 'facebook-share', 'width=600,height=500')
  
  if (!popup) {
    window.open(facebookUrl, '_blank')
  }
  
  showToast('🚀 Facebook Share abierto', 'success')
  showFacebookSharingInstructions(facebookPost)
}

/**
 * MISSING FUNCTIONS - ADD THESE NOW
 */
function shareViaFacebookWebIntent(facebookPost) {
  try {
    console.log('🌐 Opening Facebook web intent...')

    const facebookUrl = 'https://www.facebook.com/'
    window.open(facebookUrl, '_blank')

    // Copy text to clipboard
    navigator.clipboard.writeText(facebookPost.message).then(() => {
      showToast('📋 Texto copiado - pégalo en Facebook', 'success')
    }).catch(() => {
      console.log('Clipboard API failed, showing text to copy')
    })

    showToast('🌐 Facebook abierto en nueva pestaña', 'success')
    showFacebookSharingInstructions(facebookPost)
  } catch (error) {
    console.error('❌ Error opening Facebook web intent:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

async function downloadImageForManualSharing(facebookPost) {
  try {
    console.log('📥 Downloading image for manual sharing...')

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
    console.error('❌ Error downloading for manual sharing:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

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
    z-index: 10000;
    max-width: 450px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    border: 3px solid #4267B2;
  `

  modal.innerHTML = `
    <h3 style="color: #4267B2; margin-bottom: 20px;">📘 Instrucciones para Facebook</h3>
    <p>Pasos para publicar:</p>
    <ol style="text-align: left; padding-left: 20px;">
      <li>Sube la imagen descargada</li>
      <li>Pega el texto copiado</li>
      <li>¡Publica!</li>
    </ol>
    <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px; max-height: 120px; overflow-y: auto;">
      <strong>Texto:</strong><br>
      ${facebookPost.message.replace(/\n/g, '<br>')}
    </div>
    <button onclick="this.parentElement.remove()" style="background: #4267B2; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
      Cerrar
    </button>
  `

  document.body.appendChild(modal)
}

function getCurrentFormData() {
  return {
    title: document.getElementById('title')?.value || 'Test Post',
    excerpt: document.getElementById('excerpt')?.value || 'Test Description',
    tags: document.getElementById('tags')?.value || 'test,rdv',
    source: 'RDV Noticias',
    url: 'https://radiodelvolga.com',
  }
}

function getCurrentPlatform() {
  return 'facebook'
}

function getCurrentTemplate() {
  return 'post'
}

async function generateCurrentImage() {
  try {
    if (typeof window.generateImage === 'function') {
      const imageBlob = await window.generateImage(false)
      if (imageBlob && imageBlob instanceof Blob) {
        return imageBlob
      }
    }
    
    // Create test image
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#4267B2'
    ctx.fillRect(0, 0, 1200, 630)
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Test Facebook Post', 600, 300)
    
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png')
    })
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type)
    return
  }
  
  console.log(`TOAST: ${message}`)
  
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white; padding: 12px 24px; border-radius: 8px;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => toast.remove(), 3000)
}

function addFacebookShareButton(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const button = document.createElement('button')
  button.innerHTML = '📘 Compartir en Facebook'
  button.style.cssText = `
    background: #4267B2; color: white; border: none;
    padding: 12px 24px; border-radius: 8px; cursor: pointer;
  `
  button.addEventListener('click', shareToFacebook)
  container.appendChild(button)
}

// FORCE GLOBAL ASSIGNMENT - THIS WILL WORK
setTimeout(() => {
  console.log('🔧 FORCING global function assignment...')
  
  // Force assign ALL functions to window
  window.shareToFacebook = shareToFacebook
  window.generateFacebookPostText = generateFacebookPostText
  window.shareToFacebookMultipleMethods = shareToFacebookMultipleMethods
  window.shareViaFacebookShareDialog = shareViaFacebookShareDialog
  window.shareViaFacebookWebIntent = shareViaFacebookWebIntent
  window.downloadImageForManualSharing = downloadImageForManualSharing
  window.showFacebookSharingInstructions = showFacebookSharingInstructions
  window.addFacebookShareButton = addFacebookShareButton
  window.initializeFacebookSharing = initializeFacebookSharing
  window.shareViaSecureAPI = shareViaSecureAPI
  window.showEnhancedSharingModal = showEnhancedSharingModal
  window.blobToBase64 = blobToBase64
  window.showGraphAPISuccessModal = showGraphAPISuccessModal
  window.testAPIConnection = testAPIConnection
  window.generateCurrentImage = generateCurrentImage
  window.getCurrentFormData = getCurrentFormData
  window.getCurrentPlatform = getCurrentPlatform
  window.getCurrentTemplate = getCurrentTemplate
  window.shareViaSimpleFacebookShare = shareViaSimpleFacebookShare
  window.showToast = showToast

  console.log('✅ ALL FUNCTIONS FORCED TO GLOBAL SCOPE')
  console.log('shareToFacebook type:', typeof window.shareToFacebook)
  
  // Test it
  if (typeof window.shareToFacebook === 'function') {
    console.log('🎉 SUCCESS! shareToFacebook is now available!')
  } else {
    console.error('❌ STILL FAILED!')
  }
}, 100)

// Also assign immediately
window.shareToFacebook = shareToFacebook
window.showToast = showToast
window.generateCurrentImage = generateCurrentImage
window.getCurrentFormData = getCurrentFormData

console.log('🚀 Facebook sharing module loaded!')
console.log('shareToFacebook available:', typeof shareToFacebook)
