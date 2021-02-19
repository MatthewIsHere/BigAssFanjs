import FanController from "./FanController";

class BigAssFan {
    public readonly name
    public readonly mac
    private readonly ip
    private readonly controller 

    constructor (name: string, mac: string, ip: string, controller: FanController) {
        this.name = name
        this.mac = mac
        this.ip = ip
        this.controller = controller
    }
    
    public receiveMessage(query: string[]) {

    }

    public send(query: string[]) {
        let assembledQuery = Array.from(query)
        assembledQuery.unshift(this.mac)
        this.controller.send(assembledQuery, this.ip)
    }
}

export default BigAssFan