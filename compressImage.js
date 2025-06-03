const http = require('http');
const https = require('https');
const sharp = require('sharp');

const REMOTE_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';

http.createServer((req, res) => {
  if (req.url === '/image') {
    https.get(REMOTE_IMAGE_URL, (remoteRes) => {
        remoteRes._readableState.highWaterMark = 32 * 1024;
      res.writeHead(200, {
        'Content-Type': remoteRes.headers['content-type'],
      });

      // Log chunks coming from remote response
      remoteRes.on('data', (chunk) => {
        console.log(`⬇️ Received chunk from remote: ${chunk.length} bytes`);
      });

      // Create a transform stream with sharp
      const transform = sharp().resize(200);

      // Log chunks coming out of sharp
      transform.on('data', (chunk) => {
        console.log(`⬆️ Sent chunk from sharp: ${chunk.length} bytes`);
      });

      // Pipe remote data -> sharp -> response
      remoteRes.pipe(transform).pipe(res);

      // Error handling
      remoteRes.on('error', (err) => {
        console.error('Error fetching remote image:', err);
        res.statusCode = 500;
        res.end('Error fetching remote image');
      });
      transform.on('error', (err) => {
        console.error('Error processing image:', err);
        res.statusCode = 500;
        res.end('Error processing image');
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
