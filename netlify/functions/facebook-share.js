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

    // ✅ DEBUG: Check all environment variables (using correct names)
    console.log('🔍 Environment variables check:', {
      hasMetaAppId: !!process.env.META_APP_ID,
      metaAppId: process.env.META_APP_ID,
      hasMetaAccessToken: !!process.env.META_ACCESS_TOKEN,
      metaAccessTokenLength: process.env.META_ACCESS_TOKEN?.length || 0,
      hasFacebookPageId: !!process.env.FACEBOOK_PAGE_ID,
      facebookPageId: process.env.FACEBOOK_PAGE_ID,
    })

    // ✅ FIXED: Use META_APP_ID instead of FACEBOOK_APP_ID
    if (!process.env.META_APP_ID) {
      throw new Error('META_APP_ID environment variable not set')
    }
    if (!process.env.META_ACCESS_TOKEN) {
      throw new Error('META_ACCESS_TOKEN environment variable not set')
    }
    if (!process.env.FACEBOOK_PAGE_ID) {
      throw new Error('FACEBOOK_PAGE_ID environment variable not set')
    }

    // Convert base64 to buffer
    const base64Data = imageBlob.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8
    const contentType = isJPEG ? 'image/jpeg' : 'image/png'
    const filename = `rdv_${Date.now()}.${isJPEG ? 'jpg' : 'png'}`

    console.log('📄 File details:', {
      filename,
      contentType,
      size: imageBuffer.length,
      sizeKB: Math.round(imageBuffer.length / 1024),
      sizeMB: (imageBuffer.length / 1024 / 1024).toFixed(2),
    })

    // ✅ 1. Test token validity first
    console.log('🔐 Testing access token validity...')
    const tokenTestUrl = `https://graph.facebook.com/v23.0/me?access_token=${process.env.META_ACCESS_TOKEN}`

    const tokenTestRes = await fetch(tokenTestUrl)
    const tokenTestResult = await tokenTestRes.json()

    console.log('📊 Token test result:', {
      status: tokenTestRes.status,
      ok: tokenTestRes.ok,
      result: tokenTestResult,
    })

    if (!tokenTestRes.ok) {
      throw new Error(
        `Invalid access token: ${JSON.stringify(tokenTestResult)}`
      )
    }

    // ✅ 2. Start upload session (using META_APP_ID)
    console.log('📤 Starting upload session...')
    const uploadSessionUrl =
      `https://graph.facebook.com/v23.0/${process.env.META_APP_ID}/uploads` +
      `?file_name=${encodeURIComponent(filename)}` +
      `&file_length=${imageBuffer.length}` +
      `&file_type=${encodeURIComponent(contentType)}` +
      `&access_token=${process.env.META_ACCESS_TOKEN}`

    console.log(
      '🔗 Upload session URL:',
      uploadSessionUrl.replace(process.env.META_ACCESS_TOKEN, '[TOKEN_HIDDEN]')
    )

    const startSessionRes = await fetch(uploadSessionUrl, { method: 'POST' })
    const session = await startSessionRes.json()

    console.log('📊 Upload session result:', {
      status: startSessionRes.status,
      ok: startSessionRes.ok,
      headers: Object.fromEntries(startSessionRes.headers.entries()),
      session: session,
    })

    if (!startSessionRes.ok || !session.id) {
      throw new Error(
        `Failed to start upload session: ${JSON.stringify(session)}`
      )
    }

    const uploadSessionId = session.id.replace('upload:', '')
    console.log('✅ Upload session started:', uploadSessionId)

    // ✅ 3. Upload file
    console.log('📁 Uploading file...')
    const uploadRes = await fetch(
      `https://graph.facebook.com/v23.0/upload:${uploadSessionId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${process.env.META_ACCESS_TOKEN}`,
          file_offset: '0',
        },
        body: imageBuffer,
      }
    )

    const uploadResult = await uploadRes.json()

    console.log('📊 File upload result:', {
      status: uploadRes.status,
      ok: uploadRes.ok,
      result: uploadResult,
    })

    if (!uploadRes.ok || !uploadResult.h) {
      throw new Error(`Failed to upload file: ${JSON.stringify(uploadResult)}`)
    }

    const uploadedFileHandle = uploadResult.h
    console.log('✅ File uploaded:', uploadedFileHandle)

    // ✅ 4. Publish the photo
    console.log('📝 Publishing photo...')
    const publishRes = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          published: 'true',
          caption: caption,
          file_handle: uploadedFileHandle,
          access_token: process.env.META_ACCESS_TOKEN,
        }).toString(),
      }
    )

    const publishResult = await publishRes.json()

    console.log('📊 Publish result:', {
      status: publishRes.status,
      ok: publishRes.ok,
      result: publishResult,
    })

    if (!publishRes.ok || !publishResult.id) {
      throw new Error(
        `Failed to publish photo: ${JSON.stringify(publishResult)}`
      )
    }

    console.log('✅ Facebook post published successfully!')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        id: publishResult.id,
        postUrl: `https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}/posts/${publishResult.id}`,
        platform: 'facebook',
        publishedAt: new Date().toISOString(),
        method: 'resumable_upload_v23',
        imageId: publishResult.id,
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
