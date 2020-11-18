const { parse } = require('path');

const settings      = require('./settings.json'),
      osc           = require('osc'),
      dgram         = require('dgram'),
      server        = dgram.createSocket('udp4');
let   isOSCReady    = false,
      udpPort       = new osc.UDPPort(
                    {
                       localPort: 57121,
                       metadata: true,
                       broadcast: true
                    });
udpPort.open();
udpPort.on("ready", function () { isOSCReady == true; });

server.bind(settings.receivingPort, settings.receivingIP);
server.on('listening', function () {
    var address = server.address();
    console.log('expecting free-D on ' + address.address + ':' + address.port);
    });
server.on('freeDMessage', function (message, remote) 
    {
        if(settings.debug)
        {
            console.clear();
            console.log(freeDMessage);
        }
        parseFreeD(freeDMessage);
    });

function parseFreeD(packet)
{
    let arrByte = Uint8Array.from(packet)
    let id = arrByte[1];
    let pan = (((arrByte[2] << 24) | (arrByte[3] << 16) | (arrByte[4] << 8)) >> 8) / 32768;
    let tilt = (((arrByte[5] << 24) | (arrByte[6] << 16) | (arrByte[7] << 8)) >> 8) / 32768;
    let zoom = (((arrByte[21] << 24) | (arrByte[22] << 16) | (arrByte[23] << 8)) >> 8) / 1048.32;
    let focus = (((arrByte[24] << 24) | (arrByte[25] << 16) | (arrByte[26] << 8)) >> 8);
    console.log('camera %s  -> pan: %s, tilt: %s,  zoom: %s, focus: %s', id, pan, tilt, zoom, focus);
    shootAnOSC(id, pan, tilt, zoom, focus);
}
    function shootAnOSC(id, pan, tilt, zoom, focus)
{
    udpPort.send({
        address: "/panasonic" +id + "/rotation/",
        args: [
            {
                type: "f",
                value: pan
            },
            {
                type: "f",
                value: tilt
            },
            {
                type: "f",
                value: 0
            }
        ]
    }, settings.IP, settings.port);
    udpPort.send({
        address: "/panasonic" + id + "/lens/",
        args: [
            {
                type: "f",
                value: zoom
            },
            {
                type: "f",
                value: focus
            }
        ]
    }, settings.IP, settings.port);
}


// Listen for incoming OSC messages.
// udpPort.on("message", function (oscMsg, timeTag, info) {
//     console.log("An OSC message just arrived!", oscMsg);
//     console.log("Remote info is: ", info);
// });