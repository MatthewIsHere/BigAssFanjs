let BigAssFans = require("../BigAssFans")

let masterController = new BigAssFans.FanController()

masterController.on("newFan", async bigAssFan => {
    console.log(await bigAssFan.fan.power)
}) 
