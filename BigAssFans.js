const dgram = require("dgram")
const EventEmitter = require("events")

class FanController extends EventEmitter {
    constructor() {
        super() // initializes functions for event listeners from EventEmitter
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
        
        if (!message.match(/^\(.*\)$/)) return // Only allows messages with the stucture "( stuff here )". This is so random packets and command packets dont get received
        console.log(message)
        let splitMessage = message.slice(1, -1).split(";")
        let fanName = splitMessage.shift()
        if (splitMessage[0] === "ERROR") return this.fanError(fanName, splitMessage[1])

        //maybe rework and get rid of responsFromFan
        if (fanName in this.knownFans) { //Searches Known Fans By Name And If Found, Sends Command To Fan Handler
            this.responseFromFan[fanName](splitMessage)
        } else {
            this.addNewFan(fanName, splitMessage, sender.address)
        }
        
        
        
       
    }

    #socketError(error) {
        if (error) throw error
    }
}





class BigAssFan { //extend eventEmitter?
    constructor (name, mac, address, controller) {
        this.name = name
        this.mac = mac
        this.address = address
        this.controller = controller
        
        this.controller.responseFromFan[name] = this.messageFromFan.bind(this)
        this.controller.responseFromFan[mac] = this.messageFromFan.bind(this)
    }

    responsePropertyGroup = {}

    #fanProperties = {
        "power": {
            "query": ["FAN", "PWR"], // pur third query in query array
            "readonly": false,

        },

        "speed": {
            "query": ["FAN", "SPD"],
            "readonly": false
        },

    }
    #lightProperties = {}
    #sensorProperties = {}
    #deviceProperties = {} 
//whats the purpose of name "fan" ?
    fan = new PropertyGroup("fan", this.#fanProperties, this)
    //light = new PropertyGroup("light", this.#lightProperties, this)
    //sensor = new PropertyGroup("sensor", this.#sensorProperties, this)
    //device = new PropertyGroup("device", this.#deviceProperties, this)
    


    messageFromFan(args) {
        this.responsePropertyGroup[args[0]](args)
    }

    send(query) {
        query.unshift(this.mac)
        let message = query.join(";")
        this.controller.sendRaw(`<${message}>`, this.address)
    }

}

class PropertyGroup extends EventEmitter {
    constructor(name, template, device) {
        super()
        this.name = name
        this.template = template
        this.device = device

        this.registerResponses(template)
        this.createFields(template)
        
    }
    cache = {}

    registerResponses(template) {
        for (const property in template) {
            let groupType = template[property].query[0]
            if (groupType in this.device.responsePropertyGroup) continue
            this.device.responsePropertyGroup[groupType] = this.updateCache.bind(this)
        }
    }

    updateCache(args) {
        let state = args.pop()
        for (const [key, value] of Object.entries(this.template)) {
            if (args.join(";") !== value.query.join(";")) continue
            this.cache[key] = state
            this.emit("cacheUpdate")
        }
    }

    createFields(template) {
        for (let property of Object.keys(template)) {
            Object.defineProperty(this, property, {
                get: async () => {
                    let query = Array.from(template[property].query)
                    query.splice(2, 0, "GET")
                    this.device.send(query)
                    let waitForCache = new Promise(resolve => {
                        this.on("cacheUpdate", () => {
                            resolve(this.cache[property])
                        })
                    })
                    return waitForCache
                }
            })
        }
    }
}



exports.FanController = FanController