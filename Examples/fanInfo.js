let BigAssFans = require("../BigAssFans")

let masterController = new BigAssFans.FanController()
let myNumberOfFans = 1
let discoveredFans = 0

masterController.on("newFan", async myFan => {

    let power = await myFan.fan.power
    let speed = await myFan.fan.speed
    let whoosh = await myFan.fan.whoosh

    console.log(`######${myFan.name}######`)
    console.log("Powered: ", power)
    console.log("Speed: ",   speed)
    console.log("Whoosh: ",  whoosh)
    
    discoveredFans++
    if (discoveredFans == myNumberOfFans) masterController.close()
}) 
