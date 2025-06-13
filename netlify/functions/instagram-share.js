export const handler = async (event, context) => {
  console.log('--- Instagram Share Function Triggered ---')
  console.log('HTTP Method:', event.httpMethod)
  console.log('Headers:', JSON.stringify(event.headers, null, 2))
  console.log('Raw Body Length:', event.body?.length)
  console.log('Raw Body Preview:', event.body?.substring(0, 200))

  if (event.httpMethod !== 'POST') {
    console.log('❌ Invalid HTTP method')
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const parsedBody = JSON.parse(event.body)
    const { imageBlob, caption, location_id, content_type } = parsedBody

    console.log('Parsed body details:', {
      imageBlobLength: imageBlob?.length,
      caption: caption,
      location_id: location_id,
      content_type: content_type,
      hasImageBlob: !!imageBlob,
      hasCaption: !!caption,
    })

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
      console.log('Stripped data URL prefix, new length:', imageData.length)
    }
    console.log('Final image data length:', imageData.length)

    const formData = new FormData()
    formData.append('file', `data:image/png;base64,${imageData}`)
    formData.append('upload_preset', 'rdv_social_posts')
    formData.append('folder', 'rdv_news')

    console.log('Uploading to Cloudinary...')
    console.log('Cloudinary cloud name:', process.env.CLOUDINARY_CLOUD_NAME)

    const cloudinaryUpload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    console.log('Cloudinary upload status:', cloudinaryUpload.status)
    console.log(
      'Cloudinary response headers:',
      JSON.stringify([...cloudinaryUpload.headers.entries()])
    )

    if (!cloudinaryUpload.ok) {
      const errorText = await cloudinaryUpload.text()
      console.error('❌ Cloudinary upload failed:', errorText)
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryUpload.status} - ${errorText}`
      )
    }

    const cloudinaryResult = await cloudinaryUpload.json()
    console.log(
      'Cloudinary result full response:',
      JSON.stringify(cloudinaryResult, null, 2)
    )

    // Send to Make webhook
    const makePayload = {
      image_url: cloudinaryResult.secure_url,
      image_public_id: cloudinaryResult.public_id,
      caption: caption,
      post_to_instagram: true,
      timestamp: new Date().toISOString(),
      ...(location_id && { location_id }),
      content_type: content_type || 'post',
    }

    console.log('Complete Make payload:', JSON.stringify(makePayload, null, 2))
    console.log(
      'Make webhook URL:',
      'https://hook.us1.make.com/u76xfgrwqlmcbbjdn4k8a98pb4sth59w'
    )

    const MAKE_WEBHOOK_URL =
      'https://hook.us1.make.com/u76xfgrwqlmcbbjdn4k8a98pb4sth59w'

    console.log('Sending request to Make...')
    const makeRequestStart = Date.now()

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function',
      },
      body: JSON.stringify(makePayload),
    })

    const makeRequestTime = Date.now() - makeRequestStart
    console.log('Make request took:', makeRequestTime, 'ms')
    console.log('Make webhook response status:', response.status)
    console.log(
      'Make response headers:',
      JSON.stringify([...response.headers.entries()])
    )

    const makeResponseText = await response.text()
    console.log('Make webhook response text:', makeResponseText)
    console.log('Make response text length:', makeResponseText.length)

    if (!response.ok) {
      console.error('❌ Make.com webhook failed with status:', response.status)
      console.error('❌ Make.com webhook error response:', makeResponseText)
      throw new Error(
        `Make.com webhook failed: ${response.status} - ${makeResponseText}`
      )
    }

    console.log('✅ Instagram share completed successfully')
    console.log('✅ Final success - returning 200')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        makeResponse: makeResponseText,
        cloudinaryUrl: cloudinaryResult.secure_url,
      }),
    }
  } catch (error) {
    console.error('❌ Caught error in try/catch:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error message:', error.message)

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
