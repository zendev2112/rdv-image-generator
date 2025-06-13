export const handler = async (event, context) => {
  console.log('--- Instagram Share Function Triggered ---')
  console.log('HTTP Method:', event.httpMethod)
  console.log('Headers:', event.headers)
  console.log('Body:', event.body)

  if (event.httpMethod !== 'POST') {
    console.log('❌ Invalid HTTP method')
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const { imageBlob, caption, location_id, content_type } = JSON.parse(event.body)
    console.log('Parsed body:', { imageBlobLength: imageBlob?.length, caption })

    if (!imageBlob || !caption) {
      console.log('❌ Missing imageBlob or caption')
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
    console.log('Image data length:', imageData.length)

    const formData = new FormData()
    formData.append('file', `data:image/png;base64,${imageData}`)
    formData.append('upload_preset', 'rdv_social_posts')
    formData.append('folder', 'rdv_news')

    console.log('Uploading to Cloudinary...')
    const cloudinaryUpload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    console.log('Cloudinary upload status:', cloudinaryUpload.status)
    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary upload failed:', errorText)
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log('Cloudinary result:', cloudinaryResult)

    // Send to Make webhook
    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id, // <-- add this line
      caption: caption,
      post_to_instagram: true,
      timestamp: new Date().toISOString(),
      ...(location_id && { location_id }),
      content_type: content_type || 'post',
    }
    console.log('Sending to Make webhook:', makePayload)

    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/u76xfgrwqlmcbbjdn4k8a98pb4sth59w'

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makePayload),
    })

    console.log('Make webhook response status:', response.status)
    const makeResponseText = await response.text()
    console.log('Make webhook response text:', makeResponseText)

    if (!response.ok) {
      console.error('❌ Make.com webhook failed:', makeResponseText)
      throw new Error(
        `Make.com webhook failed: ${response.status} - ${makeResponseText}`
      )
    }

    console.log('✅ Instagram share completed successfully')
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('❌ Caught error:', error)
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