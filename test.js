const WebSocket = require('ws');

function rpcJoinServer(code) {
    return new Promise(function(a,r) {
        var ws = new WebSocket('ws://127.0.0.1:6463/?v=1', {
            origin: 'https://discord.com'
        });
        var gd = false;
        ws.on('message', function incoming(data) {
            if (data.startsWith("{\"cmd\":\"DISPATCH\"")) {
                ws.send(JSON.stringify({cmd:"INVITE_BROWSER",args:{code:code},nonce:"poggers"}))
                setTimeout(function() {
                    if (!gd) { ws.close();r("Timed out") }
                },5000)
            } else if (data.startsWith("{\"cmd\":\"INVITE_BROWSER\"")){
                gd = true
                ws.close()
                var d = JSON.parse(data).data
                if (d.message) {
                    return r(d.message)
                }
                d.joinMethod = "rpc"
                return a(d)
            }
        });
        ws.on("close", () => {
            if (!gd) {
                ws.close()
                return r("Failed to get data")
            }
        })
        ws.on("error", () => {
            ws.close()
            r(arguments)
        })
    })
}
rpcJoinServer("obama").then(console.log).catch(console.error)