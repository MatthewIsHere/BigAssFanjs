let BigAssFans = require("../BigAssFans")

let masterController = new BigAssFans.FanController()

masterController.on("newFan", async bigAssFan => {

    if (bigAssFan.name != "Matthew's Bedroom Fan") return
    console.dir(bigAssFan)
}) 
