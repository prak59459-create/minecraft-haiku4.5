import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export function start() {
  app.listen(PORT, () => {
    console.log(`Minecraft server running at http://localhost:${PORT}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
