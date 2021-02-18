import EventEmitter from "events"
import dgram, { RemoteInfo } from "dgram"

class FanController extends EventEmitter {
    readonly scan: boolean
    public logTraffic: boolean
    public discoveredFans: object = {}
    private socket: dgram.Socket = dgram.createSocket("udp4")

    static everyone: string = "255.255.255.255"
    static port: number = 31415
    static readonly commandToFindFans: string[] = ["DEVICE", "ID", "GET"]

    constructor(scan: boolean = true, logTraffic: boolean = false) {
        super()
        this.scan = scan
        this.logTraffic = logTraffic
        this.socket.bind(FanController.port, this.socketBound.bind(this))
        this.socket.on("message", this.socketMessage.bind(this))
    }

    public send(query: string[], address: string) {
        let command: string = `<${query.join(";")}>`
        let payload = Buffer.from(command)
        this.socket.send(payload, FanController.port, address, this.socketCallback)
        if (this.logTraffic) console.log(`Outgoing: "${command}" => ${address}`)
    }

    public broadcast(query: string[]) {
        let assembledQuery: string[] = Array.from(query)
        assembledQuery.unshift("ALL")
        this.send(assembledQuery, FanController.everyone)
    }

    public discover() {
        this.broadcast(FanController.commandToFindFans)
    }

    private socketBound() {
        this.socket.setBroadcast(true)
        if (this.scan) {
            this.discover()
            //setInterval(this.discover.bind(this), 10000) maybe not necessary
        }
    }

    private socketCallback(error: Error | null, bytes: number) {
        if (error !== null) throw error
    }

    private socketMessage(payload: Buffer, sender: RemoteInfo) {
        let message: string = String(payload)
        if (!message.match(/^\(.*\)$/)) return
        if (this.logTraffic) console.log(`Incoming: "${message}" <= ${sender.address}`)
    }

}

export default FanController