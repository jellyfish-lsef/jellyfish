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

const exploits = {
    null: "nullExploit",
    calamari: "Calamari-M",
    sirhurt: "SirHurt",
    synx: "Synapse X",
    fluxus: "Fluxus"
}

ipcRenderer.on('set-exploit',(e,data) => {
    exploit = data
    document.title = "Jellyfish for " + exploits[data]
})
document.querySelector("#alternativeElevation").checked = localStorage.getItem("usesAlternativeElevation") == "true"
