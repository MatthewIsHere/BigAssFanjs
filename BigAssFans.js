const dgram = require("dgram")
const EventEmitter = require("events")
const templates = require("./propertyTemplates")

class FanController extends EventEmitter {
    constructor(scan = true) {
        super()
        this.scan = scan
        this.socket.bind(this.fanPort)
        this.socket.on("listening", this.#socketOpen.bind(this))
        this.socket.on("message", this.#socketMessage.bind(this))
    }


    everyone = "255.255.255.255"
    fanPort = 31415
    commandToFindDevices = "DEVICE;ID;GET"
    socket = dgram.createSocket("udp4")
    
    knownFans = {}
    
    startSearch() { 
        //Kind Of The Main Function. Started When Socket Is Ready
        if (this.scan) {
            this.broadcast(this.commandToFindDevices)
        }
    }

    sendRaw(payload, address) {
        let buffer = Buffer.from(payload)
        this.socket.send(buffer, this.fanPort, address, this.#socketError)
    } 

    broadcast(message) {
        this.sendRaw(`<ALL;${message}>`, this.everyone)
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

    #socketOpen() {
        this.socket.setBroadcast(true)
        this.startSearch()
    }

    #socketMessage(payload, sender) {
        let message = String(payload)
        
        if (!message.match(/^\(.*\)$/)) return // Only allows messages with the stucture "( stuff here )". This is so random packets and command packets dont get received
        console.log(message)
        let splitMessage = message.slice(1, -1).split(";")
        let fanName = splitMessage.shift()
        if (splitMessage[0] === "ERROR") return this.fanError(fanName, splitMessage[1])

        if (fanName in this.knownFans) { //Searches Known Fans By Name And If Found, Sends Command To Fan Handler
            this.knownFans[fanName].messageFromFan(splitMessage)
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
    }

    responsePropertyGroup = {}

    #fanProperties    = templates.fanTemplate
    #lightProperties  = templates.lightTemplate
    #sensorProperties = templates.sensorTemplate
    #deviceProperties = templates.deviceTemplate

//whats the purpose of name "fan" ?
    fan = new PropertyGroup("fan", this.#fanProperties, this)
    light = new PropertyGroup("light", this.#lightProperties, this)
    sensor = new PropertyGroup("sensor", this.#sensorProperties, this)
    device = new PropertyGroup("device", this.#deviceProperties, this)
    
    messageFromFan(messageSplit) {
        this.responsePropertyGroup[messageSplit[0]](messageSplit)
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
                },
                set: (newValue) => {
                    let query = Array.from(template[property].query)
                   // query.splice(2, 0, "SET")
                    query.push(newValue)
                    this.device.send(query)
                }
            })
        }
    }
}



exports.FanController = FanController