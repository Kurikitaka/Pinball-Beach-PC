// Pinball Playa - version de escritorio (Windows). Sirve el juego en localhost y lo abre en una ventana.
const { app, BrowserWindow, Menu, screen } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.wav': 'audio/wav', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };

function startServer(cb) {
  const root = path.join(__dirname, 'www');
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    const f = path.normalize(path.join(root, p));
    if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404); return res.end('No encontrado'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  srv.listen(0, '127.0.0.1', () => cb(srv.address().port));
}

function createWindow(port) {
  const wa = screen.getPrimaryDisplay().workAreaSize;
  const ratio = 1667 / 3356;
  const h = Math.min(Math.floor(wa.height * 0.94), 1100);
  const w = Math.floor(h * ratio);
  const win = new BrowserWindow({
    width: w, height: h, useContentSize: true, backgroundColor: '#06182c', title: 'Pinball Playa',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'www', 'img', 'icon-512.png'),
    webPreferences: { autoplayPolicy: 'no-user-gesture-required', backgroundThrottling: false }
  });
  Menu.setApplicationMenu(null);
  win.setAspectRatio(ratio);
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.loadURL('http://127.0.0.1:' + port + '/index.html');
  return win;
}

app.whenReady().then(() => startServer((port) => createWindow(port)));
app.on('window-all-closed', () => app.quit());
