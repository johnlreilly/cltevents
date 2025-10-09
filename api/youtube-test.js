// Test endpoint to check YouTube API configuration
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  // Check if API key exists
  if (!YOUTUBE_API_KEY) {
    return res.status(200).json({
      status: 'error',
      message: 'YOUTUBE_API_KEY environment variable is not set',
      hasKey: false
    });
  }

  // Check API key format (should be 39 characters)
  const keyInfo = {
    hasKey: true,
    keyLength: YOUTUBE_API_KEY.length,
    keyPrefix: YOUTUBE_API_KEY.substring(0, 8) + '...',
    expectedLength: 39
  };

  // Try a simple YouTube API request
  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(testUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        status: 'error',
        message: 'YouTube API request failed',
        keyInfo,
        httpStatus: response.status,
        errorDetails: data
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'YouTube API is working correctly',
      keyInfo,
      testResult: 'Successfully fetched test video'
    });

  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: 'Error making YouTube API request',
      keyInfo,
      error: error.message
    });
  }
}
