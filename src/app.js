const { dialog, globalShortcut, app, BrowserWindow } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');

const defaultIcon = './build/icon.ico';
const closeDialog = {
	type: 'none',
	title: 'Deadshot Client',
	buttons: ['Yes', 'No'],
	icon: defaultIcon,
	message: 'Would you like to close Deadshot?'
};

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: 'Deadshot Client',
		icon: defaultIcon
	});
	mainWindow.loadURL('https://deadshot.io/');

	mainWindow.removeMenu();
}

function main() {
	createWindow();

	electronLocalshortcut.register(mainWindow, ['CommandOrControl+R', 'F5'], () => {
		if (!mainWindow.isFocused()) return;
		mainWindow.webContents.reload();
	});
	electronLocalshortcut.register(mainWindow, ['CommandOrControl+F', 'F11'], () => {
		if (!mainWindow.isFocused()) return;
		mainWindow.fullScreen = !mainWindow.fullScreen;
	});
	electronLocalshortcut.register(mainWindow, 'Escape', async () => {
		if (!mainWindow.isFocused()) return;
		let test = await dialog.showMessageBox(closeDialog);
		if (test.response === 0) app.quit();
	});
}

app.once('ready', () => {
	main();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
});