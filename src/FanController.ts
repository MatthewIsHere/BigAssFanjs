import EventEmitter from "events"
import dgram, { RemoteInfo } from "dgram"
import BigAssFan from "./BigAssFan"

interface FanIndex {
    [index: string]: BigAssFan
}

class FanController extends EventEmitter {
    readonly scan: boolean
    public logTraffic: boolean
    public discoveredFans: FanIndex = {}
    private socket: dgram.Socket = dgram.createSocket("udp4")
    static everyone: string = "255.255.255.255"
    static port: number = 31415
    static readonly commandToFindFans: string[] = ["DEVICE", "ID", "GET"]

    //Controls all fans on network
    public all: BigAssFan = new BigAssFan("all", "ALL", FanController.everyone, this)

    constructor(scan: boolean = true, logTraffic: boolean = false) {
        super()
        this.scan = scan
        this.logTraffic = logTraffic
        this.socket.bind(FanController.port, this.socketBound.bind(this))
        this.socket.on("message", this.socketMessage.bind(this))
    }

    //Close controller after set milliseconds (timeout is so final responses can be received)
    public close(timeout: number = 0) {
        setTimeout(() => this.socket.close(), timeout)
    }

    //Assembles query terms into command packet for fan ip
    public send(query: string[], address: string) {
        let command: string = `<${query.join(";")}>`
        let payload = Buffer.from(command)
        this.socket.send(payload, FanController.port, address, this.socketCallback)
        if (this.logTraffic) console.log(`Outgoing: "${command}" => ${address}`)
    }
    //Sends query to all devices on network
    public broadcast(query: string[]) {
        let assembledQuery: string[] = Array.from(query)
        assembledQuery.unshift("ALL")
        this.send(assembledQuery, FanController.everyone)
    }

    //Sends out discover command to all devices on network
    public discover() {
        this.broadcast(FanController.commandToFindFans)
    }
    
    private checkIfDiscovered(identifier: string): boolean {
        return this.discoveredFans.hasOwnProperty(identifier)
    }

    private newFan(identifier: string, query: string[], ip: string) {
        let mac: string = query[2]
        let deviceModel: string = query[3]
        let isFan: boolean = deviceModel.slice(0,3) == "FAN"
        if (!isFan) return //filters out BigAssFan wall switches
        let fan = new BigAssFan(identifier, mac, ip, this)
        this.discoveredFans[identifier] = fan
        this.emit("newFan", fan)
    }


    private sendToFan(fanName: string, query: string[]) {
        let fan: BigAssFan = this.discoveredFans[fanName]
        return fan.receiveMessage(query)
    }

    private socketBound() {
        this.socket.setBroadcast(true)
        if (this.scan) this.discover()
    }

    private socketCallback(error: Error | null, bytes: number) {
        if (error !== null) throw error
    }

    private socketMessage(payload: Buffer, sender: RemoteInfo) {
        let message: string = String(payload)
        if (!message.match(/^\(.*\)$/)) return
        if (this.logTraffic) console.log(`Incoming: "${message}" <= ${sender.address}`)
        let query: string[] = message.slice(1, -1).split(";")
        if (query.length < 1) return
        let identifier: string = query.shift() as string
        let alreadyDiscovered: boolean = this.checkIfDiscovered(identifier)
        if (!alreadyDiscovered) {
            this.newFan(identifier, query, sender.address)
            return
        }
        this.sendToFan(identifier, query)
        return
    }

}

export default FanController