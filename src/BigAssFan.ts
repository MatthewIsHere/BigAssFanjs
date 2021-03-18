import FanController from "./FanController";
import { join } from "path"
import { readFileSync } from "fs"

const queryJSONPath = join(__dirname, "queries.json")
const queries = JSON.parse(String(readFileSync(queryJSONPath)))

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
        console.log(query)
    }

    public send(query: string[]) {
        let assembledQuery = Array.from(query)
        assembledQuery.unshift(this.mac)
        this.controller.send(assembledQuery, this.ip)
    }
   /* private registerForResponse(query1: string, query2: string): Promise<> {

    }*/
    speed(speed?: number): void {
        let query: string[] = Array.from(queries.speed)
        let operationType = (speed == undefined) ? "GET": "SET"
        query.splice(2, 0, operationType)
        if(speed) query[3] = String(speed)
        this.send(query)
        //this is where we get the response
    }
}

export default BigAssFan