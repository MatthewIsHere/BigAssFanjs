import FanController from "./FanController";

type FanResponseValue = Number | Boolean

type ResponseCallback = (query: string[], index: number) => void

class BigAssFan {
    public readonly name
    public readonly mac
    private readonly ip
    private readonly controller 
    private responseListeners: ResponseCallback[]

    constructor (name: string, mac: string, ip: string, controller: FanController) {
        this.name = name
        this.mac = mac
        this.ip = ip
        this.controller = controller
        this.responseListeners = []
    }

    //Function called by controller when a message had arrived
    public receiveMessage(query: string[]) {
        for (let index = 0; index < this.responseListeners.length; index++) {
            this.responseListeners[index](query, index)
        }
    }

    //Sends message up to the controller
    public send(query: string[]) {
        let assembledQuery = Array.from(query)
        assembledQuery.unshift(this.mac)
        this.controller.send(assembledQuery, this.ip)
    }
   
    //Fan speed <0-7>
    speed(speed?: number): Promise<FanResponseValue> {
        let query: string[] = ["FAN", "SPD", "ACTUAL"]
        let operationType = (speed == undefined) ? "GET": "SET"
        query.splice(2, 0, operationType)
        if (speed !== undefined) query[3] = String(Math.min(7, Math.max(0, speed)))
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve => 
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }

    //Fan power <boolean>
    power(power?: boolean): Promise<FanResponseValue> {
        let query: string[] = ["FAN", "PWR"]
        let state = (power) ? "ON" : "OFF"
        query[2] = (power == undefined) ? "GET": state
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve =>
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }

    //Whoosh mode <boolean>
    whoosh(whoosh?: boolean): Promise<FanResponseValue> {
        let query: string[] = ["FAN", "WHOOSH", "STATUS"]
        let state: string = (whoosh) ? "ON" : "OFF";
        (whoosh == undefined) ? query.splice(2, 0, "GET"): query[2] = state
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve =>
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }

    //Fan reverse mode <boolean>
    reverse(reverse?: boolean): Promise<FanResponseValue> {
        let query: string[] = ["FAN", "DIR"]
        let state: string = (reverse) ? "REV": "FWD"
        let operationType = (reverse == undefined) ? "GET" : "SET"
        query.splice(2, 0, operationType)
        if (reverse !== undefined) query[3] = state
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve =>
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }

    //Sets fan beep on state change
    beep(beep?: boolean): Promise<FanResponseValue> {
        let query: string[] = ["DEVICE", "BEEPER"]
        let state: string = (beep) ? "ON" : "OFF"
        query[2] = (beep == undefined) ? "GET" : state
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve =>
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }

    private registerForResponse(query1: string, query2: string): Promise<FanResponseValue> {
        let promise: Promise<FanResponseValue> = new Promise(resolve => {
            let callback: ResponseCallback = (query: string[], index: number) => {
                if (query[0] !== query1) return
                if (query[1] !== query2) return
                this.responseListeners.splice(index, 1)
                resolve(this.convertToFanResponseValue(query[query.length - 1]))
            }
            this.responseListeners.push(callback)
        })
        return promise
    }

    private convertToFanResponseValue(response: string): FanResponseValue {
        if (response == "ON") return true
        if (response == "OFF") return false
        if (response == "FWD") return false
        if (response == "REV") return true
        return Number(response)
    }
}

export default BigAssFan