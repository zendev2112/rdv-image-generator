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

    console.log('🚀 Starting Make.com direct Facebook automation...')

    if (!imageBlob || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing imageBlob or caption' }),
      }
    }

    // ✅ FIXED: Convert base64 to proper format for Facebook
    let imageData = imageBlob

    // If it's a data URL, extract just the base64 part
    if (imageBlob.startsWith('data:image/')) {
      imageData = imageBlob.split(',')[1] // Remove "data:image/png;base64," prefix
    }

    // ✅ SIMPLIFIED: Let Make.com handle the conversion
    const makePayload = {
      image_data: imageData, // Clean base64 string
      caption: caption,
      post_to_facebook: true,
    }

    console.log('📤 Sending to Make.com webhook...')
    console.log('📊 Base64 length:', imageData.length)
    console.log('📊 Caption:', caption)

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

    // ✅ FIXED: Handle "Accepted" response (not JSON)
    const responseText = await response.text()
    console.log('📄 Make.com raw response:', responseText)

    // Make.com webhooks return "Accepted" when successful
    if (responseText.includes('Accepted')) {
      console.log('✅ Make.com accepted webhook successfully!')

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Facebook posting initiated via Make.com',
          platform: 'facebook',
          publishedAt: new Date().toISOString(),
          method: 'make_com_webhook',
          status: 'accepted',
        }),
      }
    } else {
      throw new Error(`Unexpected Make.com response: ${responseText}`)
    }
  } catch (error) {
    console.error('❌ Make.com automation error:', error)
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
