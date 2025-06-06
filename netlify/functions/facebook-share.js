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

    console.log('📘 Facebook share function started:', {
      hasImage: !!imageBlob,
      captionLength: caption?.length || 0,
      timestamp: new Date().toISOString(),
    })

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    // Convert base64 to buffer
    const base64Data = imageBlob.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    console.log('🖼️ Image details:', {
      size: imageBuffer.length,
      sizeKB: Math.round(imageBuffer.length / 1024),
      sizeMB: (imageBuffer.length / 1024 / 1024).toFixed(2),
    })

    // ✅ APPROACH 1: Upload to Cloudinary first, then use URL
    console.log('☁️ Uploading to Cloudinary first...')

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: imageBlob,
          upload_preset: 'rdv_social_posts', // You'll need to create this
          folder: 'facebook_posts',
          public_id: `rdv_fb_${Date.now()}`,
          overwrite: true,
          resource_type: 'image',
        }),
      }
    )

    if (!cloudinaryResponse.ok) {
      throw new Error('Cloudinary upload failed')
    }

    const cloudinaryResult = await cloudinaryResponse.json()
    const imageUrl = cloudinaryResult.secure_url

    console.log('✅ Image uploaded to Cloudinary:', imageUrl)

    // ✅ APPROACH 2: Use Facebook's URL-based upload
    console.log('📤 Uploading to Facebook via URL method...')

    const uploadData = new URLSearchParams({
      url: imageUrl,
      published: 'false',
      access_token: process.env.META_ACCESS_TOKEN,
    })

    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: uploadData.toString(),
      }
    )

    const uploadResult = await uploadResponse.json()

    console.log('📊 Facebook upload result:', {
      status: uploadResponse.status,
      ok: uploadResponse.ok,
      hasId: !!uploadResult.id,
      error: uploadResult.error,
    })

    if (!uploadResponse.ok || uploadResult.error) {
      console.error('❌ Facebook upload failed:', uploadResult.error)
      throw new Error(uploadResult.error?.message || 'Facebook upload failed')
    }

    if (!uploadResult.id) {
      throw new Error('No image ID received from Facebook')
    }

    console.log('✅ Image uploaded to Facebook, creating post...')

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
      error: postResult.error,
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
        method: 'netlify_function_url_upload',
        imageId: uploadResult.id,
        cloudinaryUrl: imageUrl,
      }),
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
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
