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
 * Enhanced Facebook sharing - PRIORITIZING DIRECT AUTOMATIC SHARING
 */
async function shareToFacebookMultipleMethods(facebookPost) {
  try {
    console.log('📱 Showing Facebook sharing options - prioritizing automatic...')

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
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          
          <!-- DIRECT AUTOMATIC SHARING - MAIN GOAL -->
          <button onclick="shareDirectly()" style="background: linear-gradient(45deg, #4267B2, #365899); color: white; border: none;
                       padding: 20px 24px; border-radius: 12px; font-weight: 700; cursor: pointer;
                       font-size: 16px; display: flex; align-items: center; justify-content: space-between;
                       box-shadow: 0 4px 12px rgba(66, 103, 178, 0.3);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">🤖</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Publicar Automáticamente</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Un click y listo - Graph API</div>
              </div>
            </div>
            <span style="font-size: 18px;">🚀</span>
          </button>
          
          <!-- FALLBACK: Download + Copy -->
          <button onclick="downloadAndCopy()" style="background: #42b883; color: white; border: none;
                       padding: 18px 20px; border-radius: 12px; font-weight: 600; cursor: pointer;
                       font-size: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px;">📥</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Descargar imagen + copiar texto</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Si falla el automático</div>
              </div>
            </div>
            <span style="font-size: 18px;">→</span>
          </button>
          
          <!-- FALLBACK: Copy text only -->
          <button onclick="copyTextOnly()" style="background: #f39c12; color: white; border: none;
                       padding: 18px 20px; border-radius: 12px; font-weight: 600; cursor: pointer;
                       font-size: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px;">📋</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Solo copiar texto</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Sin imagen</div>
              </div>
            </div>
            <span style="font-size: 18px;">→</span>
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

    // MODAL FUNCTIONS - PRIORITIZING DIRECT SHARING
    window.shareDirectly = function () {
      document.body.removeChild(modal)
      // Call the Graph API direct sharing method
      const content = getCurrentFormData()
      shareViaSecureAPI(content, facebookPost.image)
      cleanupModalFunctions()
    }

    window.downloadAndCopy = function () {
      document.body.removeChild(modal)
      downloadImageForManualSharing(facebookPost)
      cleanupModalFunctions()
    }

    window.copyTextOnly = function () {
      document.body.removeChild(modal)
      copyTextAndOpenFacebook(facebookPost)
      cleanupModalFunctions()
    }

    window.closeModal = function () {
      document.body.removeChild(modal)
      cleanupModalFunctions()
    }

    function cleanupModalFunctions() {
      delete window.shareDirectly
      delete window.downloadAndCopy
      delete window.copyTextOnly
      delete window.closeModal
    }
  } catch (error) {
    console.error('❌ Error in sharing modal:', error)
    // Fallback to direct API method
    const content = getCurrentFormData()
    shareViaSecureAPI(content, facebookPost.image)
  }
}

// GLOBAL ASSIGNMENTS - ADD AT THE VERY END
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
window.copyTextAndOpenFacebook = copyTextAndOpenFacebook
window.showSimpleFacebookInstructions = showSimpleFacebookInstructions
window.showToast = showToast

console.log('✅ Facebook sharing functions loaded and available globally')
console.log('shareToFacebook available:', typeof window.shareToFacebook === 'function')
