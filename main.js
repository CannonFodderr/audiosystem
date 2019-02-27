const { app, BrowserWindow, Tray, Menu } = require('electron')
const server = require('./server/server');
const env = require('dotenv').config();

var os = require('os');
var ifaces = os.networkInterfaces();

// Get localhost ip
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        
        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
        }
        ++alias;
    });
});

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
    win.loadFile(__dirname + '/index.html')
    win.focus();
    
    
    
    appIcon.setToolTip('Audio System Server');
    
}

app.on('ready', createWindow);