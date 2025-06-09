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

    // ✅ COMPRESS IMAGE: Reduce size if too large
    let processedImageData = imageData
    if (imageSizeKB > 500) {
      console.log('🔧 Image too large, applying compression...')

      // Simple compression by reducing quality of base64
      // Remove padding and re-encode with compression
      const buffer = Buffer.from(imageData, 'base64')

      // Reduce buffer size by sampling (simple compression)
      const compressionRatio = Math.min(0.7, 500 / imageSizeKB)
      const targetSize = Math.floor(buffer.length * compressionRatio)

      // Create compressed buffer by sampling
      const compressedBuffer = Buffer.alloc(targetSize)
      for (let i = 0; i < targetSize; i++) {
        const sourceIndex = Math.floor((i / targetSize) * buffer.length)
        compressedBuffer[i] = buffer[sourceIndex]
      }

      processedImageData = compressedBuffer.toString('base64')
      const newSizeKB = (processedImageData.length * 3) / 4 / 1024
      console.log('📉 Compressed image size:', Math.round(newSizeKB), 'KB')
    }

    // ✅ SIMPLIFIED: Use form-urlencoded upload (faster than JSON for large data)
    console.log('📤 Uploading to Cloudinary with form data...')

    const formParams = new URLSearchParams()
    formParams.append('file', `data:image/png;base64,${processedImageData}`)
    formParams.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)
    formParams.append('folder', 'rdv-news')
    formParams.append('public_id', `rdv-hq-${Date.now()}`)
    formParams.append('tags', 'rdv-news,facebook')

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Cloudinary URL:', cloudinaryUrl)

    // ✅ Increase timeout for large uploads
    const uploadTimeout = 15000 // 15 seconds max
    const uploadPromise = fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Cloudinary upload timeout')),
        uploadTimeout
      )
    )

    console.log('⏱️ Starting upload with 15s timeout...')
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
    const finalSizeKB = Math.round(cloudinaryResult.bytes / 1024)
    console.log('🔍 QUALITY ANALYSIS:', {
      original_size_kb: Math.round(imageSizeKB),
      cloudinary_size_kb: finalSizeKB,
      dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      format: cloudinaryResult.format,
    })

    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_facebook: true,
      original_size_kb: Math.round(imageSizeKB),
      optimized_size_kb: finalSizeKB,
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      image_format: cloudinaryResult.format,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending to Make.com webhook...')
    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'

    // ✅ Quick webhook call with short timeout
    const webhookTimeout = 5000 // 5 seconds max
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

    try {
      const response = await Promise.race([
        webhookPromise,
        webhookTimeoutPromise,
      ])

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
      }

      // ✅ Return success regardless of Make.com response
      const successResponse = {
        success: true,
        message: 'Image uploaded to Cloudinary and sent to Make.com',
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        cloudinary_url: cloudinaryResult.secure_url,
        make_com_status: response.ok ? 'success' : 'failed',
        make_com_response: responseText,
        image_quality: {
          dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
          format: cloudinaryResult.format,
          final_size_kb: finalSizeKB,
        },
      }

      console.log('🎉 Success response:', successResponse)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(successResponse),
      }
    } catch (webhookError) {
      console.error('❌ Make.com webhook timeout/error:', webhookError.message)

      // ✅ Still return success since Cloudinary worked
      const partialSuccessResponse = {
        success: true,
        message: 'Image uploaded to Cloudinary (Make.com webhook failed)',
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        cloudinary_url: cloudinaryResult.secure_url,
        make_com_status: 'timeout',
        make_com_error: webhookError.message,
        image_quality: {
          dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
          format: cloudinaryResult.format,
          final_size_kb: finalSizeKB,
        },
      }

      console.log('⚠️ Partial success response:', partialSuccessResponse)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialSuccessResponse),
      }
    }
  } catch (error) {
    console.error('❌ Function error:', error.message)

    // ✅ Handle different error types
    if (error.message.includes('timeout')) {
      console.log('⚠️ Upload timeout occurred...')
      return {
        statusCode: 408, // Request Timeout
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Upload timeout',
          details: 'Image upload took too long. Try with a smaller image.',
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
