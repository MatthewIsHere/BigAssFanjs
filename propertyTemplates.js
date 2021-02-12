const fanTemplate = {
        "power": {
            "query": ["FAN", "PWR"], // pur third query in query array
            "booleanType": true,
            "readonly": false,

        },
        "speed": {
            "query": ["FAN", "SPD", "ACTUAL"],
            "booleanType": false,
            "readonly": false
        },
        "whoosh": {
            "query": ["FAN", "WHOOSH", "STATUS"],
            "booleanType": true,
            "readonly": false
        },
        "spinDirectionForwards": { // we got a problem here
            "query": ["FAN", "DIR"],
            "booleanType": false,
            "readonly": false
        }
}

const lightTemplate = {}

const sensorTemplate = {}

const deviceTemplate = {
    "beeper": {
        "query": ["DEVICE", "BEEPER"],
        "booleanType": true,
        "readonly": false
    }
}

exports.fanTemplate = fanTemplate
exports.lightTemplate = lightTemplate
exports.sensorTemplate = sensorTemplate
exports.deviceTemplate = deviceTemplate
