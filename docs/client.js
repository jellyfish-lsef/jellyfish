if (localStorage.getItem("user_is_skid")) {
    if (location.hash == "#im_not_a_skid_i_swear") {
        localStorage.removeItem("user_is_skid")
        alert("ok")
        location.hash = "editor"
    } else {
        location.replace("https://www.urbandictionary.com/define.php?term=skiddie")
    }
}


const mainContainer = document.querySelector("#mainContainer")
const injectBtn = document.querySelector("#topBarInject")
const runFab = document.querySelector("#runFab")
const scriptsContainer = document.querySelector("#scriptsSidebar")
const searchBox = document.querySelector("#searchBox")

window.onhashchange = function(h) {
    var hash = location.hash
    if (hash == "#editor") { mainContainer.style.left = "0px" }
    if (hash == "#faq") { mainContainer.style.left = "-100vw" }
    if (hash == "#scripts") { mainContainer.style.left = "-200vw"; }
    while (document.querySelector("a.selected")) {document.querySelector("a.selected").classList.remove("selected")}
    document.querySelector(`a[href="${hash}"]`).classList.add("selected")
}

if (location.hash.length > 1) { window.onhashchange()}

window.onkeydown = function(evt) {
    // disable zooming
    if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) {evt.preventDefault()}
}


async function download() {
    if (confirm("IMPORTANT: READ CAREFULLY\n\nJellyfish is only to be used on games that you have explicit permission to run a LSI on, such as for example, developing anti-cheat software.\n\nAre you intending to use Jellyfish to attack into games you are not the owner of, and do not have permission from the owner to run a LSI on?\n\nCancel = No\nOK = Yes")) {
        localStorage.setItem("user_is_skid",true)
        location.reload()
    }
    injectBtn.innerText = "Fetching download URL"
    injectBtn.disabled = true
    var ftch = await fetch("https://api.github.com/repos/thelmgn/Jellyfish/releases")
    var j = await ftch.json()
    injectBtn.innerText = "Starting download"
    location.replace(j[0].assets[0].browser_download_url)
    injectBtn.innerText = "Downloading"
    setTimeout(function() {
        injectBtn.innerText = "Download"
        injectBtn.disabled = false
    },2000)
}