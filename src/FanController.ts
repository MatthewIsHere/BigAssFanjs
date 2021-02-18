import EventEmitter from "events"
import dgram from "dgram"

class FanController extends EventEmitter {
    readonly scan: boolean
    public logTraffic: boolean
    public discoveredFans: object = {}
    private socket: dgram.Socket = dgram.createSocket("udp4")

    static everyone: string = "255.255.255.255"
    static port: number = 31415
    static commandToFindFans: string[] = ["DEVICE", "ID", "GET"]

    constructor(scan: boolean = true, logTraffic: boolean = false) {
        super()
        this.scan = scan
        this.logTraffic = logTraffic
        this.socket.bind(FanController.port, this.socketBound)
    }

    public send(query: string[], address: string) {
        let command: string = `<${query.join(";")}>`
        let payload = Buffer.from(command)
        this.socket.send(payload, FanController.port, address, this.socketCallback)
        if (this.logTraffic) console.log(`Outgoing: "${command}" => ${address}`)
    }

    public broadcast(query: string[]) {
        query.unshift("ALL")
        this.send(query, FanController.everyone)
    }

    public discover() {
        this.broadcast(FanController.commandToFindFans)
    }

    private socketBound() {
        this.socket.setBroadcast(true)
        if (this.scan) {
            this.discover()
            setInterval(this.discover, 5000)
        }
    }

    private socketCallback(error: Error | null, bytes: number) {
        if (error !== null) throw error
    }

}

export default FanController