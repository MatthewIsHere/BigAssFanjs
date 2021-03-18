import FanController from "./FanController";
import { join } from "path"
import { readFileSync } from "fs"
import EventEmitter from "events";

const queryJSONPath = join(__dirname, "queries.json")
const queries = JSON.parse(String(readFileSync(queryJSONPath)))

type FanResponseValue = Number | Boolean

class BigAssFan extends EventEmitter {
    public readonly name
    public readonly mac
    private readonly ip
    private readonly controller 
    
    constructor (name: string, mac: string, ip: string, controller: FanController) {
        super()
        this.name = name
        this.mac = mac
        this.ip = ip
        this.controller = controller
    }
    
    public receiveMessage(query: string[]) {
        this.emit("response", query)
    }

    public send(query: string[]) {
        let assembledQuery = Array.from(query)
        assembledQuery.unshift(this.mac)
        this.controller.send(assembledQuery, this.ip)
    }
   
    private registerForResponse(query1: string, query2: string): Promise<FanResponseValue> {
        let promise: Promise<FanResponseValue> = new Promise(resolve => {
            this.on("response", (response: string[]) => {
                if (response[0] !== query1) return
                if (response[1] !== query2) return
                resolve(this.convertToFanResponseValue(response[response.length-1]))
            })
        })
        return promise 
    }

    convertToFanResponseValue(response: string): FanResponseValue {
        if (response == "ON") return true
        if (response == "OFF") return true
        return Number(response)
    }

    speed(speed?: number): Promise<FanResponseValue> {
        let query: string[] = Array.from(queries.speed)
        let operationType = (speed == undefined) ? "GET": "SET"
        query.splice(2, 0, operationType)
        if (speed) {
            speed = (speed > 7) ? 7 : speed
            speed = (speed < 0) ? 0 : speed
            query[3] = String(speed)
        }
        let returnPromise: Promise<FanResponseValue> = new Promise(resolve => 
            this.registerForResponse(query[0], query[1]).then(response => resolve(response))
        )
        this.send(query)
        return returnPromise
    }
}

export default BigAssFan