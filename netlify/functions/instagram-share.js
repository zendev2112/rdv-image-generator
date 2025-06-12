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

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    let imageData = imageBlob
    if (imageBlob.startsWith('data:image/')) {
      imageData = imageBlob.split(',')[1]
    }

    const formData = new FormData()
    formData.append('file', `data:image/png;base64,${imageData}`)
    formData.append('upload_preset', 'rdv_social_posts')
    formData.append('folder', 'rdv_news')

    const cloudinaryUpload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()

    // Send to Make webhook
    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      caption: caption,
      post_to_instagram: true,
      timestamp: new Date().toISOString(),
    }

    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/u76xfgrwqlmcbbjdn4k8a98pb4sth59w'

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makePayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Make.com webhook failed: ${response.status} - ${errorText}`
      )
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Make.com automation failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    }
  }
}