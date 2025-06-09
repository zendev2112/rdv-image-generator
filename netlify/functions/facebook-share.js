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
      imageData = imageBlob.split(',')[1]
    }

    if (!imageData || imageData.length < 100) {
      throw new Error('Invalid or empty image data')
    }

    const imageSizeKB = (imageData.length * 3) / 4 / 1024
    console.log('📏 Original image size:', Math.round(imageSizeKB), 'KB')

    // ✅ OPTIMIZED: Use JSON upload instead of multipart (faster)
    console.log('📤 Uploading to Cloudinary with JSON payload...')

    const cloudinaryPayload = {
      file: `data:image/png;base64,${imageData}`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'rdv-news',
      public_id: `rdv-hq-${Date.now()}`,
      tags: 'rdv-news,facebook,high-quality',
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Cloudinary URL:', cloudinaryUrl)

    // ✅ Add timeout to prevent hanging
    const uploadTimeout = 8000 // 8 seconds max
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

    console.log('⏱️ Starting upload with timeout...')
    const cloudinaryUpload = await Promise.race([uploadPromise, timeoutPromise])

    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error:', errorText)
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 Cloudinary upload successful!')
    console.log('🔗 Cloudinary URL:', cloudinaryResult.secure_url)

    // ✅ Quality analysis
    console.log('🔍 QUALITY ANALYSIS:', {
      original_size_kb: Math.round(imageSizeKB),
      cloudinary_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      format: cloudinaryResult.format,
    })

    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_facebook: true,
      original_size_kb: Math.round(imageSizeKB),
      optimized_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      image_format: cloudinaryResult.format,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending to Make.com webhook...')
    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'

    // ✅ Add timeout for Make.com webhook
    const webhookTimeout = 3000 // 3 seconds max
    const webhookPromise = fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    })

    const webhookTimeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Make.com webhook timeout')),
        webhookTimeout
      )
    )

    const response = await Promise.race([webhookPromise, webhookTimeoutPromise])

    console.log('📊 Make.com response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    })

    let responseText = ''
    try {
      responseText = await response.text()
      console.log('📄 Make.com response:', responseText)
    } catch (textError) {
      console.error('❌ Error reading response:', textError.message)
    }

    if (!response.ok) {
      console.error(
        '❌ Make.com webhook failed:',
        response.status,
        responseText
      )
      // ✅ Don't throw error - still return success since Cloudinary worked
      console.log('⚠️ Continuing despite Make.com error...')
    }

    // ✅ Return success regardless of Make.com response
    const successResponse = {
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      platform: 'facebook',
      publishedAt: new Date().toISOString(),
      cloudinary_url: cloudinaryResult.secure_url,
      make_com_status: response.ok ? 'success' : 'failed',
      make_com_response: responseText,
      image_quality: {
        dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
        format: cloudinaryResult.format,
        final_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      },
    }

    console.log('🎉 Success response:', successResponse)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(successResponse),
    }
  } catch (error) {
    console.error('❌ Function error:', error.message)

    // ✅ If it's a timeout, try to continue gracefully
    if (error.message.includes('timeout')) {
      console.log('⚠️ Timeout occurred, returning partial success...')
      return {
        statusCode: 202, // Accepted but processing incomplete
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Processing timeout',
          details: error.message,
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
