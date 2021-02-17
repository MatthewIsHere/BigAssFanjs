const fanTemplate = {
        "power": {
            "query": ["FAN", "PWR"],
            "booleanType": true,
            "readonly": false,

        },
        "speed": {
            "query": ["FAN", "SPD", "ACTUAL"],
            "booleanType": false,
            "readonly": false
        },
        "auto": {
            "query": ["FAN", "AUTO"],
            "booleanType": true,
            "readonly": false
        },
        "whoosh": {
            "query": ["FAN", "WHOOSH", "STATUS"],
            "booleanType": true,
            "readonly": false
        },
        "spinDirection": { 
            "query": ["FAN", "DIR"],
            "booleanType": false,
            "readonly": false
        }
}

const lightTemplate = {
        "brightness": {
            "query": ["LIGHT", "LEVEL", "ACTUAL"],
            "booleanType": false,
            "readonly": false
        },
        "auto": {
            "query": ["LIGHT", "AUTO"],
            "booleanType": true,
            "readonly": false
        },
}

//const sensorTemplate = {} My Fans dont have sensors so i cant test this at the moment
//SENSOR NOT IMPLEMENTED

const deviceTemplate = {
        "beep": {
            "query": ["DEVICE", "BEEPER"],
            "booleanType": true,
            "readonly": false
        },
        "indicators": {
            "query": ["DEVICE", "INDICATORS"],
            "booleanType": true,
            "readonly": false
        },
        "winterMode": {
            "query": ["WINTERMODE", "STATE"],
            "booleanType": true,
            "readonly": false
        },
        "height": {
            "query": ["WINTERMODE", "HEIGHT"],
            "booleanType": true,
            "readonly": false
        },
        "ssid": {
            "query": ["NW", "SSID"],
            "booleanType": false,
            "readonly": false
        },
        "ap": {
            "query": ["NW", "AP", "STATUS"],
            "booleanType": true,
            "readonly": false
        },
        "token": {
            "query": ["NW", "TOKEN"],
            "booleanType": true,
            "readonly": true
        }
}

exports.fanTemplate = fanTemplate
exports.lightTemplate = lightTemplate
exports.sensorTemplate = sensorTemplate
exports.deviceTemplate = deviceTemplate
