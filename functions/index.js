const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const tabletojson = require('tabletojson');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

//intents
const BRIDGE_STATE = 'Bridge_State';
const BRIDGE_LOCATION = 'Bridge_Location';
const BRIDGE_FUTURE = 'Bridge_Future';
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

                    if (bridgeState === "begaanbaar") {
                        answer = ("De " + BridgeName + " is niet open");
                        this.conv.ask(answer);
                        resolve();
                    } else {
                        this.checkCloseTime(BridgeName);
                    }
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                    this.conv.ask(answer);
                    resolve();
                }
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
                    let tableAsJson = tabletojson.convert("<table>" + table + "</table>");
                    let tableAsJson1 = tableAsJson[0];
                    //console.log(tableAsJson1)
                    bridgeName = 'Biesterbrug';
                    tableAsJson1.forEach(function (entry) {
                        let name = entry['Naam / Plaats'];
                        if (name.includes(bridgeName)) {
                            console.log(entry['Naam / Plaats']);
                            console.log(entry['Duur']);
                            let closingTime = ['Duur'];

                            console.log("Time Remaining:" + closingTime);
                            answer = ("De " + bridgeName + " gaat dicht in " + closingTime);
                        }
                    });
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                }
                this.conv.ask(answer);
                resolve();
            });
        })
    };
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