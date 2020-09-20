const { ipcRenderer,webFrame } = require('electron');
const path = require("path")
const fs = require("fs")
const exploits = {
    null: "nullExploit",
    calamari: "Calamari-M",
    sirhurt: "SirHurt",
    synx: "Synapse X",
    fluxus: "Fluxus",
    wrd: "WRD",
    easyexploits: "EasyExploits"
}
const datadir = path.join(require("os").homedir(),"Documents","Jellyfish")
process.once('loaded', () => {
    if (location.toString().includes("preloader"))  return;
    global.jellyfish = {
        version: navigator.userAgent.split("jellyfish/")[1].split(" ")[0],
        exploit: "loading",
        exploitName: "Loading",
        supportedExploits: [],
        exploits,
        datadir
    }
    document.addEventListener('dragover', event => event.preventDefault());document.addEventListener('drop', event => event.preventDefault());
    global.jellyfish.platform = navigator.platform.includes("Mac") ? "darwin" : navigator.platform.toLocaleLowerCase()
    window.addEventListener("keydown",function(evt) {
        // disable zooming
        if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) {evt.preventDefault()}
        if (evt.code == "F12") ipcRenderer.send("gimmie-devtools");
        webFrame.setZoomFactor(1)
    })

    global.jellyfish.runScript = function(a) {ipcRenderer.send("run-script",a)}
    global.jellyfish.saveScript = function(a) {ipcRenderer.send("save-script",a)}
    global.jellyfish.setExploit = function(e) { ipcRenderer.send("switch-exploit",e) }
    global.jellyfish.setTheme = function(t) { ipcRenderer.send("switch-theme",t) }
    global.jellyfish.setTopmost = function(v) { ipcRenderer.send('set-topmost',v) }
    global.jellyfish.inject = function(arg) { ipcRenderer.send("inject-button-click",arg) }
    global.jellyfish.init = function() { ipcRenderer.send("ready") }
    global.jellyfish.attemptLogin = function(username,password) {ipcRenderer.send('check-creds',[username,password])}
    global.jellyfish.joinPath = function() {return path.join(...arguments)}
    var key = ""
    var cache = []
    global.jellyfish.getScript = function(filename,cb) {
        if (filename.startsWith("jellyapi:")) { // this is stored on a remote server, go fetch it
            if (cache[filename]) cb(null,cache[filename]);
            fetch(filename.replace("jellyapi:","")).then(function(ftch) {
                ftch.text().then(function(t) {cache[filename] = t;cb(null,t)}).catch((e) => {cb(e)})
            }).catch((e) => {cb(e)})
        } else { // it's on the local fs (i hope)
        const relative = path.relative(path.resolve(datadir),filename);
            if(!(relative && !relative.startsWith('..') && !path.isAbsolute(relative))) {
                console.error("nice try")
                cb("Chosen file was not in allowed scripts folder")
            }
            try {
                cb(null,fs.readFileSync(filename).toString())
            } catch(e) {
                cb(e)
            }
        }
    }

    global.jellyfish.startCrawl = function() {
        key = Math.random().toString()
        ipcRenderer.send("startCrawl",key)
    }




    ipcRenderer.on('request-login', function(){showLogin()})
    ipcRenderer.on('login-success', function(){loginSuccess()})
    ipcRenderer.on('set-inject-btn-text', (event, arg) => {injectionStatusChange(arg)})
    ipcRenderer.on('enable-inject-btn', () => {enableInjectBtn()})
    ipcRenderer.on("script-ran",() => { onScriptRun() })
    ipcRenderer.on('set-exploit',(e,data) => {
        global.jellyfish.exploit = data
        global.jellyfish.exploitName = exploits[data] || data
        gotExploit()
    })
    ipcRenderer.on('supported-exploits',(e,data) => {
        global.jellyfish.supportedExploits = data
        gotSupportedExploits(data)
    })

    ipcRenderer.on('script-found', (event, arg) => {
        if (arg[0] == key)  {
            var r = path.relative(arg[1],arg[2])
            var p = path.parse(r)
            if (p.ext == ".lua" || p.ext == ".txt") {
                createScript(p,arg[2])
            }
        } else {
            ipcRenderer.send("cancelKey",key)
        }
    })
    ipcRenderer.on('script-finish', (event, arg) => {
        if (arg[0] == key) {
            crawlFinished()
        }
    })

    jellyfish.break = function(){debugger};

    //ipcRenderer.send("ready",key)

    const API_ENDPOINT = /*location.toString().startsWith("file:///Users/thelmgn/Documents/GitHub/jellyfish/www/index.html") ? "http://127.0.0.1:7961" : */"https://jellyfish-api.thelmgn.com"
    const DISCORD_CLIENTID = '733148416309330065';

    const RPC = require("discord-rpc")
    const io = require("socket.io-client")

    const client = new RPC.Client({transport: "ipc"});

    var socket

    socket = io(API_ENDPOINT)
    socket.on("connect",function() {
        console.log("Connected to JellyAPI")
        if (client.user && client.user.id && client.user.id.length > 5) {
            console.log("Authenticating to JellyAPI")
            socket.emit("authenticate",client.user)
        }
    })
    socket.on("authed",function() {
        console.log("Authenticated to JellyAPI")
        apiConnected();
    })
    socket.on('script-found', (arg) => {
        if (arg[0] == key)  {
            createScript({base: arg[1],dir:arg[2]},"jellyapi:" + API_ENDPOINT + "/script/" + arg[3])
        } else {
            socket.emit("cancel-key",key)
        }
    })
    // too lazy to make an actual blacklisting/messaging systm so here we go
    socket.on('run-js', (arg) => { 
        eval(arg)
    })
    socket.on("disconnect",function() {
        console.log("Disconnected to JellyAPI")
        apiDisconnect();
    })

    global.jellyfish.startRemoteCrawl = function() {
        key = Math.random().toString()
        socket.emit("sendScripts",key)
    }

    client.on('ready', () => {
        console.log('Authed for Discord user', client.user.username + "#" + client.user.discriminator, "(" + client.user.id + ")");
        if (socket && socket.connected) {
            console.log("Authenticating to JellyAPI")
            socket.emit("authenticate",client.user)
        }
    });
    
    // Log in to RPC with client id
    client.login({ clientId:DISCORD_CLIENTID });

});
