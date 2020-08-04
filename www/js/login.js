

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
    if (evt.code == "F12") require('electron').remote.getCurrentWindow().openDevTools()
    webFrame.setZoomFactor(1)
}