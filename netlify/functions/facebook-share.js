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

    // Convert base64 to buffer
    const base64Data = imageBlob.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8
    const contentType = isJPEG ? 'image/jpeg' : 'image/png'
    const filename = `rdv_${Date.now()}.${isJPEG ? 'jpg' : 'png'}`

    // 1. Start upload session
    const startSessionRes = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_APP_ID}/uploads` +
        `?file_name=${encodeURIComponent(filename)}` +
        `&file_length=${imageBuffer.length}` +
        `&file_type=${encodeURIComponent(contentType)}` +
        `&access_token=${process.env.META_ACCESS_TOKEN}`,
      { method: 'POST' }
    )
    const session = await startSessionRes.json()
    if (!session.id)
      throw new Error(
        'Failed to start upload session: ' + JSON.stringify(session)
      )
    const uploadSessionId = session.id.replace('upload:', '')

    // 2. Upload file
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
    if (!uploadResult.h)
      throw new Error('Failed to upload file: ' + JSON.stringify(uploadResult))
    const uploadedFileHandle = uploadResult.h

    // 3. Publish the file (this step may vary; here's a generic example)
    // You may need to check the docs for the correct endpoint and parameters for publishing a photo
    // For example, you might need to use /me/photos or /<PAGE_ID>/photos with the handle
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
    if (!publishResult.id)
      throw new Error(
        'Failed to publish photo: ' + JSON.stringify(publishResult)
      )

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
