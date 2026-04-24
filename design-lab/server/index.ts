import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import chatRouter from './routes/chat'
import uploadRouter from './routes/upload'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }))
app.use(express.json({ limit: '1mb' }))

// Rate limiting on chat endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, please try again in a minute.' },
})

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/chat', chatLimiter, chatRouter)
app.use('/api/upload', uploadRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: process.env.LLM_PROVIDER || 'claude' })
})

app.listen(PORT, () => {
  console.log(`SwagPrint API server running on http://localhost:${PORT}`)
  console.log(`LLM Provider: ${process.env.LLM_PROVIDER || 'claude'}`)
})
