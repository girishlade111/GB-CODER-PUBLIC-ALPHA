const { sendStatusPage, wantsStatusHtml } = require('./_lib/status-response.cjs')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      if (wantsStatusHtml(req)) return sendStatusPage(res, 503)
      return res.status(503).json({ error: 'Share/Preview storage is not configured (missing Upstash Redis credentials).' })
    }

    const { Redis } = require('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    const { id } = req.query
    if (!id || id.length !== 8) {
      if (wantsStatusHtml(req)) return sendStatusPage(res, 400)
      return res.status(400).json({ error: 'Invalid preview ID' })
    }

    const data = await redis.get(`preview:${id}`)
    if (!data) {
      if (wantsStatusHtml(req)) return sendStatusPage(res, 404)
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
    if (wantsStatusHtml(req)) return sendStatusPage(res, 500)
    return res.status(500).json({ error: 'Failed to load preview. Try again.' })
  }
}
