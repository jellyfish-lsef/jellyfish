const webFrame =  require('electron').webFrame


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

window.onhashchange = function(h) {
    var hash = location.hash
    if (hash == "#editor") { mainContainer.style.left = "0px" }
    if (hash == "#settings") { mainContainer.style.left = "-100vw" }
    if (hash == "#scripts") { mainContainer.style.left = "-200vw"; startCrawl() }
    document.querySelector("a.selected").classList.remove("selected")
    document.querySelector(`a[href="${hash}"]`).classList.add("selected")
}

if (location.hash.length > 1) { window.onhashchange()}


amdRequire(['vs/editor/editor.main'], function() {
    monaco.editor.defineTheme("myTheme",{base:"vs-dark",inherit:!0,rules:[{foreground:"5c6370",fontStyle:" italic",token:"comment"},{foreground:"b8cae8ff",token:"keyword.operator.class"},{foreground:"b8cae8ff",token:"constant.other"},{foreground:"b8cae8ff",token:"source.php.embedded.line"},{foreground:"fa6e7c",token:"variable"},{foreground:"fa6e7c",token:"support.other.variable"},{foreground:"fa6e7c",token:"string.other.link"},{foreground:"fa6e7c",token:"string.regexp"},{foreground:"fa6e7c",token:"entity.name.tag"},{foreground:"fa6e7c",token:"entity.other.attribute-name"},{foreground:"fa6e7c",token:"meta.tag"},{foreground:"fa6e7c",token:"declaration.tag"},{foreground:"eeb164ff",token:"constant.numeric"},{foreground:"eeb164ff",token:"constant.language"},{foreground:"eeb164ff",token:"support.constant"},{foreground:"eeb164ff",token:"constant.character"},{foreground:"eeb164ff",token:"variable.parameter"},{foreground:"eeb164ff",token:"punctuation.section.embedded"},{foreground:"eeb164ff",token:"keyword.other.unit"},{foreground:"eee280ff",token:"entity.name.class"},{foreground:"eee280ff",token:"entity.name.type.class"},{foreground:"eee280ff",token:"support.type"},{foreground:"eee280ff",token:"support.class"},{foreground:"adee7aff",token:"string"},{foreground:"adee7aff",token:"entity.other.inherited-class"},{foreground:"adee7aff",token:"markup.heading"},{foreground:"b8cae8ff",token:"constant.other.color"},{foreground:"61cbeeff",token:"entity.name.function"},{foreground:"61cbeeff",token:"meta.function-call"},{foreground:"61cbeeff",token:"support.function"},{foreground:"61cbeeff",token:"keyword.other.special-method"},{foreground:"61cbeeff",token:"meta.block-level"},{foreground:"ec7beeff",token:"keyword"},{foreground:"ec7beeff",token:"storage"},{foreground:"ec7beeff",token:"storage.type"},{foreground:"ec7beeff",token:"entity.name.tag.css"},{foreground:"ec7beeff",token:"keyword.operator"},{foreground:"eeeeeeff",background:"ee7c80ff",token:"invalid"},{foreground:"b8cae8ff",background:"6b4f4fff",token:"meta.separator"},{foreground:"243043ff",background:"ee864dff",token:"invalid.deprecated"},{foreground:"4fe1eeff",token:"constant.character"},{foreground:"4fe1eeff",token:"constant.other"}],colors:{"editor.foreground":"#BFCAE0","editor.background":"#222222","editor.selectionBackground":"#3D4350","editor.lineHighlightBackground":"#4C576730","editorCursor.foreground":"#528BFF","editorWhitespace.foreground":"#747369"}});
    monaco.editor.setTheme('myTheme');
    
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
    ipcRenderer.send("inject-button-click")
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
    document.body.classList.add("loggingIn")
}
function login() {
    fs.writeFileSync("/Users/Shared/Calamari/GY",btoa(document.querySelector("#loginUsername").value))
    fs.writeFileSync("/Users/Shared/Calamari/NGV",btoa(document.querySelector("#loginPassword").value))
    document.body.classList.remove("loggingIn")
}

ipcRenderer.on('request-login', showLogin)
window.onkeydown = function(evt) {
    // disable zooming
    if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) {evt.preventDefault()}
    webFrame.setZoomFactor(1)
}