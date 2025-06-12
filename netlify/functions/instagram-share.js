const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { imageBlob, caption, contentType, recordId } = JSON.parse(event.body)

    console.log('📸 Instagram Graph API request:', { contentType, recordId })

    // Instagram credentials from environment variables
    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

    if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
      throw new Error(
        'Instagram credentials not configured in environment variables'
      )
    }

    // Step 1: Upload image to Cloudinary
    console.log('☁️ Uploading to Cloudinary...')
    const imageUrl = await uploadToCloudinary(
      imageBlob,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    )
    console.log('✅ Image uploaded:', imageUrl)

    let instagramResult

    if (contentType === 'story') {
      // Instagram Story
      instagramResult = await publishInstagramStory(
        imageUrl,
        INSTAGRAM_ACCOUNT_ID,
        INSTAGRAM_ACCESS_TOKEN
      )
    } else {
      // Instagram Post
      instagramResult = await publishInstagramPost(
        imageUrl,
        caption,
        INSTAGRAM_ACCOUNT_ID,
        INSTAGRAM_ACCESS_TOKEN
      )
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        instagram_id: instagramResult.id,
        contentType: contentType,
        message: `Instagram ${contentType} published successfully to Radio del Volga`,
        image_url: imageUrl,
      }),
    }
  } catch (error) {
    console.error('❌ Instagram API Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack,
      }),
    }
  }
}

// Upload to Cloudinary function
async function uploadToCloudinary(imageBlob, cloudName, apiKey, apiSecret) {
  const FormData = require('form-data')

  // Convert base64 to buffer
  const base64Data = imageBlob.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const form = new FormData()
  form.append('file', buffer, { filename: 'instagram-image.png' })
  form.append('upload_preset', 'rdv_news') // Your existing preset

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: form,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudinary upload failed: ${errorText}`)
  }

  const result = await response.json()
  return result.secure_url
}

// Publish Instagram Post (Feed)
async function publishInstagramPost(imageUrl, caption, accountId, accessToken) {
  console.log('📱 Publishing Instagram Post to Radio del Volga...')

  // Step 1: Create media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    }
  )

  if (!containerResponse.ok) {
    const error = await containerResponse.json()
    console.error('Container creation failed:', error)
    throw new Error(
      `Container creation failed: ${error.error?.message || 'Unknown error'}`
    )
  }

  const containerData = await containerResponse.json()
  console.log('✅ Media container created:', containerData.id)

  // Step 2: Publish the container
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    }
  )

  if (!publishResponse.ok) {
    const error = await publishResponse.json()
    console.error('Publishing failed:', error)
    throw new Error(
      `Publishing failed: ${error.error?.message || 'Unknown error'}`
    )
  }

  const publishData = await publishResponse.json()
  console.log('✅ Instagram Post published to Radio del Volga:', publishData.id)

  return publishData
}

// Publish Instagram Story
async function publishInstagramStory(imageUrl, accountId, accessToken) {
  console.log('📱 Publishing Instagram Story to Radio del Volga...')

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        media_type: 'STORIES',
        access_token: accessToken,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.error('Story creation failed:', error)
    throw new Error(
      `Story creation failed: ${error.error?.message || 'Unknown error'}`
    )
  }

  const data = await response.json()
  console.log('✅ Instagram Story published to Radio del Volga:', data.id)

  return data
}
