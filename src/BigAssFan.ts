import FanController from "./FanController";
import { join } from "path"
import { readFileSync } from "fs"
import EventEmitter from "events";

const queryJSONPath = join(__dirname, "queries.json")
const queries = JSON.parse(String(readFileSync(queryJSONPath)))

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
   
    private registerForResponse(query1: string, query2: string): Promise<string[]> {
        let promise = new Promise(resolve => {
            this.on("response", (response: string[]) => {
                if (response[0] !== query1) return
                if (response[1] !== query2) return
                resolve(response)
            })
        })
        return promise as Promise<string[]>
    }

    speed(speed?: number): Promise<Number> {
        let query: string[] = Array.from(queries.speed)
        let operationType = (speed == undefined) ? "GET": "SET"
        query.splice(2, 0, operationType)
        if(speed) query[3] = String(speed)
        let returnPromise = new Promise(resolve => {
            this.registerForResponse(query[0], query[1])
            .then(response => {
                resolve(Number(response[3]))
            }) 
        }) as Promise<Number>
        this.send(query)
        return returnPromise
    }
}

export default BigAssFan