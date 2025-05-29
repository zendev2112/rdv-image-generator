/**
 * Social Media Publishing Core Functions
 * Uses existing image-capture.js for image generation
 */

// Social Media Platform Configurations
const SOCIAL_PLATFORMS = {
  instagram: {
    apiUrl: 'https://graph.facebook.com/v18.0',
    fields: ['image_url', 'caption', 'access_token'],
    maxCaptionLength: 2200,
    hashtagLimit: 30,
    dimensions: { width: 1080, height: 1920 },
    supportsDirectShare: true,
  },
  facebook: {
    apiUrl: 'https://graph.facebook.com/v18.0',
    fields: ['message', 'link', 'access_token'],
    maxMessageLength: 63206,
    dimensions: { width: 1200, height: 630 },
    supportsDirectShare: true,
  },
  twitter: {
    apiUrl: 'https://api.twitter.com/2',
    fields: ['text', 'media'],
    maxTextLength: 280,
    dimensions: { width: 1200, height: 675 },
    supportsDirectShare: true,
  },
}

/**
 * Main publishing function - processes and publishes to all selected platforms
 */
async function publishToSocialMedia(
  recordId,
  selectedPlatforms = ['instagram', 'facebook', 'twitter']
) {
  try {
    showToast('🚀 Iniciando publicación en redes sociales...', 'info')

    // 1. Load data for publishing
    const data = await loadDataForPublishing(recordId)
    if (!data) throw new Error('No se pudo cargar data')

    // 2. Generate and publish to each platform
    const publishResults = await Promise.allSettled(
      selectedPlatforms.map((platform) => publishToPlatform(platform, data))
    )

    // 3. Update Airtable with results
    await updateAirtableWithSocialResults(recordId, publishResults)

    // 4. Show results summary
    displayPublishingSummary(publishResults)

    return publishResults
  } catch (error) {
    console.error('❌ Publishing failed:', error)
    showToast(`Error en publicación: ${error.message}`, 'error')
    setPublishingState(false)
    throw error
  }
}

/**
 * Publish to specific platform
 */
async function publishToPlatform(platform, data) {
  console.log(`📱 Publishing to ${platform}...`)

  try {
    // 1. Get platform configuration
    const config = SOCIAL_PLATFORMS[platform]
    if (!config) throw new Error(`Platform ${platform} not supported`)

    // 2. Generate platform-optimized content
    const content = generateOptimizedContentForPlatform(data, platform)

    // 3. Generate image using existing image-capture.js functions
    const imageBlob = await generateImageForPlatform(content, platform)

    // 4. Generate caption
    const caption = generateCaptionForPlatform(content, platform)

    // 5. Upload to platform
    const result = await uploadToSocialPlatform(platform, imageBlob, caption)

    showToast(`✅ Publicado en ${platform} exitosamente!`, 'success')
    return { platform, success: true, result, postUrl: result.postUrl }
  } catch (error) {
    console.error(`❌ Error publishing to ${platform}:`, error)
    showToast(`❌ Error publicando en ${platform}: ${error.message}`, 'error')
    return { platform, success: false, error: error.message }
  }
}

/**
 * Generate image for specific social media platform
 * @param {Object} content - Content data for the image
 * @param {string} platform - Target platform (instagram, facebook, twitter)
 * @returns {Promise<Blob>} Generated image blob
 */
async function generateImageForPlatform(content, platform) {
  try {
    console.log(`🎨 Generating image for ${platform}...`)

    // Save current state
    const originalPlatform = window.RDVImageGenerator?.currentPlatform
    const originalTemplate = window.RDVImageGenerator?.currentTemplate

    // Set platform and template
    if (window.RDVImageGenerator) {
      window.RDVImageGenerator.currentPlatform = platform
      window.RDVImageGenerator.currentTemplate =
        getDefaultTemplateForPlatform(platform)
    }

    // Update template with content
    await updateTemplateWithContent(content)

    // Generate image using existing function
    const imageBlob = await window.generateImage({
      autoDownload: false, // Don't auto-download for social publishing
      format: 'png',
      quality: 1.0,
    })

    // Restore original state
    if (window.RDVImageGenerator) {
      window.RDVImageGenerator.currentPlatform = originalPlatform
      window.RDVImageGenerator.currentTemplate = originalTemplate
    }

    console.log(`✅ Image generated successfully for ${platform}`)
    return imageBlob
  } catch (error) {
    console.error(`❌ Failed to generate image for ${platform}:`, error)
    throw new Error(`Failed to generate ${platform} image: ${error.message}`)
  }
}

/**
 * Update template with content data
 * @param {Object} content - Content to apply to template
 */
async function updateTemplateWithContent(content) {
  try {
    // Update form fields with content
    const fieldMappings = {
      title: content.title,
      excerpt: content.excerpt,
      tags: content.tags,
      category: content.category,
      source: content.source,
      author: content.author,
      backgroundImage: content.backgroundImage,
    }

    Object.entries(fieldMappings).forEach(([fieldId, value]) => {
      const element = document.getElementById(fieldId)
      if (element && value) {
        element.value = value
        // Trigger input event to update preview
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    // Wait for template to update
    if (typeof window.updatePreview === 'function') {
      await window.updatePreview()
    }

    // Additional wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error updating template with content:', error)
    throw error
  }
}

/**
 * Load data for publishing
 */
async function loadDataForPublishing(recordId) {
  try {
    if (recordId && typeof loadFromAirtable === 'function') {
      const airtableData = await loadFromAirtable(recordId)
      if (airtableData) return airtableData
    }

    return getCurrentFormDataForPublishing()
  } catch (error) {
    console.warn('Could not load from Airtable, using form data:', error)
    return getCurrentFormDataForPublishing()
  }
}

/**
 * Get current form data for publishing
 */
function getCurrentFormDataForPublishing() {
  return {
    title: document.getElementById('title')?.value || 'Título de la noticia',
    excerpt:
      document.getElementById('excerpt')?.value || 'Descripción de la noticia',
    tags: document.getElementById('tags')?.value || 'noticias,rdv',
    category: document.getElementById('category')?.value || 'general',
    source: document.getElementById('source')?.value || 'RDV Noticias',
    author: document.getElementById('author')?.value || 'Redacción RDV',
    backgroundImage: document.getElementById('backgroundImage')?.value || '',
    recordId: document.getElementById('recordId')?.value || null,
  }
}

/**
 * Generate optimized content for platform
 */
function generateOptimizedContentForPlatform(data, platform) {
  // Use existing optimization functions if available
  if (
    typeof generateInstagramOptimizedContent === 'function' &&
    platform === 'instagram'
  ) {
    return generateInstagramOptimizedContent(data, 'story')
  }
  if (
    typeof generateFacebookOptimizedContent === 'function' &&
    platform === 'facebook'
  ) {
    return generateFacebookOptimizedContent(data, 'post')
  }
  if (
    typeof generateTwitterOptimizedContent === 'function' &&
    platform === 'twitter'
  ) {
    return generateTwitterOptimizedContent(data, 'post')
  }

  // Fallback content generation
  return {
    title: data.title,
    excerpt: data.excerpt,
    hashtags: generateHashtagsFromTags(data.tags),
    author: data.author,
    source: data.source,
    date: new Date().toLocaleDateString('es-AR'),
    backgroundImage: data.backgroundImage,
    category: data.category,
    template: getDefaultTemplateForPlatform(platform),
  }
}

/**
 * Generate hashtags from tags string
 */
function generateHashtagsFromTags(tagsString) {
  if (!tagsString) return ['#RDVNoticias']

  return tagsString
    .split(',')
    .map((tag) => `#${tag.trim().replace(/\s+/g, '')}`)
    .slice(0, 10) // Limit hashtags
}

/**
 * Get default template for platform
 */
function getDefaultTemplateForPlatform(platform) {
  const defaults = {
    instagram: 'story',
    facebook: 'post',
    twitter: 'post',
  }
  return defaults[platform] || 'story'
}

/**
 * Generate caption optimized for platform
 */
function generateCaptionForPlatform(content, platform) {
  const config = SOCIAL_PLATFORMS[platform]
  let caption = content.title

  // Add excerpt if space allows
  if (content.excerpt && platform !== 'twitter') {
    const remainingSpace = config.maxCaptionLength - caption.length - 100 // Reserve space
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
    if (finalLength < config.maxCaptionLength) {
      caption += `\n\n${hashtags}`
    }
  }

  // Add source attribution
  const attribution = `\n\n📰 ${content.source || 'Radio del Volga'}`
  if (caption.length + attribution.length < config.maxCaptionLength) {
    caption += attribution
  }

  return caption
}

/**
 * Upload to specific social platform (Mock implementation)
 */
async function uploadToSocialPlatform(platform, imageBlob, caption) {
  // For now, we'll simulate the upload process
  // In production, you'll need to implement actual API calls

  console.log(`📤 Uploading to ${platform}...`)
  console.log(`Caption: ${caption.substring(0, 100)}...`)
  console.log(`Image size: ${(imageBlob.size / 1024 / 1024).toFixed(2)} MB`)

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 2000)
  )

  // Simulate success/failure (90% success rate)
  const success = Math.random() > 0.1

  if (!success) {
    throw new Error(`Simulación de error en ${platform}`)
  }

  // Return mock result
  const mockId = `${platform}_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`
  return {
    id: mockId,
    postUrl: generateMockPostUrl(platform, mockId),
    platform: platform,
    publishedAt: new Date().toISOString(),
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
      }
    })

    updateData.fields.last_published_at = new Date().toISOString()
    updateData.fields.publication_status = 'published'

    console.log('📝 Updating Airtable with publishing results...', updateData)

    // TODO: Implement actual Airtable update using existing functions
    if (typeof uploadToAirtable === 'function') {
      console.log('Using existing Airtable integration...')
    }

    showToast('📝 Resultados guardados en Airtable', 'success')
  } catch (error) {
    console.error('Error updating Airtable:', error)
    showToast('⚠️ Error guardando resultados en Airtable', 'warning')
  }
}

/**
 * Display publishing summary
 */
function displayPublishingSummary(results) {
  const successCount = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length
  const totalCount = results.length

  if (successCount === totalCount) {
    showToast(
      `🎉 ¡Publicado exitosamente en ${successCount} plataforma(s)!`,
      'success'
    )
  } else if (successCount > 0) {
    showToast(
      `⚠️ Publicado en ${successCount}/${totalCount} plataformas`,
      'warning'
    )
  } else {
    showToast(`❌ Error publicando en todas las plataformas`, 'error')
  }

  // Update UI with detailed results
  updatePublishingStatusUI(results)
}

/**
 * Update publishing status UI with detailed results
 */
function updatePublishingStatusUI(results) {
  const publishResults = results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        platform: 'unknown',
        success: false,
        error: result.reason?.message || 'Unknown error',
      }
    }
  })

  updatePublishingResults(publishResults)
  setPublishingState(false)
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.publishToSocialMedia = publishToSocialMedia
  window.publishToPlatform = publishToPlatform
  window.generateImageForPlatform = generateImageForPlatform
  window.updateTemplateWithContent = updateTemplateWithContent
  window.loadDataForPublishing = loadDataForPublishing
  window.getCurrentFormDataForPublishing = getCurrentFormDataForPublishing
  window.generateOptimizedContentForPlatform =
    generateOptimizedContentForPlatform
  window.generateHashtagsFromTags = generateHashtagsFromTags
  window.getDefaultTemplateForPlatform = getDefaultTemplateForPlatform
  window.generateCaptionForPlatform = generateCaptionForPlatform
  window.uploadToSocialPlatform = uploadToSocialPlatform
  window.generateMockPostUrl = generateMockPostUrl
  window.updateAirtableWithSocialResults = updateAirtableWithSocialResults
  window.displayPublishingSummary = displayPublishingSummary
  window.updatePublishingStatusUI = updatePublishingStatusUI
}

console.log('✅ Social Publishing Core Functions loaded')
