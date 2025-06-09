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

    // If it's a data URL, extract just the base64 part
    if (imageBlob.startsWith('data:image/')) {
      imageData = imageBlob.split(',')[1]
    }

    // ✅ Add validation for base64 data
    if (!imageData || imageData.length < 100) {
      throw new Error('Invalid or empty image data')
    }

    const imageSizeKB = (imageData.length * 3) / 4 / 1024
    console.log('📏 Original image size:', Math.round(imageSizeKB), 'KB')

    console.log('📤 Uploading to Cloudinary...')

    // ✅ FIXED: Use JSON instead of FormData (FormData causes 502 in Netlify)
    const cloudinaryPayload = {
      file: `data:image/png;base64,${imageData}`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'rdv-news',
      public_id: `rdv-hq-${Date.now()}`,
      tags: 'rdv-news,facebook,high-quality',
    }

    console.log('🔧 Uploading to Cloudinary with JSON payload...')

    const cloudinaryUpload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudinaryPayload),
      }
    )

    console.log('📊 Cloudinary response status:', cloudinaryUpload.status)

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary error response:', errorText)
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('📸 Cloudinary upload successful:', cloudinaryResult.secure_url)

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
      // ✅ Metadata
      original_size_kb: Math.round(imageSizeKB),
      optimized_size_kb: Math.round(cloudinaryResult.bytes / 1024),
      image_dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
      image_format: cloudinaryResult.format,
      timestamp: new Date().toISOString(),
    }

    console.log('📤 Sending to Make.com webhook...')
    console.log('📊 Image URL:', cloudinaryResult.secure_url)

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
      console.log('✅ Make.com accepted image successfully!')

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Facebook posting initiated via Make.com with Cloudinary',
          platform: 'facebook',
          publishedAt: new Date().toISOString(),
          method: 'make_com_webhook',
          status: 'accepted',
          cloudinary_url: cloudinaryResult.secure_url,
          optimized: true,
          image_quality: {
            dimensions: `${cloudinaryResult.width}x${cloudinaryResult.height}`,
            format: cloudinaryResult.format,
            final_size_kb: Math.round(cloudinaryResult.bytes / 1024),
          },
        }),
      }
    } else {
      throw new Error(`Unexpected Make.com response: ${responseText}`)
    }
  } catch (error) {
    console.error('❌ Function error:', error)
    console.error('❌ Error stack:', error.stack)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Function failed',
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
