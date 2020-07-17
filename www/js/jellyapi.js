const API_ENDPOINT = "https://jellyfish-api.thelmgn.com"
const DISCORD_CLIENTID = '733148416309330065';

const RPC = require("discord-rpc")
//var io = require("socket.io-client")

const client = new RPC.Client({transport: "ipc"});

var socket

var sios = document.createElement("script")
sios.src = API_ENDPOINT + "/socket.io/socket.io.js"
sios.id = "sio"
sios.onload = function() {
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
        document.querySelector(`a[href="#scripthub"]`).style.display = "inline-block"
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
        document.querySelector(`a[href="#scripthub"]`).style.display = "none"
    })
}
document.head.appendChild(sios)



function startRemoteCrawl() {
    isLoading = false
    key = Math.random().toString()
    scriptsContainer.innerHTML = ""
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
