# BigAssFanjs
BigAssFanjs is an (Unofficial) API library written to manage fans made by BigAssFans
- [BigAssFanjs](#bigassfanjs)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)
- [API Docs](#api-docs)
  - [Fan Controller - Main API Class](#fan-controller---main-api-class)
    - [Event "newFan"](#event-newfan)
    - [FanController.knownFans](#fancontrollerknownfans)
  - [BigAssFan Class](#bigassfan-class)
    - [Accessing and Setting Properties](#accessing-and-setting-properties)
    - [Properties](#properties)
## Installation

Use the Node Package Manager to install:

```bash
npm install bigassfanjs
```

## Usage

```
coming soon once package is published to NPM
```

## Contributing
I'm open to any suggestions or ideas for this project. Feel free to create pull requests or issues and i'll get to them as soon as possible.

## License
[MIT](https://choosealicense.com/licenses/mit/)

# API Docs
## Fan Controller - Main API Class
Initialized With 
```
let controller = new FanController(scan, debug)
```
- Scan: boolean that controls if the controller will search for fans at start.
- Debug: boolean that logs incoming and outgoing commands.

FanController exposes a `newFan` event, the `knownFans` object, and a close() function
### Event "newFan"
the FanController class emits the `newFan` event whenever a new fan is discovered. It returns a `BigAssFan` object for the fan.
### FanController.knownFans
`knownFans` is an object containing all currently discovered fans for the controller. the object keys are the fan names with the value being its `BigAssFan` object

## BigAssFan Class  
Initialized With
```
let myFan = new BigAssFan(name, mac, ip, controller)
```
- Name: the display name of the fan, set when the fan is installed.
- Mac: the MAC address of the fan.
- IP: the ip address of the fan.
- Controller: an instance of the FanController class to manage the socket connection

This class is normally initialized by the controller, however it can be used separately when you dont want to auto-scan the network for fans.

---

### Accessing and Setting Properties
fan properties are accessed using the Promise API.
when getting a property such as fan speed, access it like a variable, but append .then() or use await
```
myFan.fan.speed.then(speed => {
    console.log(speed)
})
```
Setting properties does not use the Promise API, and is the same as setting a variable.
```
myFan.fan.speed = 7
```

### Properties
The BigAssFan Class contains 3 objects contain corresponding fan properties
1. fanInstance.fan
    - power: controls whether fan is on or off; **Allowed Values: true,false**
    - speed: sets fan speed; **Allowed Values: Integer 0-7**
    - auto: enables sensor based speed; **Allowed Values: Boolean**
    - whoosh: enable natural breeze like fan mode; **Allowed Values: Boolean**
    - spinDirection: sets whether fan spins forward or reverse; **Allowed Values: "FWD", "REV"**
2. fanInstance.light
   - brightness: sets fan light brightness; **Allowed Values: Integer 0-7**
   - auto: enables sensor based light brightness; **Allowed Values: Boolean**
3. fanInstance.device
   - beep: turns fan beeping on or off; **Allowed Values: Boolean**
   - indicators: turns led fan status indicators on or off; **Allowed Values: Boolean**
   - winterMode: turns on winter mode; **Allowed Values: Boolean**
   - height: sets fan height from ceiling in centimeters; **Allowed Values: Unsigned Integer**
   - ssid: displays current connected WiFi SSID; **Allowed Values: String**
   - ap: sets fan into access point mode; **Allowed Values: Boolean**
   - token: readonly UUID hardcoded into fan; **Readonly**