let BigAssFans = require("../BigAssFans")

let masterController = new BigAssFans.FanController()

masterController.broadcast("DEVICE;ID;GET")
masterController.on("newFan", bigAssFan => {
    bigAssFan.fan.power.then(value => {
        console.log(value)
    })
}) 
