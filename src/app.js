const { dialog, app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLocalshortcut = require('electron-localshortcut');
const isDev = require('electron-is-dev');

//* Now kindly fuck off
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('force_high_performance_gpu');

const defaultIcon = './build/icon.ico';
const closeDialog = {
	type: 'none',
	title: 'Deadshot Client',
	buttons: ['Yes', 'No'],
	icon: defaultIcon,
	message: 'Would you like to close Deadshot?'
};

let mainWindow;
const gameWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1920 * 0.8,
		height: 1080 * 0.8,
		title: 'Deadshot Client',
		icon: defaultIcon,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false
		}
	});
	mainWindow.webContents.send('load', { isDev });
	console.log(isDev)
	//mainWindow.webContents.toggleDevTools();
	mainWindow.loadURL('https://deadshot.io/');

	mainWindow.removeMenu();
}
let splash;
const splashWindow = () => {
	splash = new BrowserWindow({
		width: 1024,
		height: 600,
		center: true,
		skipTaskbar: false,
		icon: './build/icon.ico',
		alwaysOnTop: true,
		resizable: false,
		frame: false,
		transparent: true
	});
	splash.loadURL(`file://${__dirname}/../public/splash.html`);
	splash.removeMenu();
}

const load = () => {
	splashWindow();
	setTimeout(() => {
		let interval = setInterval(() => {
			splash.setOpacity(splash.getOpacity() - 0.05);
			if (splash.getOpacity() < 0.1) {
				splash.close();
				clearInterval(interval);
			}
		}, 10);
		open();
	}, 1000);
}

const open = () => {
	gameWindow();

	electronLocalshortcut.register(mainWindow, 'F5', () => {
		if (!mainWindow.isFocused()) return;
		mainWindow.webContents.reload();
		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.webContents.send('load', { isDev });
		});
	});
	electronLocalshortcut.register(mainWindow, 'F11', () => {
		if (!mainWindow.isFocused()) return;
		mainWindow.fullScreen = !mainWindow.fullScreen;
	});
	electronLocalshortcut.register(mainWindow, 'F12', () => {
		if (!mainWindow.isFocused()) return;
		mainWindow.webContents.toggleDevTools();
	});
	electronLocalshortcut.register(mainWindow, 'Escape', async () => {
		if (!mainWindow.isFocused()) return;
		let test = await dialog.showMessageBox(closeDialog);
		if (test.response === 0) app.quit();
	});
}


app.once('ready', () => {
	load();
	const { updateActivity } = require('./rpcHandler.js');
	ipcMain.handle('rpcData', (e, arg) => updateActivity(arg));
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', () => {
	electronLocalshortcut.unregisterAll();
});