require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

const PORT = 7860;
const target = process.env.BASE_URL || 'https://api.openai.com'
const keys = process.env.KEY_POOL?.split(',')
const pass = process.env.PASSWORD

const apiProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  onProxyReq: (proxyReq, res) => {
    try {
      if (res.headers?.authorization === 'Bearer ' + pass) {
        proxyReq.setHeader('Authorization', 'Bearer ' + getRandomItem(keys))
      } else {
        proxyReq.setHeader('Authorization', res.headers?.authorization)
      }
    } catch (error) {
      console.log(error)
    }
  },
});

function getRandomItem(arr) {
  if (arr.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

app.get("/", (req, res) => {
  res.json({
    success: true
  })
});

app.use(cors());
app.use('/', apiProxy);

app.listen(PORT, () => {
  console.log(`Reverse proxy server running`);
});
