const { app, BrowserWindow } = require('electron')
const server = require('../server/server');

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
    let url = `https://${process.env.HOST}:${process.env.PORT}/`;
    win.loadURL(url);
    win.focus();
}

app.on('ready', createWindow);