// Instagram Sharing Functions - Updated to support posts and stories
async function shareToInstagram(contentType = 'post') {
  try {
    const canvas = document.getElementById('canvas')
    if (!canvas) throw new Error('No canvas found')

    showToast(`📸 Capturando imagen para ${contentType}...`, 'info')

    const imageDataUrl = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    }).then((canvas) => canvas.toDataURL('image/png', 0.9))

    const title = document.getElementById('title')?.value || ''
    const excerpt = document.getElementById('excerpt')?.value || ''

    // Different captions for posts vs stories
    let caption
    if (contentType === 'story') {
      caption = `${title}\n\n#RDVNoticias #RadioDelVolga #InstagramStory`
    } else {
      caption = `${title}\n\n${excerpt}\n\n#RDVNoticias #RadioDelVolga #InstagramPost`
    }

    showToast(`📤 Compartiendo en Instagram ${contentType}...`, 'info')

    const response = await fetch('/.netlify/functions/instagram-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBlob: imageDataUrl,
        caption: caption,
        content_type: contentType, // Add this line
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      showToast(
        `✅ ¡Compartido en Instagram ${contentType} exitosamente!`,
        'success'
      )
    } else {
      throw new Error(result.error || result.details || 'Error desconocido')
    }
  } catch (error) {
    console.error('❌ Instagram sharing error:', error)
    showToast(`❌ Error al compartir: ${error.message}`, 'error')
  }
}

// Create separate functions for posts and stories
function shareToInstagramPost() {
  return shareToInstagram('post')
}

function shareToInstagramStory() {
  return shareToInstagram('story')
}

// Make functions globally available
window.shareToInstagramPost = shareToInstagramPost
window.shareToInstagramStory = shareToInstagramStory
window.shareToInstagram = shareToInstagram

console.log('✅ Instagram sharing functions loaded')
