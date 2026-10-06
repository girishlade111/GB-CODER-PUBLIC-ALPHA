/**
 * Ceiling on the raw request body, and on the payload actually stored.
 *
 * The stored value is well under Redis's 512 MB value limit, so a share always
 * fits; the point is to fail fast with a 413 instead of deep inside a write on
 * someone else's bill.
 */
const MAX_BODY_BYTES = 8 * 1024 * 1024
const MAX_PAYLOAD_BYTES = 6 * 1024 * 1024

module.exports = async (req, res) => {
  const { clientIp } = require('./_client-ip')

  // CORS headers first.
  //
  // `*` is deliberate: a share link is meant to be creatable from anywhere, and
  // nothing here reads authenticated state. The write is unauthenticated, which is
  // why the rate limit below and the size caps further down are load-bearing
  // rather than optional.
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
      // Raw stream — read manually, and bounded.
      //
      // Unbounded was the problem: this endpoint is open to the whole internet and
      // stores whatever arrives for 30 days, so without a cap a single streamed
      // request is free persistent storage on the operator's Redis bill.
      const chunks = []
      let size = 0
      for await (const chunk of req) {
        const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        size += buffer.length
        if (size > MAX_BODY_BYTES) {
          res.status(413).end(JSON.stringify({ error: 'Project too large to share.' }))
          return
        }
        chunks.push(buffer)
      }
      body = JSON.parse(Buffer.concat(chunks).toString())
    }

    const { html = '', css = '', javascript = '' } = body

    // Validate: at least one panel must have content
    if (!html.trim() && !css.trim() && !javascript.trim()) {
      return res.status(400).json({ error: 'Cannot share an empty project' })
    }

    /*
     * Size caps on what actually gets stored.
     *
     * Redis rejects values over 512 MB, so without this a large-but-accepted body
     * fails at the last step with an opaque 500. Checking up front turns that into
     * a 413 the client can act on. The generous ceiling covers a real multi-file
     * project while staying well inside the platform's request limit.
     */
    const totalBytes = Buffer.byteLength(html) + Buffer.byteLength(css) + Buffer.byteLength(javascript)
    if (totalBytes > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({
        error: `Project is too large to share (${(totalBytes / 1024 / 1024).toFixed(1)} MB).`,
      })
    }

    // Redis client — initialized INSIDE handler
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(503).json({ error: 'Share storage is not configured (missing Upstash Redis credentials).' })
    }

    const { Redis } = require('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    // Generate short ID
    const crypto = require('crypto')
    const shortId = crypto.randomBytes(6).toString('base64url').slice(0, 8)

    // Rate limiting.
    //
    // Keyed on the socket address rather than X-Forwarded-For off Vercel — see
    // api/_client-ip.js. The previous version preferred the header unconditionally,
    // which off Vercel let a caller mint a fresh bucket per request by varying it.
    const ip = clientIp(req)
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
