const { dialog } = require('electron')
const child_process = require('child_process')
const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const { errorMonitor } = require('stream')



CALAMARI_API_LOCATION = global.CALAMARI_API_LOCATION
DEFAULT_CAPPS_LOCATION = global.DEFAULT_CAPPS_LOCATION
JELLYFISH_DATA_DIR = global.JELLYFISH_DATA_DIR

var firstInject = true

function getTitle(text) {
    t = new String(text)
    if (t.startsWith("ERROR-")) { return t.replace("ERROR-","")}
    if (t.includes("<title>")) {
        return t.split("<title>")[1].split("</title>")[0]
    }
    return t
}

async function needsToLogin() {
    try {
        var username = fs.readFileSync(path.join(CALAMARI_API_LOCATION,"GY"))
        var password = fs.readFileSync(path.join(CALAMARI_API_LOCATION,"NGV"))
        console.log("Checking credentials")
        var ftch = await fetch("https://auth.calamari.cc/Login/?type=macosSecure&username=" + username + "&password=" + password, {headers: {"User-Agent":"Jellyfish/" + require("./package.json").version + "(contact: theLMGN#4444)"}})
        var t = await ftch.text()
        if (!t.startsWith("AUTH-")) {
            return getTitle(t)
        } else {
            return false
        }
    } catch(e) {
        console.error(e)
        return true
    }
}


async function update() {
    // /child_process.execSync('curl -s  > "' + path.join(DEFAULT_CAPPS_LOCATION,"libChomp.dylib") + '"')
    var res = await fetch('https://cdn.calamari.cc/libChomp.dylib')
    var first = true
    var fail = false
    var dest = fs.createWriteStream(path.join(DEFAULT_CAPPS_LOCATION,"libChomp.dylib"));
    res.body.on("data",(d) => {
        if (first && (d[0] != 207 || d[1] != 250 || d[2] != 237 || d[3] != 254)) {
            console.log(d.toString())
            console.log(d[0], d[1], d[2], d[3])
            console.log(d[0] != 207,d[1] != 250,d[2] != 237, d[3] != 254)
            throw Error("Downloaded file wasn't a valid Mach-O binary.\n\nCheck the Calamari Discord, or Jellyfish logs.\n\n" + getTitle(d))
        }
        first = false
        if (!fail) {
            if (!dest) {dest = fs.createWriteStream(path.join(DEFAULT_CAPPS_LOCATION,"libChomp.dylib"));}
            dest.write(d)
        }
    })
    return (() => {return new Promise((a,r) => {res.body.on("end",a)})})()
    
    res.body.pipe(dest);
    
}

async function checkCreds(event,arg) {
    event.reply("set-inject-btn-text","Logging in")
    var n2l = await needsToLogin()
    if (n2l) {
        event.reply("set-inject-btn-text",n2l == true ? "Not logged in" : n2l)
        dialog.showMessageBoxSync(win,{
            message: n2l == true ? "Failed to authenticate" : n2l,
            detail: "Calamari credentials are either not present or invalid, or Calamari authentication server is currently down.",
        })
        event.reply("request-login")
        setTimeout(function() {
            event.reply("enable-inject-btn")
        },2000)
        return false
    } else {
        event.reply("login-success")
        setTimeout(function() {
            event.reply("enable-inject-btn")
        },2000)
        return true
    }
    
}

module.exports = async (event, arg) => {
    var win = global.win
    if (!(await checkCreds(event,arg))) { return false}
    event.reply("set-inject-btn-text","Updating")
    await update()

    event.reply("set-inject-btn-text","Injecting")
    fs.writeFileSync(path.join(CALAMARI_API_LOCATION,"input.txt"),`0local function callback(text)
    game:shutdown()
    end
    local bindableFunction = Instance.new("BindableFunction")
    bindableFunction.OnInvoke = callback
    
    game.StarterGui:SetCore("SendNotification", {
        Title = "Jellyfish for Calamari-M";
        Text = "Calamari has been successfully injected"; 
        Callback = bindableFunction;
        Button1 = "Exit";
    })
   --[[while wait(1) do
        pcall(function()
            game:HttpGet("http://localhost:7964/?messageType=ping&gameId=" .. game.GameId .. "&gameName=" .. game:GetService("HttpService"):UrlEncode(game.Name))
        end)
    end]]
    `)
    ;(function(cb) {
        if (arg) {
            try {
                var r = child_process.spawnSync(`/bin/bash`,[ `-c`, `killall Terminal;osascript -e \"tell application \\\"Terminal\\\"\" -e \"do script \\\"clear;sudo ~/Documents/CalamariApps/CalamariHookHelperTool;sleep 2;killall Terminal\\\"\" -e \"activate\" -e \"end tell\" & osascript -e \"tell application \\\"Terminal\\\"\" -e \"activate\" -e \"end tell\"`])
                cb(undefined,"status: success",r.stderr.toString())
            } catch(e) { cb(e,"","") }
        } else {
            require("sudo-prompt").exec(path.join(DEFAULT_CAPPS_LOCATION,"CalamariHookHelperTool"), {name: "Jellyfish"},cb)
        }
    })(function(e,stdout,stderr) {
        console.log(e,stdout ? stdout.toString() : "(no stdout)",stderr ? stderr.toString() : "(no stderr)")
        if (e) {
            dialog.showMessageBoxSync(win,{
                message: "Error while requesting super-user permissions",
                detail: e.toString(),
            })
            setTimeout(function() {
                event.reply("enable-inject-btn")
            },2000)
            return event.reply("set-inject-btn-text","Failed")
        }
        if (stdout.includes("invalid pid")) { 
            dialog.showMessageBoxSync(win,{
                message: "Roblox isn't running",
                detail: "We couldn't inject into Roblox, well, because there's no Roblox to inject into!",
            })
            setTimeout(function() {
                event.reply("enable-inject-btn")
            },2000)
            return event.reply("set-inject-btn-text","Failed")
        }
        if (stdout.includes("status: success")) {
            setTimeout(function() {
                event.reply("enable-inject-btn")
            },2000)
            if (firstInject) {
                firstInject = false
                if (dialog.showMessageBoxSync(win,{
                    message: "Calamari injected.",
                    detail: "Enjoying Jellyfish? Consider donating for more updates and features.",
                    buttons: ["Sure","Dismiss"],
                    defaultId: 1,
                }) != 1) {
                    child_process.spawn("open", ["https://thelmgn.com/donate.html"])
                }
                
            }
            return event.reply("set-inject-btn-text","Injected")
        }
        if (stdout.includes("could not fetch library")) {
            setTimeout(function() {
                event.reply("enable-inject-btn")
            },2000)
            dialog.showMessageBoxSync(win,{
                message: "Error occured while injecting",
                detail: "Please go to 'Tools' and toggle 'Alternative elevation method'.",
            })
            return event.reply("set-inject-btn-text","Failed")
        }
        
        dialog.showMessageBoxSync(win,{
            message: "Error occured while injecting",
            detail: stdout,
        })
        setTimeout(function() {
            event.reply("enable-inject-btn")
        },2000)
        return event.reply("set-inject-btn-text","Failed")
        
    })
}
module.exports.checkCreds = checkCreds