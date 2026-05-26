module.exports = async (req, res) => {
  // CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { 
    return res.status(405).json({ error: 'Method not allowed' }) 
  }

  try {
    // Safe body parsing — handles both pre-parsed and string body
    let body
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body)
    } else if (typeof req.body === 'object' && req.body !== null) {
      body = req.body  // already parsed (Express or Vercel with bodyParser)
    } else {
      // Raw stream — read manually
      const chunks = []
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
      }
      body = JSON.parse(Buffer.concat(chunks).toString())
    }

    const { html = '', css = '', javascript = '' } = body

    // Validate: at least one panel must have content
    if (!html.trim() && !css.trim() && !javascript.trim()) {
      return res.status(400).json({ error: 'Cannot share an empty project' })
    }

    // Redis client — initialized INSIDE handler
    const { Redis } = require('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    // Generate short ID
    const crypto = require('crypto')
    const shortId = crypto.randomBytes(6).toString('base64url').slice(0, 8)

    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.headers['x-real-ip'] || 
               'unknown'
    const rateLimitKey = `ratelimit:share:${ip}`
    const currentCount = await redis.get(rateLimitKey)
    
    if (currentCount && parseInt(currentCount) >= 10) {
      return res.status(429).json({ 
        error: 'Too many shares. Try again in an hour.' 
      })
    }

    // Store code in Redis with 30-day TTL
    await redis.set(
      `preview:${shortId}`,
      JSON.stringify({ html, css, javascript, createdAt: Date.now() }),
      { ex: 2592000 }
    )

    // Increment rate limit counter
    await redis.set(rateLimitKey, (parseInt(currentCount || '0') + 1).toString(), { ex: 3600 })

    return res.status(200).json({
      id: shortId,
      url: `https://code.ladestack.in/preview/${shortId}`
    })

  } catch (error) {
    console.error('[api/share] Error:', error.message)
    console.error('[api/share] Stack:', error.stack)
    return res.status(500).json({ 
      error: 'Failed to save preview. Try again.' 
    })
  }
}
