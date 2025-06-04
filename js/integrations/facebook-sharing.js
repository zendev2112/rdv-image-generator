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

// Just add this simple check at the top of shareToFacebook():
if (location.protocol !== 'https:' && !location.hostname.includes('localhost')) {
  console.warn('⚠️ HTTPS required in production')
  return
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
 * FIXED: Simple and reliable Facebook sharing methods
 */
function shareViaSimpleFacebookShare(facebookPost) {
  console.log('🌐 Using simple and reliable Facebook share...')
  
  try {
    // Copy text to clipboard first
    navigator.clipboard.writeText(facebookPost.message).then(() => {
      console.log('📋 Text copied to clipboard')
    }).catch(() => {
      console.log('Clipboard copy failed, will show text to copy')
    })

    // Use Facebook's composer URL directly (more reliable than share.php)
    const facebookUrl = 'https://www.facebook.com/'
    
    // Open Facebook directly
    window.open(facebookUrl, '_blank')
    
    showToast('🌐 Facebook abierto - texto copiado al portapapeles', 'success')
    showFacebookSharingInstructions(facebookPost)
    
  } catch (error) {
    console.error('❌ Error in simple Facebook share:', error)
    
    // Ultimate fallback - just open Facebook
    window.open('https://www.facebook.com/', '_blank')
    showFacebookSharingInstructions(facebookPost)
  }
}

/**
 * FIXED: Download and manual approach (most reliable)
 */
async function downloadImageForManualSharing(facebookPost) {
  try {
    console.log('📥 Starting download and copy process...')

    // Download the image
    const imageUrl = URL.createObjectURL(facebookPost.image)
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `rdv-facebook-post-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(imageUrl)

    // Copy text to clipboard
    try {
      await navigator.clipboard.writeText(facebookPost.message)
      showToast('📥 Imagen descargada y texto copiado al portapapeles', 'success')
    } catch (clipboardError) {
      console.log('Clipboard failed, showing text modal instead')
      showToast('📥 Imagen descargada - copia el texto de la ventana', 'info')
    }

    // Show instructions
    showFacebookSharingInstructions(facebookPost)
    
  } catch (error) {
    console.error('❌ Error in download process:', error)
    showToast(`❌ Error descargando: ${error.message}`, 'error')
  }
}

/**
 * FIXED: Direct Facebook web approach
 */
function shareViaFacebookWebIntent(facebookPost) {
  try {
    console.log('🌐 Opening Facebook directly...')

    // Copy text to clipboard
    navigator.clipboard.writeText(facebookPost.message).then(() => {
      showToast('📋 Texto copiado - pégalo en Facebook', 'success')
    }).catch(() => {
      console.log('Clipboard failed, will show in modal')
    })

    // Open Facebook main page
    window.open('https://www.facebook.com/', '_blank')
    
    // Show instructions
    showFacebookSharingInstructions(facebookPost)
    
  } catch (error) {
    console.error('❌ Error opening Facebook:', error)
    showToast('Error abriendo Facebook', 'error')
  }
}

/**
 * UPDATED: Better sharing modal without problematic dialog
 */
async function shareToFacebookMultipleMethods(facebookPost) {
  try {
    console.log('📱 Showing reliable Facebook sharing options...')

    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
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
        
        <h3 style="color: #4267B2; margin-bottom: 15px; font-size: 24px; font-weight: 700;">
          Compartir en Facebook
        </h3>
        
        <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
          <p style="color: #1565c0; margin: 0; font-size: 13px; line-height: 1.4;">
            💡 <strong>Tip:</strong> Evitamos el Share Dialog problemático de Facebook. 
            Estos métodos son más confiables.
          </p>
        </div>
        
        <p style="color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 15px;">
          Elige el método que prefieras:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="useDownloadMethod()" style="background: #4267B2; color: white; border: none;
                       padding: 18px 20px; border-radius: 12px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;
                       transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px;">📥</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Descargar + Copiar Texto</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Método más confiable</div>
              </div>
            </div>
            <span style="font-size: 18px;">→</span>
          </button>
          
          <button onclick="useDirectMethod()" style="background: #42b883; color: white; border: none;
                       padding: 18px 20px; border-radius: 12px; font-weight: 600; cursor: pointer;
                       font-size: 15px; display: flex; align-items: center; justify-content: space-between;
                       transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px;">🌐</span>
              <div style="text-align: left;">
                <div style="font-size: 16px;">Abrir Facebook Directamente</div>
                <div style="font-size: 12px; opacity: 0.8; font-weight: 400;">Texto copiado automáticamente</div>
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
        
        <div style="margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; 
                    font-size: 11px; color: #666; text-align: left; max-height: 100px; overflow-y: auto;">
          <strong>Vista previa del texto:</strong><br>
          ${facebookPost.message.substring(0, 150)}${facebookPost.message.length > 150 ? '...' : ''}
        </div>
      </div>
    `

    document.body.appendChild(modal)

    window.useDownloadMethod = function () {
      document.body.removeChild(modal)
      downloadImageForManualSharing(facebookPost)
      cleanup()
    }

    window.useDirectMethod = function () {
      document.body.removeChild(modal)
      shareViaFacebookWebIntent(facebookPost)
      cleanup()
    }

    window.closeModal = function () {
      document.body.removeChild(modal)
      cleanup()
    }

    function cleanup() {
      delete window.useDownloadMethod
      delete window.useDirectMethod
      delete window.closeModal
    }

    // Add hover effects
    modal.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'BUTTON' && e.target.onclick) {
        e.target.style.transform = 'translateY(-2px)'
        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
      }
    })

    modal.addEventListener('mouseout', (e) => {
      if (e.target.tagName === 'BUTTON' && e.target.onclick) {
        e.target.style.transform = 'translateY(0)'
        e.target.style.boxShadow = 'none'
      }
    })

  } catch (error) {
    console.error('❌ Error showing sharing modal:', error)
    
    // Emergency fallback
    downloadImageForManualSharing(facebookPost)
  }
}

/**
 * UPDATED: Better instructions modal
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
    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
    z-index: 10001;
    max-width: 480px;
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
      <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 600; color: #2e7d32;">✅ Pasos completados:</p>
        <ul style="margin: 8px 0 0 20px; padding: 0;">
          <li>📥 Imagen descargada a tu dispositivo</li>
          <li>📋 Texto copiado al portapapeles</li>
          <li>🌐 Facebook abierto en nueva pestaña</li>
        </ul>
      </div>
      
      <p><strong>Ahora en Facebook:</strong></p>
      <ol style="padding-left: 20px; font-size: 14px; line-height: 1.5;">
        <li>🖱️ Haz clic en "¿Qué estás pensando?"</li>
        <li>📝 Pega el texto (Ctrl+V)</li>
        <li>📎 Sube la imagen descargada</li>
        <li>🚀 ¡Publica!</li>
      </ol>
    </div>
    
    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; 
                text-align: left; max-height: 150px; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="font-size: 12px; color: #666;">TEXTO PARA PEGAR:</strong>
        <button onclick="copyTextAgain()" style="background: #4267B2; color: white; border: none;
                       padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
          Copiar de nuevo
        </button>
      </div>
      <div style="font-size: 12px; line-height: 1.4; color: #333;">
        ${facebookPost.message.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div style="display: flex; gap: 12px;">
      <button onclick="window.open('https://facebook.com', '_blank')" style="flex: 1; background: #4267B2;
                     color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 600;
                     cursor: pointer; font-size: 14px; display: flex; align-items: center; 
                     justify-content: center; gap: 8px;">
        <span>📘</span>
        <span>Ir a Facebook</span>
      </button>
      
      <button onclick="closeInstructions()" style="flex: 1; background: #f0f0f0; color: #666;
                     border: none; padding: 14px; border-radius: 10px; font-weight: 600;
                     cursor: pointer; font-size: 14px;">
        Cerrar
      </button>
    </div>
  `

  document.body.appendChild(modal)

  // Add copy function
  window.copyTextAgain = function() {
    navigator.clipboard.writeText(facebookPost.message).then(() => {
      showToast('📋 Texto copiado nuevamente', 'success')
    }).catch(() => {
      showToast('❌ Error copiando texto', 'error')
    })
  }

  window.closeInstructions = function() {
    document.body.removeChild(modal)
    delete window.copyTextAgain
    delete window.closeInstructions
  }

  // Auto-close after 45 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
      delete window.copyTextAgain
      delete window.closeInstructions
    }
  }, 45000)
}

// Make sure all functions are available globally
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
window.shareViaSimpleFacebookShare = shareViaSimpleFacebookShare;

console.log('✅ Facebook sharing functions loaded and available globally');
console.log('shareToFacebook available:', typeof window.shareToFacebook === 'function');

// Auto-initialize
initializeFacebookSharing();
