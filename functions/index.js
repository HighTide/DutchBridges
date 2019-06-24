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
        var url = 'https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge;
        request.get({headers: headers, url: url}, function (error, response, body) {
            var obj = JSON.parse(body);
            var BridgeName = obj[0]["id"];
            bridgeState = obj[0]["open"];

            if (bridgeState == "begaanbaar") {
                this.conv.ask("De " + BridgeName + " brug is begaanbaar");
            } else //if (open == "gestremd")
            {
                this.conv.ask("De " + BridgeName + " brug is Open");
            }
        });
    }

    closeBridge(bridge) {
        var url = 'https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge;
        request.get({headers: headers, url: url}, function (error, response, body) {
            var obj = JSON.parse(body);
            var BridgeName = obj[0]["id"];
            var bridgeState = obj[0]["open"];
            var bridgeCloseTime = obj[0]["end"];

            if (bridgeState == "begaanbaar") {
                this.conv.ask("De " + BridgeName + " brug is niet open");
            } else{

                var dateNow = new Date();
                var closeDate = new Date(bridgeCloseTime);
                var closingTime = closeDate - dateNow;
                this.conv.ask(("De " + BridgeName + " brug gaat dicht in"+closingTime))
            }
        });
    }


}
const app = dialogflow().middleware(conv => {conv.helper = new Helper(conv);});


//intents
app.intent(BRIDGE_STATE, conv => {
    const Bridge = this.conv.parameters[BRIDGE_LOCATION].toLowerCase()
    conv.helper.getBridge(Bridge);
});

app.intent(BRIDGE_FUTURE, conv => {
    const Bridge = this.conv.parameters[BRIDGE_LOCATION].toLowerCase()
    conv.helper.closeBridge(Bridge);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);