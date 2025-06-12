// Instagram Sharing Functions
// filepath: /home/zen/Documents/rdv-image-generator/js/integrations/instagram-sharing.js

async function shareToInstagram(contentType = 'post') {
  const recordId = document.getElementById('recordId')?.value?.trim()

  if (!recordId) {
    showToast(
      '❌ Se requiere un Record ID para compartir en Instagram',
      'error'
    )
    return
  }

  try {
    console.log('📷 Starting Instagram sharing via Netlify Function...')
    console.log('📊 Content type:', contentType)
    showToast(`📷 Iniciando publicación en Instagram ${contentType}...`, 'info')

    // Capture current template as image
    const imageBlob = await captureTemplateAsBlob()
    if (!imageBlob) {
      throw new Error('No se pudo capturar la imagen')
    }

    console.log('📷 Image captured for Instagram')

    // Generate Instagram-specific caption
    const caption = generateInstagramCaption(contentType)
    console.log('📝 Caption generated:', caption.substring(0, 100) + '...')

    console.log('📤 Calling Instagram Netlify function...')

    const response = await fetch('/.netlify/functions/instagram-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBlob: imageBlob,
        caption: caption,
        contentType: contentType, // 'post' or 'story'
        recordId: recordId,
      }),
    })

    console.log('📊 Instagram function response:', {
      status: response.status,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details || 'Error desconocido')
    }

    const result = await response.json()

    if (result.success) {
      showToast(`✅ ¡Publicado en Instagram ${contentType}!`, 'success')
      console.log('✅ Instagram sharing successful:', result)

      // Show additional info if available
      if (result.quality_info) {
        console.log('🎨 Instagram quality info:', result.quality_info)
        showToast(
          `📊 Imagen optimizada: ${result.quality_info.final_size_kb}KB`,
          'info'
        )
      }
    } else {
      throw new Error(result.error || 'Error en la publicación')
    }
  } catch (error) {
    console.error('❌ Instagram sharing error:', error)
    showToast(`❌ Instagram Error: ${error.message}`, 'error')
  }
}

function generateInstagramCaption(contentType) {
  const title = document.getElementById('title')?.value || ''
  const excerpt = document.getElementById('excerpt')?.value || ''
  const tags = document.getElementById('tags')?.value || ''

  // Convert tags to Instagram hashtags
  const hashtags = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ')

  // Different caption styles for posts vs stories
  if (contentType === 'story') {
    // Shorter caption for stories
    return `${title}\n\n${hashtags}\n\n#RDVNoticias #InstagramStory`
  } else {
    // Full caption for posts
    return `${title}\n\n${excerpt}\n\n${hashtags}\n\n#RDV #Noticias #Actualidad #InstagramPost`
  }
}

// Capture template function for Instagram
async function captureTemplateAsBlob() {
  const canvas = document.getElementById('canvas')
  if (!canvas) {
    throw new Error('No se encontró el canvas')
  }

  try {
    // Use html2canvas to capture the template
    const capturedCanvas = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2, // Higher quality for Instagram
      useCORS: true,
      allowTaint: false,
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    })

    return new Promise((resolve) => {
      capturedCanvas.toBlob(
        (blob) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        'image/png',
        0.95
      ) // High quality PNG
    })
  } catch (error) {
    console.error('Error capturing template:', error)
    throw new Error('Error al capturar la imagen del template')
  }
}

// Instagram-specific sharing functions
window.shareToInstagramPost = () => shareToInstagram('post')
window.shareToInstagramStory = () => shareToInstagram('story')

console.log('✅ Instagram sharing module loaded')
