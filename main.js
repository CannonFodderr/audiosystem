const { app, BrowserWindow } = require('electron')
const server = require('./server/server');
const env = require('dotenv').config();
app.commandLine.appendSwitch('ignore-certificate-errors');

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({ 
        width: 800, 
        height: 600,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: true,
        webPreferences: {
            webSecurity: false,
            allowDisplayingInsecureContent: true,
            allowRunningInsecureContent: true
        }
    })
    let url = `https://${process.env.HOST}:${process.env.PORT}/status`;
    win.loadURL(url);
    win.focus();

    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });

}

app.on('ready', createWindow);



app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
});