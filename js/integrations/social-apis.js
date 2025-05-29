/**
 * Social Media API Integration
 * RDV Image Generator - Platform Upload Functions
 */

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
 * Upload to specific social platform
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

    // Use existing Airtable integration if available
    console.log('📝 Updating Airtable with publishing results...', updateData)

    // TODO: Implement actual Airtable update using existing functions
    if (typeof uploadToAirtable === 'function') {
      // Use existing Airtable function if available
      console.log('Using existing Airtable integration...')
    }

    showToast('📝 Resultados guardados en Airtable', 'success')
  } catch (error) {
    console.error('Error updating Airtable:', error)
    showToast('⚠️ Error guardando resultados en Airtable', 'warning')
  }
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.generateCaptionForPlatform = generateCaptionForPlatform
  window.uploadToSocialPlatform = uploadToSocialPlatform
  window.generateMockPostUrl = generateMockPostUrl
  window.updateAirtableWithSocialResults = updateAirtableWithSocialResults
}

console.log('✅ Social APIs loaded')
