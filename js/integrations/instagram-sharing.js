async function shareToInstagram() {
  try {
    const canvas = document.getElementById('canvas')
    if (!canvas) throw new Error('No canvas found')

    showToast('📸 Capturando imagen...', 'info')

    const imageDataUrl = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    }).then((canvas) => canvas.toDataURL('image/png', 0.9))

    const title = document.getElementById('title')?.value || ''
    const excerpt = document.getElementById('excerpt')?.value || ''
    const caption = `${title}\n\n${excerpt}\n\n#RDVNoticias #RadioDelVolga`

    showToast('📤 Compartiendo en Instagram...', 'info')

    const response = await fetch('/.netlify/functions/instagram-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBlob: imageDataUrl,
        caption: caption,
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      showToast('✅ ¡Compartido en Instagram exitosamente!', 'success')
    } else {
      throw new Error(result.error || result.details || 'Error desconocido')
    }
  } catch (error) {
    console.error('❌ Instagram sharing error:', error)
    showToast(`❌ Error al compartir: ${error.message}`, 'error')
  }
}

window.shareToInstagramPost = shareToInstagram