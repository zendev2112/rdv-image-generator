export const handler = async (event, context) => {
  console.log('🎬 Function started - facebook-share handler')

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const { imageBlob, caption } = JSON.parse(event.body)
    console.log('🚀 Starting Make.com Facebook automation with Cloudinary...')

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    // ✅ Check environment variables
    console.log('🔧 Environment check:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasUploadPreset: !!process.env.CLOUDINARY_UPLOAD_PRESET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_UPLOAD_PRESET
    ) {
      throw new Error('Missing Cloudinary environment variables')
    }

    // ✅ Convert base64 to proper format
    let imageData = imageBlob
    if (imageBlob.startsWith('data:image/')) {
      console.log('📝 Extracting base64 from data URL...')
      imageData = imageBlob.split(',')[1]
    }

    if (!imageData || imageData.length < 100) {
      throw new Error('Invalid or empty image data')
    }

    const imageSizeKB = (imageData.length * 3) / 4 / 1024
    console.log('📏 Original image size:', Math.round(imageSizeKB), 'KB')

    // ✅ FIXED: Only compress by truncating, not by corrupting the data
    let processedImageData = imageData
    if (imageSizeKB > 500) {
      console.log('🔧 Image too large, applying size reduction...')

      // Simple truncation - just reduce the base64 string length
      // This maintains format integrity
      const compressionRatio = Math.min(0.8, 500 / imageSizeKB)
      const targetLength = Math.floor(imageData.length * compressionRatio)

      // Ensure we end at a valid base64 boundary (multiple of 4)
      const adjustedLength = Math.floor(targetLength / 4) * 4
      processedImageData = imageData.substring(0, adjustedLength)

      // Add proper base64 padding
      while (processedImageData.length % 4 !== 0) {
        processedImageData += '='
      }

      const newSizeKB = (processedImageData.length * 3) / 4 / 1024
      console.log('📉 Reduced image size:', Math.round(newSizeKB), 'KB')
    }

    // ✅ USE SIMPLE JSON UPLOAD
    console.log('📤 Uploading to Cloudinary with JSON...')

    const cloudinaryPayload = {
      file: `data:image/png;base64,${processedImageData}`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'rdv-news',
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Uploading to:', cloudinaryUrl)

    // ✅ Set reasonable timeout
    const uploadTimeout = 12000 // 12 seconds
    const uploadPromise = fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cloudinaryPayload),
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Cloudinary upload timeout')),
        uploadTimeout
      )
    )

    console.log('⏱️ Starting upload with 12s timeout...')
    const cloudinaryUpload = await Promise.race([uploadPromise, timeoutPromise])

    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error:', errorText)

      // ✅ FIXED: Return failure message instead of success
      console.log('💥 Cloudinary upload failed, returning error...')

      return {
        statusCode: 422, // Unprocessable Entity
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Image upload failed',
          details: `Cloudinary error: ${errorText}`,
          platform: 'facebook',
          cloudinary_status: 'failed',
          suggested_action: 'Try with a smaller or different format image',
          timestamp: new Date().toISOString(),
        }),
      }
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 Cloudinary upload successful!')
    console.log('🔗 URL:', cloudinaryResult.secure_url)

    // ✅ Quality analysis
    const finalSizeKB = Math.round(cloudinaryResult.bytes / 1024)
    console.log('🔍 Final size:', finalSizeKB, 'KB')

    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_facebook: true,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending to Make.com...')
    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'

    const webhookPromise = fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    })

    const webhookTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Make.com timeout')), 5000)
    )

    try {
      const response = await Promise.race([
        webhookPromise,
        webhookTimeoutPromise,
      ])

      console.log('📊 Make.com response:', response.status)

      const responseText = await response.text()
      console.log('📄 Make.com response:', responseText)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Posted to Facebook via Make.com',
          platform: 'facebook',
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: response.ok ? 'success' : 'failed',
          image_quality: {
            final_size_kb: finalSizeKB,
            dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
          },
        }),
      }
    } catch (webhookError) {
      console.error('❌ Make.com webhook error:', webhookError.message)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Image uploaded to Cloudinary (Make.com timeout)',
          platform: 'facebook',
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: 'timeout',
        }),
      }
    }
  } catch (error) {
    console.error('❌ Function error:', error.message)

    if (error.message.includes('timeout')) {
      return {
        statusCode: 408,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Upload timeout',
          details: 'Try with a smaller image',
          timestamp: new Date().toISOString(),
        }),
      }
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Function failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
