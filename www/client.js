const webFrame =  require('electron').webFrame
const dialog =  require('electron').remote.dialog

const fs = require("fs")
const os = require("os")
const { ipcRenderer } = require('electron')

const mainContainer = document.querySelector("#mainContainer")
const injectBtn = document.querySelector("#topBarInject")
const runFab = document.querySelector("#runFab")
const saveFab = document.querySelector("#saveFab")
const scriptsContainer = document.querySelector("#scriptsSidebar")
const searchBox = document.querySelector("#searchBox")



window.onhashchange = function(h) {
    var hash = location.hash
    if (hash == "#editor") { mainContainer.style.left = "0px" }
    if (hash == "#settings") { mainContainer.style.left = "-100vw" }
    if (hash == "#scripts") { mainContainer.style.left = "-200vw"; startCrawl() }
    if (hash == "#scripthub") { mainContainer.style.left = "-200vw"; startRemoteCrawl() }
    document.querySelector("a.selected").classList.remove("selected")
    document.querySelector(`a[href="${hash}"]`).classList.add("selected")
}

if (location.hash.length > 1) { window.onhashchange()}



var isLoading = true


function reinstallCalamari() {
    var win = require('electron').remote.getCurrentWindow()
    if (location.toString().includes("CalamariApps")) {
        return dialog.showMessageBoxSync(win,{
            type: "error",
            buttons: ["Ok"],
            defaultId: 0,
            message: "Jellyfish is inside the CalamariApps folder.",
            detail: "You are running Jellyfish from within the CalamariApps folder. Please quit Jellyfish, then move it somewhere else (such as your actual Applications folder), then try again.",
        })
    }
    var reinstallOption = dialog.showMessageBoxSync(win,{
        type: "question",
        buttons: ["Full Reinstall","App Reinstall","Cancel"],
        defaultId: 2,
        message: "Reinstall Calamari?",
        detail: "Reinstalling will delete everything in the CalamariApps folder, and completing a full reinstall will also log you out of Calamari.",
    })
    if (reinstallOption == 2) return;
    try {
        fs.rmdirSync(path.join(homedir,"Documents","CalamariApps"),{ recursive: true })
        if (reinstallOption == 0) {
            fs.rmdirSync("/Users/Shared/Calamari",{ recursive: true })
        }
        var reinstallOption = dialog.showMessageBoxSync(win,{
            buttons: ["Quit"],
            defaultId: 0,
            message: "Uninstall complete",
            detail: "Please restart Jellyfish to complete the reinstall.",
        })
        window.close()
    } catch(e) {
        var reinstallOption = dialog.showMessageBoxSync(win,{
            type: "error",
            buttons: ["Ok"],
            defaultId: 0,
            message: "Reinstall failed",
            detail: e.toString(),
        })
    }
}


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
            document.title = "Jellyfish"
        },2000)
    }
})

document.querySelector("#alternativeElevation").checked = localStorage.getItem("usesAlternativeElevation") == "true"
