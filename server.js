/**
 * VirtualCasino — Servidor de demostración
 * ------------------------------------------------
 * Un único archivo, SOLO usa módulos nativos de Node.js.
 * No necesita "npm install" ni bases de datos externas:
 * los datos viven en memoria mientras el servidor está prendido.
 *
 * Para correrlo: node server.js
 * Luego abrir: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---------- "Base de datos" en memoria ----------
const users = new Map(); // email -> { id, email, passwordHash, salt, balance }
const tokens = new Map(); // token -> email

// Usuario de prueba ya cargado para poder entrar sin registrarse
seedUser('demo@casino.com', 'demo1234', 500);

function seedUser(email, password, balance) {
  const { salt, hash } = hashPassword(password);
  users.set(email, {
    id: crypto.randomUUID(),
    email,
    passwordHash: hash,
    salt,
    balance,
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  return hash === expectedHash;
}

// ---------- Motor del tragamonedas (mismo patrón que el backend "real") ----------
const SYMBOLS = ['CHERRY', 'LEMON', 'BELL', 'CHOCO', 'SEVEN'];
const WEIGHTS = [40, 30, 15, 10, 5];
const PAYOUTS = { CHERRY: 2, LEMON: 3, BELL: 5, CHOCO: 10, SEVEN: 50 };

function spinReel() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let roll = crypto.randomInt(0, total);
  for (let i = 0; i < SYMBOLS.length; i++) {
    if (roll < WEIGHTS[i]) return SYMBOLS[i];
    roll -= WEIGHTS[i];
  }
  return SYMBOLS[0];
}

// ---------- Helpers HTTP ----------
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function getUserFromRequest(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  const email = tokens.get(token);
  if (!email) return null;
  return users.get(email);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('No encontrado');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

// ---------- Servidor ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    // ----- API -----
    if (url.pathname === '/api/registro' && req.method === 'POST') {
      const { email, password } = await readBody(req);
      if (!email || !password || password.length < 6) {
        return sendJson(res, 400, { error: 'Email y contraseña (mín. 6 caracteres) son obligatorios' });
      }
      if (users.has(email)) {
        return sendJson(res, 409, { error: 'Ese email ya está registrado' });
      }
      const { salt, hash } = hashPassword(password);
      users.set(email, { id: crypto.randomUUID(), email, passwordHash: hash, salt, balance: 500 });
      return sendJson(res, 201, { ok: true });
    }

    if (url.pathname === '/api/login' && req.method === 'POST') {
      const { email, password } = await readBody(req);
      const user = users.get(email);
      if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
        return sendJson(res, 401, { error: 'Email o contraseña incorrectos' });
      }
      const token = crypto.randomBytes(24).toString('hex');
      tokens.set(token, email);
      return sendJson(res, 200, { token, balance: user.balance });
    }

    if (url.pathname === '/api/saldo' && req.method === 'GET') {
      const user = getUserFromRequest(req);
      if (!user) return sendJson(res, 401, { error: 'No autenticado' });
      return sendJson(res, 200, { balance: user.balance });
    }

    if (url.pathname === '/api/girar' && req.method === 'POST') {
      const user = getUserFromRequest(req);
      if (!user) return sendJson(res, 401, { error: 'No autenticado' });

      const { stake } = await readBody(req);
      const amount = Number(stake);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: 'Apuesta inválida' });
      if (amount > user.balance) return sendJson(res, 400, { error: 'Saldo insuficiente' });

      user.balance -= amount;

      const reels = [spinReel(), spinReel(), spinReel()];
      let payout = 0;
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        payout = amount * PAYOUTS[reels[0]];
      }
      user.balance += payout;

      return sendJson(res, 200, { reels, stake: amount, payout, balance: user.balance });
    }

    // ----- Archivos estáticos (frontend) -----
    let filePath = url.pathname === '/' ? '/login.html' : url.pathname;
    filePath = path.join(PUBLIC_DIR, filePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Prohibido');
    }
    return serveStatic(req, res, filePath);
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: 'Error interno del servidor' });
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  VirtualCasino corriendo ✅');
  console.log('  Abrí tu navegador en: http://localhost:' + PORT);
  console.log('  Usuario de prueba ya cargado -> email: demo@casino.com | contraseña: demo1234');
  console.log('');
});
