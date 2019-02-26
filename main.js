const { app, BrowserWindow, Tray, Menu } = require('electron')
const server = require('./server/server');
const env = require('dotenv').config();
app.commandLine.appendSwitch('ignore-certificate-errors');
let appIcon = null;
function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({ 
        width: 400, 
        height: 120,
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
    
    appIcon = new Tray('favicon.ico');
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
    win.loadFile(__dirname + '/index.html')
    win.focus();

    
    
    appIcon.setToolTip('Audio System Server');

}

app.on('ready', createWindow);