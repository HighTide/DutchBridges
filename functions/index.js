const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');

//intents
const BRIDGE_STATE = 'Bridge_State';


//variables for the HTTP requests
const request = require('request');
var headers = {};

class Helper {
    constructor(conv) {
        this.conv = conv;
    }

    getBridge() {
        var url = 'https://secretappdeveloper.com/bridgeApi.php/Bridges/5185957343400955';
        request.get({ headers: headers, url: url}, function(error, response, body){
            var obj = JSON.parse(body);
            bridgeState = obj[0]["open"];

            if (bridgeState == "begaanbaar"){
                this.conv.ask("De Spijkenisse brug is begaanbaar");
            }
            else //if (open == "gestremd")
            {
                this.conv.ask("De Spijkenisse brug is gestremd");
            }
        });
    }
}

const app = dialogflow().middleware(conv => {conv.helper = new Helper(conv);});

app.intent('Bridge_State', conv => {
    conv.helper.getBridge();
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);