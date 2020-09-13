

function showLogin(a) {
    try {
        document.querySelector("#loginUsername").value = a[0]
    } catch(e) {
        console.error(e)
    }
    try {
        document.querySelector("#loginPassword").value = a[1]
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
    ipcRenderer.send("check-creds",[document.querySelector("#loginUsername").value,document.querySelector("#loginPassword").value])
}

ipcRenderer.on('request-login', showLogin)
ipcRenderer.on('login-success',() => {document.body.classList.remove("loggingIn")})
window.onkeydown = function(evt) {
    // disable zooming
    if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) {evt.preventDefault()}
    if (evt.code == "F12") require('electron').remote.getCurrentWindow().openDevTools()
    webFrame.setZoomFactor(1)
}