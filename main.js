const { app, BrowserWindow, Tray, Menu, dialog } = require('electron')
const server = require('./server/server');
const env = require('dotenv').config();
const ip = require('ip')
let localIP = ip.address();
// Get localhost ip

app.commandLine.appendSwitch('ignore-certificate-errors');
let appIcon = null;
function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({ 
        width: 400, 
        height: 150,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: false,
        webPreferences: {
            webSecurity: false,
            allowDisplayingInsecureContent: true,
            allowRunningInsecureContent: true
        }
    });
    win.setMenu(null);
    // win.webContents.openDevTools()
    appIcon = new Tray(__dirname + '/favicon.ico');
    let contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click:  function(){
            app.isQuiting = false;
            win.show();
        } },
        { label: 'Quit', click:  function(){
            app.isQuiting = true;
            app.quit();
        } }
    ]);
    appIcon.setContextMenu(contextMenu);
    win.on('minimize',function(event){
        event.preventDefault();
        win.hide();
        return false;
    });
    
    win.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            win.hide();
        }
        return false;
    });
    require('./server/db/connect').then((isConnected) => {
        if(!isConnected){
            dialog.showErrorBox('DB ERROR', "Check if MongoDB service is running");
            app.isQuiting = true;
            app.quit()
        } else {
            win.loadFile(__dirname + '/index.html');
        }
        win.focus();
    });
    appIcon.setToolTip('Audio System Server');
    appIcon.on('click', () => {
        win.show(); 
        win.focus()
    })
}

app.on('ready', createWindow);

server.listen(8080, localIP, () => {
    console.log(`Serving on ${localIP}:8080`);
});