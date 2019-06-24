const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');

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
                        answer = ("De " + BridgeName + " brug is begaanbaar");
                    } else //if (open == "gestremd")
                    {
                        answer = ("De " + BridgeName + " brug is Open");
                    }
                } else {
                    console.log('3');
                    answer = "De Spijkenisse brug geeft geen antwoord.";
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
                    let bridgeCloseTime = obj[0]["end"];

                    if (bridgeState === "begaanbaar") {
                        answer = ("De " + BridgeName + " brug is niet open");
                    } else {
                        let dateNow = new Date();
                        let closeDate = new Date(bridgeCloseTime);
                        let closingTime = closeDate - dateNow;
                        answer = ("De " + BridgeName + " brug gaat dicht in " + closingTime);
                    }
                } else {
                    console.log('3');
                    answer = "De Spijkenisse brug geeft geen antwoord.";
                }
                this.conv.ask(answer);
                resolve();
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