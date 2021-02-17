const dgram = require("dgram")
const EventEmitter = require("events")
const templates = require("./propertyTemplates")

class FanController extends EventEmitter {
    constructor(scan = true, debug = false) {
        super()
        this.scan = scan
        this.debug = debug
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
        //Scanning Started When Socket Is Ready
        //If Controller Is Initialized With "scan=false", Fans Will Not Be Auto-discovered. Useful If You Want Stealthy Commands To One Fan
        if (this.scan) {
            this.broadcast(this.commandToFindDevices)
        }
    }

    sendRaw(payload, address) {
        let buffer = Buffer.from(payload)
        this.socket.send(buffer, this.fanPort, address, this.#socketError)
        if (!this.debug) return 
        console.log(`Outgoing: "${payload}" => ${address}`)
    } 

    broadcast(message) {
        this.sendRaw(`<ALL;${message}>`, this.everyone)
    }

    addNewFan(fanName, args, fanIP) {
        let deviceModel = args[3] //Gets Model Name From Command. Ex: FAN,HAIKU,LSERIES
        let deviceType = deviceModel.split(",")[0] //Confirms That The Device Is A Fan, And Not A Wall Switch
        let mac = args[2] // MAC Address OF New Fan
        if (deviceType !== "FAN") return //Currently Only Supports Fans. Also Filters Out Responses That Arent Identifying The Fan
        let newFan = new BigAssFan(fanName, mac, fanIP, this)
        this.knownFans[fanName] = newFan
        this.emit("newFan", newFan)
    }

    fanError(fanName, reason) {
        console.log(`Error: "${fanName}: ${reason} ERROR"`)
    }

    close() {
        this.socket.close()
    }

    #socketOpen() {
        this.socket.setBroadcast(true)
        this.startSearch()
    }

    #socketMessage(payload, sender) {
        let message = String(payload)
        
        if (!message.match(/^\(.*\)$/)) return // Only allows messages with the stucture "( stuff here )". This is so random packets and command packets dont get received
        if (this.debug) console.log(`Incoming: "${message}" <= ${sender.address}`)
        let splitMessage = message.slice(1, -1).split(";")
        let fanName = splitMessage.shift()
        if (splitMessage[0] === "ERROR") return this.fanError(fanName, splitMessage[1])

        if (fanName in this.knownFans) { //Searches Known Fans By Name And If Found, Sends Command To Fan Handler
            this.knownFans[fanName].messageFromFan(splitMessage) //Passes Fan Message To Responsible Fan Class
        } else {
            this.addNewFan(fanName, splitMessage, sender.address)
        }    
    }

    #socketError(error) {
        if (error) throw error
    }

}

class BigAssFan {
    constructor (name, mac, address, controller) {
        this.name = name
        this.mac = mac
        this.address = address
        this.controller = controller
    }

    responsePropertyGroup = {}

    #fanProperties    = templates.fanTemplate
    #lightProperties  = templates.lightTemplate
    #deviceProperties = templates.deviceTemplate

    fan =    new PropertyGroup(this.#fanProperties, this)
    light =  new PropertyGroup(this.#lightProperties, this)
    device = new PropertyGroup(this.#deviceProperties, this)
    
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
    constructor(template, device) {
        super()
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
            switch (state) {
                case "ON":
                    state = true
                    break
                case "OFF":
                    state = false
                    break
            }
            this.cache[key] = state
            this.emit("cacheUpdate", key)
        }
    }

    createFields(template) {
        for (let property of Object.keys(template)) {
            Object.defineProperty(this, property, {
                get: () => {
                    let query = Array.from(template[property].query)
                    query.splice(2, 0, "GET")
                    this.device.send(query)
                    let waitForCache = new Promise(resolve => {
                        this.on("cacheUpdate", cacheProperty => {
                            if (cacheProperty == property) {
                                resolve(this.cache[property])
                            }
                        })
                    })
                    return waitForCache
                },
                set: (newState) => {
                    let query = Array.from(template[property].query)
                    query.length = 2
                    if (!(template[property].booleanType)) {
                        query.splice(2, 0, "SET")
                    } 
                    switch (newState) {
                        case true:
                            newState = "ON"
                            break
                    case false:
                            newState = "OFF"
                            break
                    }
                    query.push(newState)
                    this.device.send(query)
                }
            })
        }
    }
}



exports.FanController = FanController
exports.BigAssFan = BigAssFan
