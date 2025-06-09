export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const { imageBlob, caption } = JSON.parse(event.body)

    console.log('🚀 Starting Make.com direct Facebook automation...')

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    // ✅ FIXED: Convert base64 to proper format for Facebook
    let imageData = imageBlob

    // If it's a data URL, extract just the base64 part
    if (imageBlob.startsWith('data:image/')) {
      imageData = imageBlob.split(',')[1] // Remove "data:image/png;base64," prefix
    }

    // ✅ Add validation for base64 data
    if (!imageData || imageData.length < 100) {
      throw new Error('Invalid or empty image data')
    }

    // ✅ CHECK IMAGE SIZE AND COMPRESS IF NEEDED
    const imageSizeKB = (imageData.length * 3) / 4 / 1024 // Convert base64 to actual file size
    console.log('📏 Image size:', Math.round(imageSizeKB), 'KB')

    if (imageSizeKB > 800) {
      // If larger than 800KB
      console.log('⚠️ Image too large for Facebook, compressing...')

      // Create canvas to compress image
      const canvas = require('canvas')
      const buffer = Buffer.from(imageData, 'base64')
      const img = new canvas.Image()
      img.src = buffer

      // Create smaller canvas
      const compressedCanvas = canvas.createCanvas(800, 600) // Smaller dimensions
      const ctx = compressedCanvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 800, 600)

      // Get compressed base64
      imageData = compressedCanvas
        .toBuffer('image/jpeg', { quality: 0.7 })
        .toString('base64')

      const newSizeKB = (imageData.length * 3) / 4 / 1024
      console.log('✅ Compressed to:', Math.round(newSizeKB), 'KB')
    }

    // ✅ Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Regex.test(imageData)) {
      throw new Error('Invalid base64 format')
    }

    const makePayload = {
      image_data: imageData,
      caption: caption,
      post_to_facebook: true,
      // ✅ Add metadata for debugging
      image_size: imageData.length,
      image_size_kb: Math.round((imageData.length * 3) / 4 / 1024),
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending to Make.com webhook...')
    console.log('📊 Final image size:', makePayload.image_size_kb, 'KB')
    console.log('📊 Caption:', caption)

    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    })

    console.log('📊 Make.com response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Make.com webhook failed: ${response.status} - ${errorText}`
      )
    }

    const responseText = await response.text()
    console.log('📄 Make.com raw response:', responseText)

    if (responseText.includes('Accepted')) {
      console.log('✅ Make.com accepted webhook successfully!')

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Facebook posting initiated via Make.com',
          platform: 'facebook',
          publishedAt: new Date().toISOString(),
          method: 'make_com_webhook',
          status: 'accepted',
          image_compressed: imageSizeKB > 800,
          final_size_kb: Math.round((imageData.length * 3) / 4 / 1024),
        }),
      }
    } else {
      throw new Error(`Unexpected Make.com response: ${responseText}`)
    }
  } catch (error) {
    console.error('❌ Make.com automation error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Make.com automation failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
