
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require("fs")
const path = require("path")
const homedir = require('os').homedir();
const child_process = require('child_process')
const fetch = require("node-fetch")
const http = require("http")
const url = require('url');
var httpListener = function(){}
try {
    /**
    http.createServer(function(req,res) {
        if (typeof httpListener == "function") {httpListener(req,res)}
    }).listen(7964)
     */
} catch(e) {
    console.error(e)
}

const CALAMARI_API_LOCATION = "/Users/Shared/Calamari"
const DEFAULT_CAPPS_LOCATION = path.join(homedir,"Documents","CalamariApps")
const JELLYFISH_DATA_DIR = path.join(homedir,"Documents","Jellyfish")

global.CALAMARI_API_LOCATION = CALAMARI_API_LOCATION
global.DEFAULT_CAPPS_LOCATION = DEFAULT_CAPPS_LOCATION
global.JELLYFISH_DATA_DIR = JELLYFISH_DATA_DIR

function createWindow () {
    
    if (!fs.existsSync(path.join(DEFAULT_CAPPS_LOCATION,"CalamariHookHelperTool"))) {
        var installCalamari = dialog.showMessageBoxSync({
            type: "error",
            buttons: ["Full Install","Yes","No, quit."],
            defaultId: 2,
            message: "CalamariHooker not installed",
            detail: "CalamariHooker is not installed, would you like to install it now?\n\n",
        })
        console.log(installCalamari)
        if (installCalamari > 1 || installCalamari < 0) return process.exit();
        if (installCalamari == 1) {
            child_process.execSync(`rm -rf "${DEFAULT_CAPPS_LOCATION}";mkdir "${DEFAULT_CAPPS_LOCATION}";cd ${DEFAULT_CAPPS_LOCATION}; curl https://cdn.calamari.cc/Dependencies.zip > deps.zip;unzip deps.zip;rm -rf deps.zip __MACOSX;`)
            return createWindow()
        }
        if (installCalamari == 0) {
            child_process.execSync(`rm -rf "${DEFAULT_CAPPS_LOCATION}";mkdir "${DEFAULT_CAPPS_LOCATION}";cd ${DEFAULT_CAPPS_LOCATION};curl https://cdn.calamari.cc/C-M.zip > C-M.zip; curl https://cdn.calamari.cc/Dependencies.zip > deps.zip; unzip C-M.zip;unzip deps.zip;rm -rf C-M.zip deps.zip __MACOSX;`)
            return createWindow()
        }
    }
    if (dialog.showMessageBoxSync({
        buttons: ["No","Yes"],
        defaultId: 1,
        message: "PLEASE READ",
        detail: "Jellyfish is only to be used on games that you have explicit permission to run a LSI on.\n\nAre you intending to use Jellyfish to inject into games you are not the owner of, or do not have permission from the owner to run a LSI on?",
    }) == 1) {
        return process.exit()
    }
    if (!fs.existsSync(CALAMARI_API_LOCATION)) {
        fs.mkdirSync(CALAMARI_API_LOCATION)
    }
    
    
    // Create the browser window.
    const win = new BrowserWindow({
        width: 768,
        height: 585,
        show:false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    global.win = win
    ipcMain.on('inject-button-click',require("./inject"))
    ipcMain.on('check-creds',require("./inject").checkCreds)
    
    var tmin = 0
    ipcMain.on('set-topmost', (event,arg) => {
        win.setAlwaysOnTop(arg, "floating");
        win.setVisibleOnAllWorkspaces(arg);
        win.setFullScreenable(!arg);
    })
    ipcMain.on('run-script', async (event, arg) => {
        fs.writeFileSync(path.join(CALAMARI_API_LOCATION,"input.txt"),"0" + arg)
    })


    var lastUpdate = 0
    if (!fs.existsSync(path.join(CALAMARI_API_LOCATION,"input.txt"))) {
        fs.writeFileSync(path.join(CALAMARI_API_LOCATION,"input.txt"),"")
    }
    function watch() {
        fs.watch(path.join(CALAMARI_API_LOCATION,"input.txt")).on("change",() => {
            if (process.uptime() - lastUpdate > 0.01) {
                console.log("noooo! you cant just have an icon spin as confirmation")
                win.webContents.send("script-ran")
                watch()
            }
            lastUpdate = process.uptime()
        })
    }
    watch()
    if (!fs.existsSync(JELLYFISH_DATA_DIR)) {
        fs.mkdirSync(JELLYFISH_DATA_DIR)
    }
    if (!fs.existsSync(path.join(JELLYFISH_DATA_DIR,"Scripts"))) {
        fs.mkdirSync(path.join(JELLYFISH_DATA_DIR,"Scripts"))
        console.log(child_process.execSync(`cd ${path.join(JELLYFISH_DATA_DIR,"Scripts")};curl http://thelmgn.com/jellyfish/Jellyfish_Default_Scripts.zip > default.zip;unzip default.zip; rm default.zip`).toString())
    }
    if (!fs.existsSync(path.join(JELLYFISH_DATA_DIR,"Config"))) {
        fs.mkdirSync(path.join(JELLYFISH_DATA_DIR,"Config"))
    }
    var key = ""
    
    function traverse(ckey,evt) {
        var scriptsDir = path.join(JELLYFISH_DATA_DIR,"Scripts")
        var walker = require("walker")(scriptsDir)
        walker.filterDir(() => {return key == ckey})
        walker.on("file", function(file,stat) {
            evt.reply('script-found',[key,scriptsDir,file])
        })
    }
    ipcMain.on("startCrawl",(evt,ckey) => {
        key = ckey
        traverse(key,evt)
    })
    
    // and load the index.html of the app.
    win.loadFile('www/index.html')
    win.webContents.on('new-window', function(event, url){
        event.preventDefault();
        child_process.spawn("open", [url])
    });
    
    win.once('ready-to-show', () => {

        setTimeout(async function() {
            win.show()
            win.webContents.setZoomFactor(1);
            win.webContents.setVisualZoomLevelLimits(1, 1);
            httpListener = function(req,res) {
                var queryObject = url.parse(req.url,true).query;
                console.log(queryObject)
                win.webContents.send("http-request",queryObject)
            }
            try {
                var j = await (await fetch("https://api.github.com/repos/thelmgn/Jellyfish/releases")).json()
                var cv = require("./package.json").version
                var nv = j[0].tag_name
                console.log(j[0].tag_name,cv)
                if (cv != nv) {
                    console.log("diff vers")
                    var update = dialog.showMessageBoxSync(win,{
                        buttons: ["No","Yes"],
                        defaultId: 1,
                        message: "Not latest version",
                        detail: `The latest version of Jellyfish is ${nv}, you're running ${cv}, would you like to update now?\n\nChangelog:\n${j[0].body}`,
                    })
                    if (update) {
                        child_process.spawn("open", [j[0].assets[0].browser_download_url])
                    }
                }
            } catch(e) {
                console.error(e)
            }
            //win.webContents.setLayoutZoomLevelLimits(0, 0);
        },300)
    })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
    app.quit()
})
