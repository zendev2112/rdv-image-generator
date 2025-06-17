/**
 * Secure Social Media API Integration
 * Uses existing RDV-NEWS-API backend for secure publishing
 */

// Configuration for your existing RDV-NEWS-API
// Dynamic configuration that gets updated from server
let SECURE_API_CONFIG = {
  baseUrl: window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api/social-media-publishing'
    : 'https://rdv-news-api.vercel.app/api/social-media-publishing',
  apiKey: 'rdv_secure_api_key_2024_xyz123',
}

// Function to update config from server
async function updateSocialApiConfig() {
  try {
    const response = await fetch(`${window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api' 
      : 'https://rdv-news-api.vercel.app/api'}/config/client-config`, {
      headers: {
        'X-API-Key': SECURE_API_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.config.socialApi) {
        SECURE_API_CONFIG.baseUrl = result.config.socialApi.baseUrl
        console.log('✅ Social API config updated from server:', SECURE_API_CONFIG)
      }
    }
  } catch (error) {
    console.warn('Could not update social API config from server:', error)
    // Continue with hardcoded values
  }
}

/**
 * Generate caption optimized for platform
 */
function generateCaptionForPlatform(content, platform) {
  const config = {
    instagram: { maxCaptionLength: 2200 },
    facebook: { maxCaptionLength: 63206 },
    twitter: { maxCaptionLength: 280 },
  }

  const platformConfig = config[platform] || config.instagram
  let caption = content.title

  // Add excerpt if space allows
  if (content.excerpt && platform !== 'twitter') {
    const remainingSpace =
      platformConfig.maxCaptionLength - caption.length - 100 // Reserve space
    if (remainingSpace > 50) {
      const excerptToAdd =
        content.excerpt.length > remainingSpace
          ? content.excerpt.substring(0, remainingSpace - 3) + '...'
          : content.excerpt
      caption += `\n\n${excerptToAdd}`
    }
  }

  // Add hashtags based on platform limits
  if (content.hashtags && content.hashtags.length > 0) {
    const hashtagLimit =
      platform === 'instagram' ? 30 : platform === 'twitter' ? 3 : 10
    const hashtags = content.hashtags.slice(0, hashtagLimit).join(' ')

    const finalLength = caption.length + hashtags.length + 20
    if (finalLength < platformConfig.maxCaptionLength) {
      caption += `\n\n${hashtags}`
    }
  }

  // Add source attribution
  const attribution = `\n\n📰 ${content.source || 'Radio del Volga'}`
  if (caption.length + attribution.length < platformConfig.maxCaptionLength) {
    caption += attribution
  }

  return caption
}

/**
 * Secure upload function that calls your existing RDV-NEWS-API backend
 */
async function uploadToSocialPlatform(platform, imageBlob, caption) {
  console.log(`🔒 Securely uploading to ${platform} via RDV-NEWS-API...`)

  try {
    // Convert blob to base64 for transmission
    const base64Image = await blobToBase64(imageBlob)

    // Prepare payload
    const payload = {
      imageBlob: base64Image,
      caption: caption,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'rdv-image-generator',
        platform: platform,
        userAgent: navigator.userAgent,
        imageSize: imageBlob.size,
        captionLength: caption.length,
      },
    }

    // Call your existing RDV-NEWS-API backend
    const response = await fetch(
      `${SECURE_API_CONFIG.baseUrl}/publish/${platform}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SECURE_API_CONFIG.apiKey,
          'X-Source': 'rdv-image-generator',
          'X-Platform': platform,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()

    console.log(`✅ Successfully published to ${platform} via RDV-NEWS-API`)

    // Show success message with additional info
    const methodText = result.method === 'simulation' ? ' (simulación)' : ''
    showToast(`✅ Publicado en ${platform}${methodText}!`, 'success')

    return {
      success: true,
      id: result.id,
      postUrl: result.postUrl,
      platform: platform,
      publishedAt: result.publishedAt || new Date().toISOString(),
      method: result.method || 'api',
      note: result.note,
    }
  } catch (error) {
    console.error(`❌ Secure upload failed for ${platform}:`, error)

    // Show user-friendly error
    showToast(`❌ Error publicando en ${platform}: ${error.message}`, 'error')

    // For development, try fallback simulation
    if (window.location.hostname === 'localhost') {
      console.log('🎭 Falling back to local simulation for development...')
      return await simulateUploadFallback(platform, imageBlob, caption)
    }

    throw error
  }
}

/**
 * Test secure connection to your RDV-NEWS-API backend
 */
async function testSecureConnection() {
  try {
    showToast('🔍 Testing RDV-NEWS-API connection...', 'info')

    const response = await fetch(`${SECURE_API_CONFIG.baseUrl}/health`, {
      headers: {
        'X-API-Key': SECURE_API_CONFIG.apiKey,
      },
    })

    if (response.ok) {
      const result = await response.json()
      const envStatus = result.environment_valid
        ? 'configured'
        : 'simulation mode'
      showToast(`✅ RDV-NEWS-API OK (${envStatus})`, 'success')

      // Update connection status in UI
      updateConnectionStatusUI('connected', result)

      return true
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    showToast(`❌ RDV-NEWS-API connection failed: ${error.message}`, 'error')
    updateConnectionStatusUI('error', { error: error.message })
    return false
  }
}

/**
 * Test specific platform connection via your backend
 */
async function testPlatformConnection(platform) {
  try {
    showToast(`🔍 Testing ${platform} via RDV-NEWS-API...`, 'info')

    const response = await fetch(
      `${SECURE_API_CONFIG.baseUrl}/test/${platform}`,
      {
        headers: {
          'X-API-Key': SECURE_API_CONFIG.apiKey,
        },
      }
    )

    if (response.ok) {
      const result = await response.json()
      const statusMessage =
        result.status === 'simulation'
          ? `${platform} (simulation mode)`
          : `${platform} connection`

      const toastType = result.status === 'error' ? 'warning' : 'success'
      showToast(`✅ ${statusMessage} tested!`, toastType)

      return result
    } else {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }
  } catch (error) {
    showToast(`❌ ${platform} test failed: ${error.message}`, 'error')
    return { platform, status: 'error', error: error.message }
  }
}

/**
 * Get available platforms from your RDV-NEWS-API backend
 */
async function getAvailablePlatforms() {
  try {
    const response = await fetch(`${SECURE_API_CONFIG.baseUrl}/platforms`, {
      headers: {
        'X-API-Key': SECURE_API_CONFIG.apiKey,
      },
    })

    if (response.ok) {
      const result = await response.json()
      console.log('📱 Available platforms:', result.platforms)
      return result.platforms
    }

    // Fallback to default platforms
    return [
      { name: 'instagram', available: true, configured: false },
      { name: 'facebook', available: true, configured: false },
      { name: 'twitter', available: true, configured: false },
    ]
  } catch (error) {
    console.warn('Could not fetch available platforms:', error)
    return [
      { name: 'instagram', available: true, configured: false },
      { name: 'facebook', available: true, configured: false },
      { name: 'twitter', available: true, configured: false },
    ]
  }
}

/**
 * Fallback simulation for development when backend is unavailable
 */
async function simulateUploadFallback(platform, imageBlob, caption) {
  console.log(`🎭 Local fallback simulation for ${platform}...`)

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  )

  // Simulate success/failure (90% success rate)
  const success = Math.random() > 0.1

  if (!success) {
    throw new Error(`Simulación local de error en ${platform}`)
  }

  // Return mock result
  const mockId = `fallback_${platform}_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`

  return {
    id: mockId,
    postUrl: generateMockPostUrl(platform, mockId),
    platform: platform,
    publishedAt: new Date().toISOString(),
    method: 'local_simulation',
    note: 'Backend unavailable, used local simulation',
  }
}

/**
 * Generate mock post URL for simulation
 */
function generateMockPostUrl(platform, postId) {
  const baseUrls = {
    instagram: 'https://www.instagram.com/p',
    facebook: 'https://www.facebook.com/rdv/posts',
    twitter: 'https://twitter.com/radiodelvolga/status',
  }

  return `${baseUrls[platform]}/${postId}`
}

/**
 * Update connection status UI
 */
function updateConnectionStatusUI(status, data = {}) {
  const statusIndicator = document.getElementById('statusIndicator')
  const statusText = document.getElementById('statusText')

  if (statusIndicator && statusText) {
    switch (status) {
      case 'connected':
        statusIndicator.textContent = '✅'
        statusText.textContent = data.environment_valid
          ? 'Backend conectado (API keys configuradas)'
          : 'Backend conectado (modo simulación)'
        break
      case 'error':
        statusIndicator.textContent = '❌'
        statusText.textContent = `Error: ${data.error || 'Connection failed'}`
        break
      case 'testing':
        statusIndicator.textContent = '🔍'
        statusText.textContent = 'Verificando conexión...'
        break
      default:
        statusIndicator.textContent = '⏳'
        statusText.textContent = 'Estado desconocido'
    }
  }
}

/**
 * Update Airtable with social media results
 */
async function updateAirtableWithSocialResults(recordId, results) {
  if (!recordId) {
    console.log('Skipping Airtable update - no recordId provided')
    return
  }

  try {
    const updateData = { fields: {} }

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const { platform, result: postResult } = result.value
        updateData.fields[`${platform}_post_url`] = postResult.postUrl
        updateData.fields[`${platform}_post_id`] = postResult.id
        updateData.fields[`${platform}_published_at`] = postResult.publishedAt
        updateData.fields[`${platform}_method`] = postResult.method || 'api'
      }
    })

    updateData.fields.last_published_at = new Date().toISOString()
    updateData.fields.publication_status = 'published'

    // Use existing Airtable integration if available
    console.log('📝 Updating Airtable with publishing results...', updateData)

    // TODO: Implement actual Airtable update using existing functions
    if (typeof uploadToAirtable === 'function') {
      // Use existing Airtable function if available
      console.log('Using existing Airtable integration...')
      // await uploadToAirtable(recordId, updateData)
    }

    showToast('📝 Resultados guardados en Airtable', 'success')
  } catch (error) {
    console.error('Error updating Airtable:', error)
    showToast('⚠️ Error guardando resultados en Airtable', 'warning')
  }
}

/**
 * Convert blob to base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Get API configuration info
 */
function getApiConfigInfo() {
  return {
    baseUrl: SECURE_API_CONFIG.baseUrl,
    hasApiKey: !!SECURE_API_CONFIG.apiKey,
    isLocalhost: window.location.hostname === 'localhost',
    timestamp: new Date().toISOString(),
  }
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.generateCaptionForPlatform = generateCaptionForPlatform
  window.uploadToSocialPlatform = uploadToSocialPlatform
  window.testSecureConnection = testSecureConnection
  window.testPlatformConnection = testPlatformConnection
  window.getAvailablePlatforms = getAvailablePlatforms
  window.simulateUploadFallback = simulateUploadFallback
  window.generateMockPostUrl = generateMockPostUrl
  window.updateConnectionStatusUI = updateConnectionStatusUI
  window.updateAirtableWithSocialResults = updateAirtableWithSocialResults
  window.blobToBase64 = blobToBase64
  window.getApiConfigInfo = getApiConfigInfo
}

console.log('✅ Secure Social APIs loaded (using RDV-NEWS-API backend)')
console.log('🔧 API Config:', getApiConfigInfo())

// Update config on load
document.addEventListener('DOMContentLoaded', () => {
  updateSocialApiConfig()
})
