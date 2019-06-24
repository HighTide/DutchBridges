const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const tabletojson = require('tabletojson');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//intents
const BRIDGE_STATE = 'Bridge_State';
const BRIDGE_LOCATION = 'Bridge_Location'
const BRIDGE_FUTURE = 'Bridge_Future'
//variables for the HTTP requests
const request = require('request');
var headers = {};

class Helper {
    constructor(conv) {
        this.conv = conv;

    }

    getBridge(bridge) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let obj = JSON.parse(body);
                    let BridgeName = obj[0]["id"];
                    let bridgeState = obj[0]["open"];

                    if (bridgeState === "begaanbaar") {
                        answer = ("De " + BridgeName + " is begaanbaar");
                    } else //if (open == "gestremd")
                    {
                        answer = ("De " + BridgeName + " is Open");
                    }
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                }
                this.conv.ask(answer);
                resolve();
            });
        });
    }

    closeBridge(bridge) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let obj = JSON.parse(body);
                    let BridgeName = obj[0]["id"];
                    let bridgeState = obj[0]["open"];
                    bridgeState = "open";
                    let bridgeCloseTime = obj[0]["end"];

                    if (bridgeState === "begaanbaar") {
                        answer = ("De " + BridgeName + " is niet open");
                    } else {
                        let dateNow = new Date();
                        let closeDate = new Date(bridgeCloseTime);
                        let closingTime = closeDate - dateNow;
                        this.checkCloseTime(BridgeName);
                        answer = ("De " + BridgeName + " gaat dicht in " + closingTime);
                    }
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                }
                this.conv.ask(answer);
                resolve();
            });
        });
    }

    checkCloseTime(bridgeName) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://www.brug-open.nl', (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const dom = new JSDOM(body);
                    //console.log(body)
                    const table = dom.window.document.querySelector("#wrapper > div.content-section-a > div.container > div > div:nth-child(1) > div > table").innerHTML;
                    //console.log(table);
                    let tableAsJson = tabletojson.convert("<table>"+table+"</table>");
                    tableAsJson = tabletojson[0];

                    tableAsJson.forEach(elem => console.log(elem))
                }
                else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                }
            });
        });
    }
}

const app = dialogflow().middleware(conv => {
    conv.helper = new Helper(conv);
});


//intents
app.intent(BRIDGE_STATE, async (conv) => {
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.getBridge(Bridge);
});

app.intent(BRIDGE_FUTURE, async (conv) => {
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.closeBridge(Bridge);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);