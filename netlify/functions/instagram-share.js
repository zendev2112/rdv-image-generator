export const handler = async (event, context) => {
  console.log('🎬 Instagram function started (Make.com approach)')

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const { imageBlob, caption, contentType, recordId } = JSON.parse(event.body)

    console.log('📷 Starting Instagram publishing via Make.com...')
    console.log('📊 Content type:', contentType)

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    // Environment variables check
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Missing Cloudinary environment variables')
    }

    // Process image
    let imageData = imageBlob
    if (imageBlob.startsWith('data:image/')) {
      console.log('📝 Extracting base64 from data URL...')
      imageData = imageBlob.split(',')[1]
    }

    const imageSizeKB = (imageData.length * 3) / 4 / 1024
    console.log('📏 Original image size:', Math.round(imageSizeKB), 'KB')

    // Upload to Cloudinary with Instagram-specific settings
    const cloudinaryPayload = {
      file: `data:image/png;base64,${imageData}`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'rdv-instagram',
      public_id: `rdv-ig-${contentType}-${Date.now()}`,
      tags: `rdv-news,instagram,${contentType}`,
      quality: 'auto:best',
      format: 'auto'
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('🎯 Uploading to Cloudinary...')

    const uploadTimeout = 15000
    const uploadPromise = fetch(cloudinaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloudinaryPayload),
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cloudinary upload timeout')), uploadTimeout)
    )

    const cloudinaryUpload = await Promise.race([uploadPromise, timeoutPromise])
    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error:', errorText)
      throw new Error(`Cloudinary upload failed: ${errorText}`)
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 Instagram image uploaded successfully!')
    console.log('🔗 URL:', cloudinaryResult.secure_url)

    // Quality analysis
    const finalSizeKB = Math.round(cloudinaryResult.bytes / 1024)
    console.log('🎨 INSTAGRAM QUALITY:', {
      original_size_kb: Math.round(imageSizeKB),
      final_size_kb: finalSizeKB,
      dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      content_type: contentType
    })

    // Prepare Instagram-specific payload for Make.com
    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      platform: 'instagram',
      content_type: contentType, // 'post' or 'story'
      media_type: contentType === 'story' ? 'STORIES' : 'FEED',
      record_id: recordId,
      original_size_kb: Math.round(imageSizeKB),
      final_size_kb: finalSizeKB,
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      timestamp: new Date().toISOString(),
      account_name: 'Radio del Volga'
    }

    console.log('📤 Sending to Instagram Make.com webhook...')
    
    // Instagram-specific webhook URL for Make.com
    const INSTAGRAM_WEBHOOK_URL = 'https://hook.us1.make.com/YOUR_INSTAGRAM_WEBHOOK_ID'

    const webhookPromise = fetch(INSTAGRAM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RDV-Instagram-Generator/1.0',
      },
      body: JSON.stringify(makePayload),
    })

    const webhookTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Instagram webhook timeout')), 8000)
    )

    try {
      const response = await Promise.race([webhookPromise, webhookTimeoutPromise])

      console.log('📊 Instagram Make.com response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      })

      const responseText = await response.text()
      console.log('📄 Instagram response text:', responseText)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Instagram ${contentType} posted successfully via Make.com`,
          platform: 'instagram',
          content_type: contentType,
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: response.ok ? 'success' : 'failed',
          quality_info: {
            original_size_kb: Math.round(imageSizeKB),
            final_size_kb: finalSizeKB,
            dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
            format: cloudinaryResult.format,
          },
        }),
      }
    } catch (webhookError) {
      console.error('❌ Instagram webhook error:', webhookError.message)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Image uploaded to Cloudinary (Instagram webhook timeout)',
          platform: 'instagram',
          content_type: contentType,
          cloudinary_url: cloudinaryResult.secure_url,
          make_com_status: 'timeout',
        }),
      }
    }

  } catch (error) {
    console.error('❌ Instagram function error:', error.message)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Instagram function failed',
        details: error.message,
        platform: 'instagram',
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
