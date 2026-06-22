// server.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// SME API Base URL
const SME_API_URL = 'https://smeapi.com.ng/api'

// Proxy middleware - forward requests to SME API
app.use('/api/sme/*', async (req, res) => {
  try {
    const targetUrl = `${SME_API_URL}${req.params[0]}`
    const apiKey = process.env.VITE_SME_API_KEY

    console.log(`🔄 Proxying ${req.method} request to: ${targetUrl}`)

    const options = {
      method: req.method,
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }

    // Add body for POST requests
    if (req.method === 'POST') {
      options.body = JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, options)
    const data = await response.json()

    console.log(`✅ Response from SME API:`, data.status || data.Status || 'success')

    res.status(response.status).json(data)
  } catch (error) {
    console.error('❌ Proxy error:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Proxy error'
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SME Proxy is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 SME Proxy running on http://localhost:${PORT}`)
  console.log(`📡 Proxying requests to: ${SME_API_URL}`)
})