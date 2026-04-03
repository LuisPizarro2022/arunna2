const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const APP_PORT = 3000;
const APP_URL = `http://127.0.0.1:${APP_PORT}`;
let serverProcess = null;

function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Next.js server startup timeout'));
          return;
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

function startNextServer() {
  if (serverProcess) return;

  const appPath = app.getAppPath();
  const nextBin = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');
  const isDev = !app.isPackaged;
  const args = [nextBin, isDev ? 'dev' : 'start', '-p', String(APP_PORT)];

  serverProcess = spawn(process.execPath, args, {
    cwd: appPath,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: isDev ? 'development' : 'production'
    },
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[next] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[next] ${d}`));
  serverProcess.on('exit', (code) => {
    console.log(`Next server exited: ${code}`);
    serverProcess = null;
  });
}

async function createWindow() {
  startNextServer();

  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  try {
    await waitForServer(APP_URL);
    await win.loadURL(APP_URL);
  } catch (error) {
    dialog.showErrorBox(
      'PixelMouse startup failed',
      `Could not start local server on ${APP_URL}.\n\n${error.message}`
    );
    app.quit();
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});
