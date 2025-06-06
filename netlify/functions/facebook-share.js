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

    // ✅ DEBUG: Check environment variables
    console.log('🔍 Environment check:', {
      hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
      hasFacebookToken: !!process.env.META_ACCESS_TOKEN,
      hasFacebookPageId: !!process.env.FACEBOOK_PAGE_ID,
    })

    console.log('☁️ Attempting Cloudinary upload...')

    // ✅ FIXED: Clean public_id (no slashes allowed)
    const cleanTimestamp = Date.now()
    const cleanId = `rdv_fb_${cleanTimestamp}`

    const cloudinaryFormData = new URLSearchParams()
    cloudinaryFormData.append('file', imageBlob)
    cloudinaryFormData.append('upload_preset', 'rdv_social_posts')
    cloudinaryFormData.append('public_id', cleanId) // ✅ No slashes

    console.log('📤 Cloudinary request details:', {
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      preset: 'rdv_social_posts',
      publicId: cleanId,
      hasFile: !!imageBlob,
    })

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: cloudinaryFormData.toString(),
      }
    )

    console.log('📊 Cloudinary response:', {
      status: cloudinaryResponse.status,
      ok: cloudinaryResponse.ok,
      statusText: cloudinaryResponse.statusText,
    })

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('❌ Cloudinary detailed error:', errorText)

      // ✅ FALLBACK: If Cloudinary fails, try direct Facebook upload
      console.log('🔄 Cloudinary failed, trying direct Facebook upload...')
      return await tryDirectFacebookUpload(imageBlob, caption)
    }

    const cloudinaryResult = await cloudinaryResponse.json()
    const imageUrl = cloudinaryResult.secure_url

    console.log('✅ Cloudinary success!')
    console.log('🔗 Image URL:', imageUrl)

    // Continue with Facebook upload using URL...
    const uploadData = new URLSearchParams({
      url: imageUrl,
      published: 'false',
      access_token: process.env.META_ACCESS_TOKEN,
    })

    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: uploadData.toString(),
      }
    )

    const uploadResult = await uploadResponse.json()

    console.log('📊 Facebook URL upload result:', {
      status: uploadResponse.status,
      ok: uploadResponse.ok,
      hasId: !!uploadResult.id,
      error: uploadResult.error,
    })

    if (!uploadResponse.ok || uploadResult.error) {
      console.error('❌ Facebook URL upload failed:', uploadResult.error)
      throw new Error(uploadResult.error?.message || 'Facebook upload failed')
    }

    // Create post...
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

    if (!postResponse.ok || postResult.error) {
      throw new Error(postResult.error?.message || 'Post creation failed')
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        id: postResult.id,
        postUrl: `https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}/posts/${postResult.id}`,
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        method: 'cloudinary_url_upload',
        imageId: uploadResult.id,
        cloudinaryUrl: imageUrl,
      }),
    }
  } catch (error) {
    console.error('❌ Main function error:', error)
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

// ✅ IMPROVED FALLBACK: Try different Facebook upload approaches
async function tryDirectFacebookUpload(imageBlob, caption) {
  try {
    console.log('🔄 Attempting direct Facebook upload...')

    // Convert base64 to buffer
    const base64Data = imageBlob.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8
    const cleanFilename = `rdv_${Date.now()}.${isJPEG ? 'jpg' : 'png'}` // ✅ Clean filename
    const contentType = isJPEG ? 'image/jpeg' : 'image/png'

    console.log('📊 Upload details:', {
      filename: cleanFilename,
      contentType,
      isJPEG,
      bufferSize: imageBuffer.length,
      sizeKB: Math.round(imageBuffer.length / 1024),
    })

    // ✅ TRY APPROACH 1: Using form-data
    console.log('📤 Trying form-data approach...')

    const FormData = (await import('form-data')).default
    const formData = new FormData()

    formData.append('source', imageBuffer, {
      filename: cleanFilename,
      contentType: contentType,
    })
    formData.append('published', 'false')

    let uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      }
    )

    let uploadResult = await uploadResponse.json()

    console.log('📊 Form-data upload result:', {
      status: uploadResponse.status,
      ok: uploadResponse.ok,
      hasId: !!uploadResult.id,
      error: uploadResult.error,
    })

    // ✅ TRY APPROACH 2: If form-data fails, try manual multipart
    if (!uploadResponse.ok || uploadResult.error) {
      console.log('📤 Form-data failed, trying manual multipart...')

      const boundary = `----formdata${Date.now()}`
      const CRLF = '\r\n'

      const textStart = [
        `--${boundary}${CRLF}`,
        `Content-Disposition: form-data; name="source"; filename="${cleanFilename}"${CRLF}`,
        `Content-Type: ${contentType}${CRLF}${CRLF}`,
      ].join('')

      const textEnd = [
        `${CRLF}--${boundary}${CRLF}`,
        `Content-Disposition: form-data; name="published"${CRLF}${CRLF}`,
        `false${CRLF}`,
        `--${boundary}--${CRLF}`,
      ].join('')

      const body = Buffer.concat([
        Buffer.from(textStart, 'utf8'),
        imageBuffer,
        Buffer.from(textEnd, 'utf8'),
      ])

      uploadResponse = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos?access_token=${process.env.META_ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length.toString(),
          },
          body: body,
        }
      )

      uploadResult = await uploadResponse.json()

      console.log('📊 Manual multipart result:', {
        status: uploadResponse.status,
        ok: uploadResponse.ok,
        hasId: !!uploadResult.id,
        error: uploadResult.error,
      })
    }

    if (!uploadResponse.ok || uploadResult.error) {
      console.error(
        '❌ All Facebook upload methods failed:',
        uploadResult.error
      )
      throw new Error(
        uploadResult.error?.message || 'All Facebook upload methods failed'
      )
    }

    if (!uploadResult.id) {
      throw new Error('No image ID received from Facebook')
    }

    console.log('✅ Facebook image upload successful! ID:', uploadResult.id)

    // Create post
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

    if (!postResponse.ok || postResult.error) {
      throw new Error(postResult.error?.message || 'Post creation failed')
    }

    console.log('✅ Direct Facebook upload successful!')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        id: postResult.id,
        postUrl: `https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}/posts/${postResult.id}`,
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        method: 'direct_facebook_upload',
        imageId: uploadResult.id,
      }),
    }
  } catch (error) {
    console.error('❌ Direct Facebook upload failed:', error)
    throw error
  }
}
