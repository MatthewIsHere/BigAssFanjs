import FanController from "./FanController";
import { join } from "path"
import { readFileSync } from "fs"

interface booleanProperty {
    (newValue?: boolean): Promise<boolean>;
}
interface numberPropery {
    (newValue?: number): Promise<number>;
}
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

    speed(speed?: number): Promise<number> {
        if (speed) {
            
        } else {

        }
        //registerListener()
        return new Promise((resolve) => {
            resolve(8)
        })
    }
}

export default BigAssFan