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
var head  = document.head;
var link  = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = path.join(JELLYFISH_DATA_DIR,"Config","theme.css");
head.appendChild(link);

var chcolor = 0
function changeColor(hue) {
    var s = `body, body *, body > * {
        --accent-bright: hsl(${hue},87%,48%);
        --accent-dark: hsl(${hue},94%,33%);
        --accent-verydark: hsl(${hue},88%,33%);
        --background-main: #222;
        --text-main: #fff;
    }`
    var elem = document.querySelector("#accentColorChange")
    if (!elem) {
        elem = document.createElement("style")
        elem.id = "accentColorChange"
        document.head.appendChild(elem)
    }
    elem.innerHTML = s
    localStorage.setItem("hue", hue)
    document.querySelector("#hueSlider").value = hue
}

function startChangingColor(t) {
    clearInterval(chcolor)
    chcolor = setInterval(function() {
        changeColor(t.value)
    },30)
}
function stopChangingColor(t) {
    clearInterval(chcolor)
}

function homomode() {
    var hs = document.querySelector("#hueSlider")
    document.querySelector("#homo").disabled = true
    hs.disabled = true
    document.querySelector(".topBarBrand").innerText = "Gayllyfish"
    var i = 0
    setInterval(function() {
        i += 2
        if (i > 359) { i = 0 }
        changeColor(i)
        
    },30)

}

changeColor(localStorage.getItem("hue") || 356)