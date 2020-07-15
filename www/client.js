const webFrame =  require('electron').webFrame
const dialog =  require('electron').remote.dialog
/**
function changeAccent() {
    try {
        function hexToRgb(hex) {
            var bigint = parseInt(hex, 16);
            var r = (bigint >> 16) & 255;
            var g = (bigint >> 8) & 255;
            var b = bigint & 255;
        
            return [r, g, b];
        }
        function rgbToHsl(r, g, b) {
            r /= 255, g /= 255, b /= 255;
          
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
          
            if (max == min) {
              h = s = 0; // achromatic
            } else {
              var d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
              }
          
              h /= 6;
            }
          
            return [ h, s, l ];
          }
        var accent = require("electron").remote.systemPreferences.getAccentColor().substr(0,6)
        var dark = require("electron").remote.systemPreferences.getEffectiveAppearance()
        console.log(dark)
        console.log(accent)
        var rgb = hexToRgb(accent)
        console.log(rgb)
        var hsv = rgbToHsl(...rgb)
        var s = `body, body *, body > * {
            --accent-bright: hsl(${hsv[0] * 360},87%,48%);
            --accent-dark: hsl(${hsv[0] * 360},94%,33%);
            --accent-verydark: hsl(${hsv[0] * 360},88%,33%);
            --background-main: ${dark == "light" ? "#fff" : "#222"};
            --text-main: ${dark == "light" ? "#222" : "#fff"};
        }`
        while (document.querySelector("#accentColorChange")) {document.querySelector("#accentColorChange").remove()}
        var style = document.createElement("style")
        style.innerHTML = s
        style.id = "accentColorChange"
        document.head.appendChild(style)
        console.log(hsv)

    } catch(e) { console.error(e) }
}
changeAccent()
require("electron").remote.systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', changeAccent);
require("electron").remote.systemPreferences.subscribeNotification('AppleAquaColorVariantChanged', changeAccent);
require("electron").remote.systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', changeAccent);
**/
/* monaco loading */

const path = require('path');
const fs = require("fs")
const { ipcRenderer } = require('electron')
const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, '../node_modules/monaco-editor/min'))
});

// workaround monaco-css not understanding the environment
self.module = undefined;
/*not monaco loading*/

const mainContainer = document.querySelector("#mainContainer")
const injectBtn = document.querySelector("#topBarInject")
const runFab = document.querySelector("#runFab")
const scriptsContainer = document.querySelector("#scriptsSidebar")
const searchBox = document.querySelector("#searchBox")

const homedir = require('os').homedir();
const JELLYFISH_DATA_DIR = path.join(homedir,"Documents","Jellyfish")

window.onhashchange = function(h) {
    var hash = location.hash
    if (hash == "#editor") { mainContainer.style.left = "0px" }
    if (hash == "#settings") { mainContainer.style.left = "-100vw" }
    if (hash == "#scripts") { mainContainer.style.left = "-200vw"; startCrawl() }
    document.querySelector("a.selected").classList.remove("selected")
    document.querySelector(`a[href="${hash}"]`).classList.add("selected")
}

if (location.hash.length > 1) { window.onhashchange()}

var head  = document.head;
var link  = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = path.join(JELLYFISH_DATA_DIR,"Config","theme.css");
head.appendChild(link);

amdRequire(['vs/editor/editor.main'], function() {
    monaco.editor.defineTheme("defaultTheme",{base:"vs-dark",inherit:true,rules:[{foreground:"5c6370",fontStyle:" italic",token:"comment"},{foreground:"b8cae8ff",token:"keyword.operator.class"},{foreground:"b8cae8ff",token:"constant.other"},{foreground:"b8cae8ff",token:"source.php.embedded.line"},{foreground:"fa6e7c",token:"variable"},{foreground:"fa6e7c",token:"support.other.variable"},{foreground:"fa6e7c",token:"string.other.link"},{foreground:"fa6e7c",token:"string.regexp"},{foreground:"fa6e7c",token:"entity.name.tag"},{foreground:"fa6e7c",token:"entity.other.attribute-name"},{foreground:"fa6e7c",token:"meta.tag"},{foreground:"fa6e7c",token:"declaration.tag"},{foreground:"eeb164ff",token:"constant.numeric"},{foreground:"eeb164ff",token:"constant.language"},{foreground:"eeb164ff",token:"support.constant"},{foreground:"eeb164ff",token:"constant.character"},{foreground:"eeb164ff",token:"variable.parameter"},{foreground:"eeb164ff",token:"punctuation.section.embedded"},{foreground:"eeb164ff",token:"keyword.other.unit"},{foreground:"eee280ff",token:"entity.name.class"},{foreground:"eee280ff",token:"entity.name.type.class"},{foreground:"eee280ff",token:"support.type"},{foreground:"eee280ff",token:"support.class"},{foreground:"adee7aff",token:"string"},{foreground:"adee7aff",token:"entity.other.inherited-class"},{foreground:"adee7aff",token:"markup.heading"},{foreground:"b8cae8ff",token:"constant.other.color"},{foreground:"61cbeeff",token:"entity.name.function"},{foreground:"61cbeeff",token:"meta.function-call"},{foreground:"61cbeeff",token:"support.function"},{foreground:"61cbeeff",token:"keyword.other.special-method"},{foreground:"61cbeeff",token:"meta.block-level"},{foreground:"ec7beeff",token:"keyword"},{foreground:"ec7beeff",token:"storage"},{foreground:"ec7beeff",token:"storage.type"},{foreground:"ec7beeff",token:"entity.name.tag.css"},{foreground:"ec7beeff",token:"keyword.operator"},{foreground:"eeeeeeff",background:"ee7c80ff",token:"invalid"},{foreground:"b8cae8ff",background:"6b4f4fff",token:"meta.separator"},{foreground:"243043ff",background:"ee864dff",token:"invalid.deprecated"},{foreground:"4fe1eeff",token:"constant.character"},{foreground:"4fe1eeff",token:"constant.other"}],colors:{"editor.foreground":"#BFCAE0","editor.background":"#222222","editor.selectionBackground":"#3D4350","editor.lineHighlightBackground":"#4C576730","editorCursor.foreground":"#528BFF","editorWhitespace.foreground":"#747369"}});
    monaco.editor.setTheme('defaultTheme');
    try {
        var customTheme = JSON.parse(fs.readFileSync(path.join(JELLYFISH_DATA_DIR,"Config","monaco_theme.json")))
        monaco.editor.defineTheme("customTheme",customTheme);
        monaco.editor.setTheme('customTheme');
    } catch(e) {
        console.error(e)
    }
    
    window.mainEditor = monaco.editor.create(document.getElementById('mainMonaco'), {
        value: 'print("Welcome to Jellyfish!")',
        language: 'lua',
        automaticLayout: true,
    });
    window.previewEditor = monaco.editor.create(document.getElementById('previwMonaco'), {
        value: ``,
        language: 'lua',
        automaticLayout: true,
    });
});

function inject() {
    injectBtn.disabled = true
    injectBtn.innerText = "Loading"
    ipcRenderer.send("inject-button-click",localStorage.getItem("usesAlternativeElevation") == "true")
}
ipcRenderer.on('set-inject-btn-text', (event, arg) => {
    injectBtn.innerText = arg
    injectBtn.disabled = true
})

ipcRenderer.on('enable-inject-btn', (event, arg) => {
    injectBtn.innerText = "Inject"
    injectBtn.disabled = undefined
})
ipcRenderer.on("script-ran",() => {
    console.log("hahaha icon goes spinspinspin")
    runFab.classList.remove("spin")
    void runFab.offsetWidth; // forces it to be re-rendered? idk js is weird sometimes
    runFab.classList.add("spin")
})
runFab.onclick = function() {
    ipcRenderer.send("run-script",mainEditor.getValue())
}

function runScript(a) {
    console.log(a)
    ipcRenderer.send("run-script",a)
}
var isLoading = true

function selectScript(filename,strings) {
    return function() {
        var detailsHeader = document.querySelector("#scriptsDetails > h1")
        var detailsSubheader = document.querySelector("#scriptsDetails > h3")
        detailsHeader.innerText = ""
        detailsSubheader.innerText = ""
        previewEditor.setValue("")
        try {
            if (isLoading) return;
            isLoading = true
            fs.readFile(filename,(err,data) => {
                if (err) return console.error(err);
                while (document.querySelector(".script.scriptSelected")) {document.querySelector(".script.scriptSelected").classList.remove("scriptSelected")}
                this.classList.add("scriptSelected")
                previewEditor.setValue(data.toString())
                detailsHeader.innerText = strings[0]
                detailsSubheader.innerText = strings[1]
                isLoading = false
            })
            
            
        } catch(e) {
            isLoading = false
            console.error(e)
            this.remove()
            if (document.querySelector(".script")) {
                document.querySelector(".script").click()
            }
        }
    }
}

function createScript(p,filename) {
    var div = document.createElement("div")
    div.classList = "script"
    div.dataset.filename = filename
    div.dataset.relative = path.join(p.dir,p.base)
    div.onclick = selectScript(filename,[p.base,p.dir])
    var title = document.createElement("h1")
    title.innerText = p.base
    div.appendChild(title)
    var subtitle = document.createElement("h3")
    subtitle.innerText = p.dir
    div.appendChild(subtitle)
    scriptsContainer.appendChild(div)
}

var key = ""

ipcRenderer.on('script-found', (event, arg) => {
    if (arg[0] == key)  {
        var r = path.relative(arg[1],arg[2])
        var p = path.parse(r)
        if (p.ext == ".lua" || p.ext == ".txt") {
            createScript(p,arg[2])
        }
    }
})

function startCrawl() {
    isLoading = false
    key = Math.random().toString()
    scriptsContainer.innerHTML = ""
    ipcRenderer.send("startCrawl",key)
}
ipcRenderer.on('enable-inject-btn', (event, arg) => {
    if (arg.key != key) return; // prevent multiple running scan operations
})

searchBox.onchange = () => {
    var val = searchBox.value.toLocaleLowerCase()
    for (var s of document.querySelectorAll(".script"))  {
        var t = String(s.dataset.relative)
        s.style.display = t.toLocaleLowerCase().includes(val) ? "block" : "none"
    }
}

function showLogin() {
    try {
        document.querySelector("#loginUsername").value = atob(fs.readFileSync("/Users/Shared/Calamari/GY"))
    } catch(e) {
        console.error(e)
    }
    try {
        document.querySelector("#loginPassword").value = atob(fs.readFileSync("/Users/Shared/Calamari/NGV"))
    } catch(e) {
        console.error(e)
    }
    document.querySelector("#loginBtn").disabled = undefined
    document.body.classList.add("loggingIn")
}
function login() {
    document.querySelector("#loginBtn").disabled = true
    if (document.querySelector("#loginUsername").value == "trial") {
        return alert("Trial login is no longer available.")
    }
    fs.writeFileSync("/Users/Shared/Calamari/GY",btoa(document.querySelector("#loginUsername").value))
    fs.writeFileSync("/Users/Shared/Calamari/NGV",btoa(document.querySelector("#loginPassword").value))
    ipcRenderer.send("check-creds")
}

ipcRenderer.on('request-login', showLogin)
ipcRenderer.on('login-success',() => {document.body.classList.remove("loggingIn")})
window.onkeydown = function(evt) {
    // disable zooming
    if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) {evt.preventDefault()}
    webFrame.setZoomFactor(1)
}

function reinstallCalamari() {
    if (location.toString().includes("CalamariApps")) {
        return dialog.showMessageBoxSync({
            type: "error",
            buttons: ["Ok"],
            defaultId: 0,
            message: "Jellyfish is inside the CalamariApps folder.",
            detail: "You are running Jellyfish from within the CalamariApps folder. Please quit Jellyfish, then move it somewhere else (such as your actual Applications folder), then try again.",
        })
    }
    var reinstallOption = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["Full Reinstall","App Reinstall","Cancel"],
        defaultId: 2,
        message: "Reinstall Calamari?",
        detail: "Reinstalling will delete everything in the CalamariApps folder, and completing a full reinstall will also log you out of Calamari.",
    })
    if (reinstallOption == 2) return;
    document.body.style.pointerEvents = "none"
    document.body.style.opacity = "0.5"
    try {
        fs.rmdirSync(path.join(homedir,"Documents","CalamariApps"),{ recursive: true })
        if (reinstallOption == 0) {
            fs.rmdirSync("/Users/Shared/Calamari",{ recursive: true })
        }
        var reinstallOption = dialog.showMessageBoxSync({
            buttons: ["Quit"],
            defaultId: 0,
            message: "Uninstall complete",
            detail: "Please restart Jellyfish to complete the reinstall.",
        })
        window.close()
    } catch(e) {
        var reinstallOption = dialog.showMessageBoxSync({
            type: "error",
            buttons: ["Ok"],
            defaultId: 0,
            message: "Reinstall failed",
            detail: e.toString(),
        })
    }
}

var chcolor = 0
function changeColor(hue) {
    var s = `body, body *, body > * {
        --accent-bright: hsl(${hue},87%,48%);
        --accent-dark: hsl(${hue},94%,33%);
        --accent-verydark: hsl(${hue},88%,33%);
        --background-main: #222;
        --text-main: #fff;
    }`
    while (document.querySelector("#accentColorChange")) {document.querySelector("#accentColorChange").remove()}
    var style = document.createElement("style")
    style.innerHTML = s
    style.id = "accentColorChange"
    document.head.appendChild(style)
    localStorage.setItem("hue", hue)
    document.querySelector("#hueSlider").value = hue
}

function startChangingColor(t) {
    clearInterval(chcolor)
    setInterval(function() {
        changeColor(t.value)
    },30)
}
function stopChangingColor(t) {
    clearInterval(t)
}

changeColor(localStorage.getItem("hue") || 356)
var lastPingInterval = 0
ipcRenderer.on('http-request',(e,data) => {
    if (data.messageType == "ping") {
        clearTimeout(lastPingInterval)
        if (data.gameName) {
            document.title = "Jellyfish for Calamari-M | Injected into " + data.gameName
        } else {
            document.title = "Jellyfish for Calamari-M | Injected"
        }
        lastPingInterval = setTimeout(function() {
            document.title = "Jellyfish for Calamari-M"
        },2000)
    }
})

document.querySelector("#alternativeElevation").checked = localStorage.getItem("usesAlternativeElevation") == "true"