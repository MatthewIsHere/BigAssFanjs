const dgram = require("dgram")
const EventEmitter = require("events")

class FanController extends EventEmitter {
    constructor() {
        super()
        this.socket.bind(this.fanPort)
        this.socket.on("listening", this.#socketOpen.bind(this))
        this.socket.on("message", this.socketMessage.bind(this))
    }


    everyone = "255.255.255.255"
    fanPort = 31415
    socket = dgram.createSocket("udp4")
    
    knownFans = {}
    responseFromFan = {}
    
    sendRaw(payload, address) {
        let buffer = Buffer.from(payload)
        this.socket.send(buffer, this.fanPort, address, this.#socketError)
    } 

    broadcast(message) {
        this.sendRaw(`<ALL;${message}>`, this.everyone)
    }

    #socketOpen() {
        this.socket.setBroadcast(true)
    }

    addNewFan(fanName, args, fanIP) {
        let deviceModel = args[3] // Gets Model Name From Command. Ex: FAN,HAIKU,LSERIES
        let deviceType = deviceModel.split(",")[0] // Returns Only The Text Before The First Comma. This Confirms That The Device Is A Fan, And Not A Wall Switch
        let mac = args[2] // MAC Address OF New Fan
        if (deviceType !== "FAN") return // Currently Only Supports Fans. Also Filters Out Responses That Arent Identifying The Fan
        let newFan = new BigAssFan(fanName, mac, fanIP, this)
        this.knownFans[fanName] = newFan
        this.emit("newFan", newFan)
    }

    fanError(fanName, reason) {
        console.log(`${fanName}: ${reason} Error`)
    }

    socketMessage(payload, sender) {
        let message = String(payload)
        if (message.match(/^\<.*\>$/)) return // Filters Out Messages That Look Like "<command here>". Only Command Packets Have < >
        let splitMessage = message.slice(1, -1).split(";")
        let fanName = splitMessage.shift()
        if (splitMessage[0] === "ERROR") return this.fanError(fanName, splitMessage[1])
        if (fanName in this.knownFans) { //Searches Known Fans By Name And If Found, Sends Command To Fan Handler
            this.responseFromFan[fanName](splitMessage)
        } else {
            this.addNewFan(fanName, splitMessage, sender.address)
        }
        
        
        
        console.log(`server got: "${message}" from ${sender.address}:${sender.port}`)
    }

    #socketError(error) {
        if (error) throw error
    }
}

exports.FanController = FanController



class BigAssFan {
    constructor (name, mac, address, controller) {
        this.name = name
        this.mac = mac
        this.address = address
        this.controller = controller
        
        this.controller.responseFromFan[name] = this.messageFromFan.bind(this)
        this.controller.responseFromFan[mac] = this.messageFromFan.bind(this)
    }

    messageFromFan(args) {

    }

    send(args) {
        let message = args.unshift(this.mac).join(";")
        this.controller.sendRaw(`<${message}>`, this.address)
    }

}