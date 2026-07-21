const path = require('path');
const fs = require('fs');

// Detectar si estamos en runtime compartido (Windows) o standalone (Mac)
const isSharedRuntime = process.env.HEMATOLOGIA_SHARED_RUNTIME === 'true';
const runtimePath = isSharedRuntime 
  ? process.env.HEMATOLOGIA_RUNTIME_PATH 
  : path.join(__dirname, '..', '..', 'runtime');

let electron;

try {
  if (isSharedRuntime) {
    // Usa Electron del runtime compartido
    const runtimeElectron = path.join(runtimePath, 'node_modules', 'electron');
    electron = require(runtimeElectron);
  } else {
    // Usa Electron local (desarrollo/Mac)
    electron = require('electron');
  }
} catch (err) {
  console.error('Error cargando Electron:', err);
  process.exit(1);
}

const { app, BrowserWindow, Menu } = electron;

let mainWindow = null;
const appName = path.basename(__dirname);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false
  });

  mainWindow.loadFile('app.html');

  // Crear menú
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo Registro',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript('resetForm()');
          }
        },
        { type: 'separator' },
        {
          label: 'Exportar Datos',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.executeJavaScript('exportData()');
          }
        },
        {
          label: 'Importar Datos',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.executeJavaScript('importData()');
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Edición',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollo' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: `Acerca de ${appName}`,
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              alert('${appName} v1.0.0\\n\\nSistema de Gestión de Hematología\\n\\nAutor: Luis Alejandro Zúñiga Anchia');
            `);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
