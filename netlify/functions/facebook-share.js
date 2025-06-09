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

    // ✅ QUALITY FIRST: No compression to maintain image quality
    let processedImageData = imageData
    console.log('🎨 Preserving original image quality (no compression)')

    if (imageSizeKB > 1000) {
      console.log('⚠️ Large image detected:', Math.round(imageSizeKB), 'KB')
      console.log(
        '💡 Large images may take longer to upload but quality will be preserved'
      )
    }

    // ✅ USE SIMPLE JSON UPLOAD
    console.log('📤 Uploading to Cloudinary with JSON...')

    const cloudinaryPayload = {
      file: `data:image/png;base64,${processedImageData}`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'rdv-news',
      public_id: `rdv-hq-${Date.now()}`,
      tags: 'rdv-news,facebook,ultra-high-quality',
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Uploading to:', cloudinaryUrl)

    // ✅ Longer timeout for high-quality uploads
    const uploadTimeout = 15000 // 15 seconds for quality uploads
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

    console.log('⏱️ Starting high-quality upload with 15s timeout...')
    const cloudinaryUpload = await Promise.race([uploadPromise, timeoutPromise])

    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error:', errorText)

      return {
        statusCode: 422,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'High-quality image upload failed',
          details: `Cloudinary error: ${errorText}`,
          platform: 'facebook',
          cloudinary_status: 'failed',
          original_size_kb: Math.round(imageSizeKB),
          timestamp: new Date().toISOString(),
        }),
      }
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 High-quality Cloudinary upload successful!')
    console.log('🔗 URL:', cloudinaryResult.secure_url)

    // ✅ Detailed quality analysis
    const finalSizeKB = Math.round(cloudinaryResult.bytes / 1024)
    console.log('🎨 QUALITY ANALYSIS:', {
      original_size_kb: Math.round(imageSizeKB),
      final_size_kb: finalSizeKB,
      dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      format: cloudinaryResult.format,
      quality_preserved: finalSizeKB >= Math.round(imageSizeKB * 0.7), // 70% retention is good
      cloudinary_optimizations: 'Applied via upload preset',
    })

    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_facebook: true,
      high_quality: true,
      original_size_kb: Math.round(imageSizeKB),
      final_size_kb: finalSizeKB,
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending high-quality image to Make.com...')
    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'

    // ✅ Debug Make.com connection
    console.log('🔍 Make.com webhook details:', {
      url: MAKE_WEBHOOK_URL,
      payload_size: JSON.stringify(makePayload).length,
      image_url: makePayload.image_url.substring(0, 100) + '...',
      has_caption: !!makePayload.caption,
    })

    const webhookPromise = fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RDV-Image-Generator/1.0',
      },
      body: JSON.stringify(makePayload),
    })

    const webhookTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Make.com timeout')), 8000)
    )

    try {
      const response = await Promise.race([
        webhookPromise,
        webhookTimeoutPromise,
      ])

      console.log('📊 Make.com response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      const responseText = await response.text()
      console.log('📄 Make.com response text:', responseText)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'High-quality image posted to Facebook via Make.com',
          platform: 'facebook',
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: response.ok ? 'success' : 'failed',
          quality_info: {
            original_size_kb: Math.round(imageSizeKB),
            final_size_kb: finalSizeKB,
            dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
            format: cloudinaryResult.format,
            quality_level: 'high',
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
          message:
            'High-quality image uploaded to Cloudinary (Make.com timeout)',
          platform: 'facebook',
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: 'timeout',
          quality_info: {
            final_size_kb: finalSizeKB,
            dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
            format: cloudinaryResult.format,
          },
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
          error: 'High-quality upload timeout',
          details: 'Large high-quality image took too long to upload',
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
