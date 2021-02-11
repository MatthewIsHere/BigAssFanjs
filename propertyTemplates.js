const fanTemplate = {
        "power": {
            "query": ["FAN", "PWR"], // pur third query in query array
            "readonly": false,

        },

        "speed": {
            "query": ["FAN", "SPD"],
            "readonly": false
        },

}

const lightTemplate = {}

const sensorTemplate = {}

const deviceTemplate = {}

exports.fanTemplate = fanTemplate
exports.lightTemplate = lightTemplate
exports.sensorTemplate = sensorTemplate
exports.deviceTemplate = deviceTemplate
