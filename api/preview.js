module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  try {
    const { Redis } = require('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    const { id } = req.query
    if (!id || id.length !== 8) {
      return res.status(400).json({ error: 'Invalid preview ID' })
    }

    const data = await redis.get(`preview:${id}`)
    if (!data) {
      return res.status(404).json({ error: 'Preview not found or expired' })
    }

    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return res.status(200).json({
      html: parsed.html || '',
      css: parsed.css || '',
      javascript: parsed.javascript || ''
    })

  } catch (error) {
    console.error('[api/preview] Error:', error.message)
    return res.status(500).json({ error: 'Failed to load preview. Try again.' })
  }
}
