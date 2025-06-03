/**
 * Facebook Sharing Integration for RDV Image Generator
 * Enhanced with Graph API support via secure backend
 * Author: RDV Team
 * Last Updated: 2024
 */

// Configuration for secure API integration
const RDV_API_CONFIG = {
  baseUrl: 'https://your-api-domain.com', // Replace with your actual API URL
  apiKey: 'your-rdv-api-key', // This should be stored securely or provided by user
  endpoints: {
    quickPublish: '/api/social-publishing/quick-publish',
    testConnection: '/api/social-publishing/test/facebook',
    pageInfo: '/api/social-publishing/facebook/page-info',
    platforms: '/api/social-publishing/platforms',
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
 * Test API connection
 */
async function testAPIConnection() {
  try {
    const response = await fetch(
      `${RDV_API_CONFIG.baseUrl}${RDV_API_CONFIG.endpoints.platforms}`,
      {
        headers: {
          'x-api-key': RDV_API_CONFIG.apiKey,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API connection successful:', data)
    } else {
      console.warn('⚠️ API connection failed, using manual mode only')
    }
  } catch (error) {
    console.warn('⚠️ API not available, using manual mode only:', error.message)
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
 * NEW: Share via secure Graph API backend
 */
async function shareViaSecureAPI(content, imageBlob) {
  try {
    console.log('🤖 Using secure Graph API backend...')
    showToast('🤖 Publicando automáticamente...', 'info')

    // Convert blob to base64
    const base64Image = await blobToBase64(imageBlob)

    // Prepare post data
    const postData = {
      platform: 'facebook',
      imageBlob: base64Image,
      caption: generateFacebookPostText(content),
      metadata: {
        title: content.title,
        excerpt: content.excerpt,
        url: content.url || 'https://radiodelvolga.com',
        timestamp: new Date().toISOString(),
      },
    }

    // Call secure API
    showToast('📤 Enviando a API segura...', 'info')
    const response = await fetch(
      `${RDV_API_CONFIG.baseUrl}${RDV_API_CONFIG.endpoints.quickPublish}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': RDV_API_CONFIG.apiKey,
        },
        body: JSON.stringify(postData),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'API request failed')
    }

    if (result.success) {
      showToast('✅ ¡Publicado automáticamente!', 'success')
      showGraphAPISuccessModal(result)
    } else {
      throw new Error(result.error || 'Publishing failed')
    }
  } catch (error) {
    console.error('❌ Secure API failed:', error)
    showToast(`❌ API Error: ${error.message}`, 'error')

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

    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        border: 3px solid #42b883;
      ">
        <div style="
          width: 70px;
          height: 70px;
          background: linear-gradient(45deg, #42b883, #36d975);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          margin: 0 auto 20px auto;
        ">📱</div>
        
        <h3 style="color: #42b883; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
          Método Manual - Facebook
        </h3>
        
        <p style="color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 15px;">
          Elige cómo quieres compartir manualmente:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="shareViaDialog()" style="
            background: #4267B2;
            color: white;
            border: none;
            padding: 16px 20px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🚀</span>
              <span>Abrir Facebook Share Dialog</span>
            </div>
            <span>→</span>
          </button>
          
          <button onclick="shareViaWebIntent()" style="
            background: #4267B2;
            color: white;
            border: none;
            padding: 16px 20px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🌐</span>
              <span>Abrir Facebook en nueva pestaña</span>
            </div>
            <span>→</span>
          </button>
          
          <button onclick="downloadAndCopy()" style="
            background: #1da1f2;
            color: white;
            border: none;
            padding: 16px 20px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">📥</span>
              <span>Descargar imagen + copiar texto</span>
            </div>
            <span>→</span>
          </button>
        </div>
        
        <button onclick="closeModal()" style="
          background: #f0f0f0;
          color: #666;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
        ">Cerrar</button>
      </div>
    `

    document.body.appendChild(modal)

    // Define modal functions
    window.shareViaDialog = function () {
      document.body.removeChild(modal)
      shareViaFacebookShareDialog(facebookPost)
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
      delete window.shareViaDialog
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
 * Share via Facebook Share Dialog (EXISTING FUNCTION)
 */
function shareViaFacebookShareDialog(facebookPost) {
  try {
    console.log('🚀 Opening Facebook Share Dialog...')

    const shareUrl = encodeURIComponent(
      facebookPost.link || 'https://radiodelvolga.com'
    )
    const shareText = encodeURIComponent(facebookPost.message)

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`

    window.open(
      facebookShareUrl,
      'facebook-share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    )

    showToast('🚀 Facebook Share Dialog abierto', 'success')
    showFacebookSharingInstructions(facebookPost)
  } catch (error) {
    console.error('❌ Error opening Facebook Share Dialog:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

/**
 * Share via Facebook web intent (EXISTING FUNCTION)
 */
function shareViaFacebookWebIntent(facebookPost) {
  try {
    console.log('🌐 Opening Facebook web intent...')

    const facebookUrl = 'https://www.facebook.com/'
    window.open(facebookUrl, '_blank')

    showToast('🌐 Facebook abierto en nueva pestaña', 'success')
    showFacebookSharingInstructions(facebookPost)
  } catch (error) {
    console.error('❌ Error opening Facebook web intent:', error)
    showToast(`❌ Error: ${error.message}`, 'error')
  }
}

/**
 * Download image for manual sharing (EXISTING FUNCTION - ENHANCED)
 */
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

/**
 * Show Facebook sharing instructions (EXISTING FUNCTION - ENHANCED)
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
    z-index: 10000;
    max-width: 450px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    border: 3px solid #4267B2;
  `

  modal.innerHTML = `
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
      Instrucciones para Facebook
    </h3>
    
    <div style="text-align: left; margin-bottom: 20px; line-height: 1.5; color: #333;">
      <p><strong>Pasos para publicar:</strong></p>
      <ol style="padding-left: 20px; font-size: 14px;">
        <li>Sube la imagen descargada</li>
        <li>Pega el texto copiado al portapapeles</li>
        <li>Ajusta si es necesario</li>
        <li>¡Publica!</li>
      </ol>
    </div>
    
    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px; max-height: 120px; overflow-y: auto; text-align: left;">
      <strong>Texto copiado:</strong><br>
      ${facebookPost.message.replace(/\n/g, '<br>')}
    </div>
    
    <div style="display: flex; gap: 12px;">
      <button onclick="window.open('https://facebook.com', '_blank')" style="
        flex: 1;
        background: #4267B2;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Ir a Facebook</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        flex: 1;
        background: #f0f0f0;
        color: #666;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Cerrar</button>
    </div>
  `

  document.body.appendChild(modal)

  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }, 30000)
}

/**
 * Add Facebook share button to page (EXISTING FUNCTION)
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
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(66, 103, 178, 0.3);
  `

  button.addEventListener('click', shareToFacebook)

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = '0 6px 16px rgba(66, 103, 178, 0.4)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = '0 4px 12px rgba(66, 103, 178, 0.3)'
  })

  container.appendChild(button)
  console.log('✅ Facebook share button added to', containerId)
}

// Helper functions for getting current form data (these should exist in your main app)
function getCurrentFormData() {
  return {
    title: document.getElementById('title')?.value || 'Título de prueba',
    excerpt:
      document.getElementById('excerpt')?.value || 'Descripción de prueba',
    tags: document.getElementById('tags')?.value || 'facebook,test,rdv',
    source: document.getElementById('source')?.value || 'RDV Noticias',
    author: document.getElementById('author')?.value || 'Redacción RDV',
    category: document.getElementById('category')?.value || 'general',
    url: 'https://radiodelvolga.com',
  }
}

function getCurrentPlatform() {
  return window.RDVImageGenerator?.currentPlatform || 'facebook'
}

function getCurrentTemplate() {
  return window.RDVImageGenerator?.currentTemplate || 'post'
}

/**
 * Generate current image using the existing image-capture module
 * @returns {Promise<Blob>} Generated image blob
 */
async function generateCurrentImage() {
  try {
    console.log('🎨 Generating current image for Facebook sharing...');
    
    // First, try to use your existing generateImage function
    if (typeof window.generateImage === 'function') {
      console.log('📷 Using existing generateImage function...');
      
      // Call your existing generateImage function without auto-download
      const imageBlob = await window.generateImage(false); // false = don't auto-download
      
      if (imageBlob && imageBlob instanceof Blob) {
        console.log('✅ Image generated successfully:', imageBlob.size, 'bytes');
        return imageBlob;
      }
    }
    
    // Second, try to use html2canvas on the main canvas
    if (window.html2canvas) {
      console.log('📷 Using html2canvas fallback...');
      
      const canvas = document.getElementById('canvas');
      if (canvas) {
        const capturedCanvas = await window.html2canvas(canvas, {
          allowTaint: true,
          useCORS: true,
          scale: 1,
          backgroundColor: '#ffffff',
          logging: false,
          width: canvas.offsetWidth,
          height: canvas.offsetHeight
        });
        
        return new Promise((resolve, reject) => {
          capturedCanvas.toBlob((blob) => {
            if (blob) {
              console.log('✅ html2canvas generated image:', blob.size, 'bytes');
              resolve(blob);
            } else {
              reject(new Error('html2canvas failed to generate blob'));
            }
          }, 'image/png', 0.95);
        });
      }
    }
    
    // Third, try direct canvas capture
    const canvas = document.getElementById('canvas');
    if (canvas && typeof canvas.toBlob === 'function') {
      console.log('📷 Using direct canvas capture...');
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Direct canvas captured:', blob.size, 'bytes');
            resolve(blob);
          } else {
            reject(new Error('Direct canvas capture failed'));
          }
        }, 'image/png', 0.95);
    }
    
    // Last resort: Create a simple test image
    console.warn('⚠️ No image generation method available, creating test image...');
    return createTestImage();
    
  } catch (error) {
    console.error('❌ Error generating image:', error);
    console.log('🔄 Falling back to test image...');
    return createTestImage();
  }
}

/**
 * Create a test image as fallback
 * @returns {Promise<Blob>} Test image blob
 */
function createTestImage() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#4267B2');
    gradient.addColorStop(1, '#365899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Facebook Post', 600, 280);
    
    ctx.font = '24px Arial';
    ctx.fillText('Radio del Volga - Imagen de Prueba', 600, 350);
    
    ctx.font = '18px Arial';
    ctx.fillText(new Date().toLocaleString(), 600, 400);
    
    canvas.toBlob((blob) => {
      console.log('📝 Test image created:', blob.size, 'bytes');
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Connect with your existing toast system
 */
function showToast(message, type = 'info') {
  // Try to use your existing toast function
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }
  
  // Try alternative toast function names
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Fallback to console
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${icon} TOAST [${type.toUpperCase()}]: ${message}`);
  
  // Also show a simple alert for important messages
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
}

// Auto-initialize when module is loaded
initializeFacebookSharing()

// Make sure all functions are available globally
// Make sure all functions are available globally - ADD THIS AT THE VERY END
window.shareToFacebook = shareToFacebook;
window.generateFacebookPostText = generateFacebookPostText;
window.shareToFacebookMultipleMethods = shareToFacebookMultipleMethods;
window.shareViaFacebookShareDialog = shareViaFacebookShareDialog;
window.shareViaFacebookWebIntent = shareViaFacebookWebIntent;
window.downloadImageForManualSharing = downloadImageForManualSharing;
window.showFacebookSharingInstructions = showFacebookSharingInstructions;
window.addFacebookShareButton = addFacebookShareButton;
window.initializeFacebookSharing = initializeFacebookSharing;
window.shareViaSecureAPI = shareViaSecureAPI;
window.showEnhancedSharingModal = showEnhancedSharingModal;
window.blobToBase64 = blobToBase64;
window.showGraphAPISuccessModal = showGraphAPISuccessModal;
window.testAPIConnection = testAPIConnection;
window.generateCurrentImage = generateCurrentImage;
window.getCurrentFormData = getCurrentFormData;
window.getCurrentPlatform = getCurrentPlatform;
window.getCurrentTemplate = getCurrentTemplate;


console.log('shareToFacebook available:', typeof window.shareToFacebook === 'function');

console.log('✅ Facebook sharing functions loaded and available globally');

// Export functions for ES6 modules (if needed)
export {
  shareToFacebook,
  generateFacebookPostText,
  shareToFacebookMultipleMethods,
  shareViaFacebookShareDialog,
  shareViaFacebookWebIntent,
  downloadImageForManualSharing,
  showFacebookSharingInstructions,
  addFacebookShareButton,
  initializeFacebookSharing,
  // NEW Graph API functions
  shareViaSecureAPI,
  showEnhancedSharingModal,
  blobToBase64,
  showGraphAPISuccessModal,
  testAPIConnection,
}
