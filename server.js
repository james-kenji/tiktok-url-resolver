const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 解析单个短链
async function resolveShortLink(shortUrl) {
  try {
    const response = await axios.head(shortUrl, {
      maxRedirects: 0,
      timeout: 10000,
      validateStatus: status => status < 400,
    });

    const finalUrl = response.headers.location || shortUrl;
    return { success: true, shortUrl, fullUrl: finalUrl };
  } catch (err) {
    console.error(`解析失败: ${shortUrl}`, err.message);
    return { success: false, shortUrl, error: "无法解析该短链" };
  }
}

// 批量解析接口
app.post('/api/resolve', async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "请提供有效的短链数组" });
  }

  const results = [];

  for (const link of links) {
    const result = await resolveShortLink(link);
    results.push(result);
  }

  res.json({ results });
});

// 测试接口
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '短链解析服务已启动' });
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 解析服务已启动：http://localhost:${PORT}`);
});
app.get('/health', (req, res) => {
  res.send('OK');
});