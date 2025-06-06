export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    const { imageBlob, caption } = JSON.parse(event.body)

    console.log('📘 Facebook share function started:', {
      hasImage: !!imageBlob,
      captionLength: caption?.length || 0,
      timestamp: new Date().toISOString()
    })

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' })
      }
    }

    // Convert base64 to buffer
    const base64Data = imageBlob.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8
    const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47
    const contentType = isJPEG ? 'image/jpeg' : 'image/png'
    const filename = isJPEG ? `rdv-post-${Date.now()}.jpg` : `rdv-post-${Date.now()}.png`

    console.log('🖼️ Image processed:', {
      size: imageBuffer.length,
      isJPEG,
      isPNG,
      contentType,
      filename
    })

    console.log('📤 Uploading to Facebook with multipart form...')

    // ✅ CREATE PROPER MULTIPART FORM DATA
    const boundary = `----formdata-${Date.now()}`
    const CRLF = '\r\n'
    
    const formDataParts = [
      `--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="source"; filename="${filename}"${CRLF}`,
      `Content-Type: ${contentType}${CRLF}${CRLF}`,
      imageBuffer,
      `${CRLF}--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="published"${CRLF}${CRLF}`,
      `false${CRLF}`,
      `--${boundary}--${CRLF}`
    ]

    // Build the complete body
    const textStart = formDataParts[0] + formDataParts[1] + formDataParts[2]
    const textEnd = formDataParts[4] + formDataParts[5] + formDataParts[6] + formDataParts[7]
    
    const body = Buffer.concat([
      Buffer.from(textStart, 'utf8'),
      imageBuffer,
      Buffer.from(textEnd, 'utf8')
    ])

    console.log('📊 Multipart details:', {
      boundary,
      totalSize: body.length,
      contentType: `multipart/form-data; boundary=${boundary}`
    })

    // Upload image to Facebook with multipart
    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length.toString()
        },
        body: body,
      }
    )

    const uploadResult = await uploadResponse.json()

    console.log('📊 Upload result:', {
      status: uploadResponse.status,
      ok: uploadResponse.ok,
      hasId: !!uploadResult.id,
      error: uploadResult.error
    })

    if (!uploadResponse.ok || uploadResult.error) {
      console.error('❌ Upload failed:', uploadResult.error)
      throw new Error(uploadResult.error?.message || 'Image upload failed')
    }

    if (!uploadResult.id) {
      throw new Error('No image ID received from Facebook')
    }

    console.log('✅ Image uploaded, creating post...')

    // Create post with uploaded image
    const postData = new URLSearchParams({
      message: caption,
      attached_media: JSON.stringify([{ media_fbid: uploadResult.id }]),
      access_token: process.env.META_ACCESS_TOKEN,
    })

    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postData.toString(),
      }
    )

    const postResult = await postResponse.json()

    console.log('📊 Post result:', {
      status: postResponse.status,
      ok: postResponse.ok,
      hasId: !!postResult.id,
      error: postResult.error
    })

    if (!postResponse.ok || postResult.error) {
      throw new Error(postResult.error?.message || 'Post creation failed')
    }

    console.log('✅ Facebook post created successfully!')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        id: postResult.id,
        postUrl: `https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}/posts/${postResult.id}`,
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        method: 'netlify_function_multipart',
        imageId: uploadResult.id
      })
    }

  } catch (error) {
    console.error('❌ Facebook share error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Facebook sharing failed',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}