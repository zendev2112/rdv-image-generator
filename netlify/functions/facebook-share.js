export const handler = async (event, context) => {
  console.log('🎬 Function started - facebook-share handler')
  console.log('📋 Event details:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0,
  })

  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod)
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    console.log('📦 Parsing request body...')
    const { imageBlob, caption } = JSON.parse(event.body)
    console.log('✅ Request parsed successfully')
    console.log('📊 Request data:', {
      hasImageBlob: !!imageBlob,
      imageBlobLength: imageBlob ? imageBlob.length : 0,
      hasCaption: !!caption,
      captionLength: caption ? caption.length : 0,
    })

    console.log('🚀 Starting Make.com Facebook automation with Cloudinary...')

    if (!imageBlob || !caption) {
      console.log('❌ Missing required data:', {
        imageBlob: !!imageBlob,
        caption: !!caption,
      })
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
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    })

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_UPLOAD_PRESET
    ) {
      console.error('❌ Missing environment variables')
      throw new Error('Missing Cloudinary environment variables')
    }

    // ✅ Convert base64 to proper format
    console.log('🔄 Processing image data...')
    let imageData = imageBlob

    // If it's a data URL, extract just the base64 part
    if (imageBlob.startsWith('data:image/')) {
      console.log('📝 Extracting base64 from data URL...')
      imageData = imageBlob.split(',')[1]
      console.log('✅ Base64 extracted successfully')
    }

    // ✅ Add validation for base64 data
    if (!imageData || imageData.length < 100) {
      console.error('❌ Invalid image data:', {
        length: imageData ? imageData.length : 0,
      })
      throw new Error('Invalid or empty image data')
    }

    const imageSizeKB = (imageData.length * 3) / 4 / 1024
    console.log('📏 Original image size:', Math.round(imageSizeKB), 'KB')
    console.log('📊 Image data stats:', {
      base64Length: imageData.length,
      estimatedSizeKB: Math.round(imageSizeKB),
      isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.substring(0, 100)),
    })

    console.log('📤 Uploading to Cloudinary...')

    // ✅ FIXED: Create multipart form data manually (Node.js compatible)
    const boundary = '----formdata-netlify-' + Math.random().toString(36)
    console.log('🎯 Generated boundary:', boundary)

    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"',
      '',
      `data:image/png;base64,${imageData}`,
      `--${boundary}`,
      'Content-Disposition: form-data; name="upload_preset"',
      '',
      process.env.CLOUDINARY_UPLOAD_PRESET,
      `--${boundary}`,
      'Content-Disposition: form-data; name="folder"',
      '',
      'rdv-news',
      `--${boundary}`,
      'Content-Disposition: form-data; name="public_id"',
      '',
      `rdv-hq-${Date.now()}`,
      `--${boundary}`,
      'Content-Disposition: form-data; name="tags"',
      '',
      'rdv-news,facebook,high-quality',
      `--${boundary}--`,
      '',
    ].join('\r\n')

    console.log('🔧 Form data prepared:', {
      formDataLength: formData.length,
      boundary: boundary,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })

    console.log('🔧 Uploading to Cloudinary with multipart form...')
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Cloudinary URL:', cloudinaryUrl)

    const cloudinaryUpload = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: formData,
    })

    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)
    console.log(
      '📊 Cloudinary response headers:',
      Object.fromEntries(cloudinaryUpload.headers.entries())
    )

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error response:', errorText)
      console.error('❌ Cloudinary request details:', {
        url: cloudinaryUrl,
        status: cloudinaryUpload.status,
        statusText: cloudinaryUpload.statusText,
      })
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 Cloudinary upload successful!')
    console.log('🔗 Cloudinary URL:', cloudinaryResult.secure_url)
    console.log('📋 Cloudinary full response:', cloudinaryResult)

    // ✅ Quality analysis
    console.log('🔍 QUALITY ANALYSIS:', {
      original_size_kb: Math.round(imageSizeKB),
      cloudinary_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      format: cloudinaryResult.format,
      compression_ratio: `${Math.round(
        (imageSizeKB / (cloudinaryResult.bytes / 1024)) * 100
      )}%`,
      public_id: cloudinaryResult.public_id,
    })

    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_facebook: true,
      // ✅ Metadata
      original_size_kb: Math.round(imageSizeKB),
      optimized_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      image_format: cloudinaryResult.format,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Preparing Make.com webhook call...')
    console.log('📋 Make.com payload:', makePayload)
    console.log('📊 Payload size:', JSON.stringify(makePayload).length, 'bytes')

    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/iygbk1s4ghqcs8y366w153acvyucr67r'
    console.log('🎯 Make.com webhook URL:', MAKE_WEBHOOK_URL)

    console.log('🚀 Sending to Make.com webhook...')
    const webhookStartTime = Date.now()

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function/1.0',
      },
      body: JSON.stringify(makePayload),
    })

    const webhookDuration = Date.now() - webhookStartTime
    console.log('⏱️ Webhook call duration:', webhookDuration, 'ms')

    console.log('📊 Make.com response details:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // ✅ Always try to get response text, even if not ok
    let responseText = ''
    try {
      responseText = await response.text()
      console.log('📄 Make.com raw response:', responseText)
      console.log('📊 Response length:', responseText.length)
    } catch (textError) {
      console.error('❌ Error reading response text:', textError.message)
    }

    if (!response.ok) {
      console.error('❌ Make.com webhook failed:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        url: MAKE_WEBHOOK_URL,
        payload: makePayload,
      })
      throw new Error(
        `Make.com webhook failed: ${response.status} - ${responseText}`
      )
    }

    console.log('🔍 Checking Make.com response content...')
    console.log(
      '📝 Response includes "Accepted":',
      responseText.includes('Accepted')
    )
    console.log(
      '📝 Response includes "accepted":',
      responseText.includes('accepted')
    )
    console.log(
      '📝 Response includes "success":',
      responseText.includes('success')
    )

    if (
      responseText.includes('Accepted') ||
      responseText.includes('accepted') ||
      response.status === 200
    ) {
      console.log('✅ Make.com accepted image successfully!')

      const successResponse = {
        success: true,
        message: 'Facebook posting initiated via Make.com with Cloudinary',
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        method: 'make_com_webhook',
        status: 'accepted',
        cloudinary_url: cloudinaryResult.secure_url,
        optimized: true,
        webhook_duration_ms: webhookDuration,
        image_quality: {
          dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
          format: cloudinaryResult.format,
          final_size_kb: Math.round(cloudinaryResult.bytes / 1024),
        },
      }

      console.log('🎉 Success response prepared:', successResponse)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(successResponse),
      }
    } else {
      console.error('❌ Unexpected Make.com response format:', responseText)
      throw new Error(`Unexpected Make.com response: ${responseText}`)
    }
  } catch (error) {
    console.error('❌ Function error occurred!')
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)

    const errorResponse = {
      success: false,
      error: 'Function failed',
      details: error.message,
      error_name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }

    console.log('💥 Error response prepared:', errorResponse)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse),
    }
  }
}
