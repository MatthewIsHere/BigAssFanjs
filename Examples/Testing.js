let BigAssFans = require("../BigAssFans")

let masterController = new BigAssFans.FanController()

masterController.on("newFan", async myFan=> {

    if (myFan.name != "Matthew’s Bedroom Fan") return

myFan.fan.power = false

    console.log("Powered: ", await myFan.fan.power)
    console.log("Speed: ", await myFan.fan.speed)
    console.log("Whoosh: ", await myFan.fan.whoosh)

    masterController.close()

}) 
