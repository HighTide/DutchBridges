const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');

//intents
const WELCOME_INTENT = 'Default Welcome Intent';
const FALLBACK_INTENT = 'Default Fallback Intent';
const MOVE_PRINTER = 'Move_Printer';
const TEMPERATURE = 'Temperature';
const PREHEAT = 'Preheat';
const STATISTICS = 'Statistics';

//entities
//movement entities
const MOVE_PRINTER_DIRECTION = 'Directions';
const AMOUNTINTEGER = 'number-integer';

//temp entities
const PRINTERPART = 'Printerpart';
const GET = 'Get';
const SET = 'Set';

//variables for the HTTP requests
const request = require('request');
var headers = {
    'X-Api-Key': 'F4087DB290FE45B6821216E38FFA8CBA',
    'Content-Type': 'application/json'
};


const app = dialogflow();

app.intent(WELCOME_INTENT, (conv) =>{
    conv.ask("Welcome to Renee's 3d printer");
});

app.intent(FALLBACK_INTENT, (conv) =>{
    conv.ask("I didn't understand your request");
});


app.intent(STATISTICS, (conv) =>{
    var PRINTPART = conv.parameters[PRINTERPART].toLowerCase();
    var data;
    if(PRINTPART == "head" || PRINTPART == "bed"){ if(PRINTPART == "head") PRINTPART = "tool0";
        var url = 'http://89.98.102.219:55000/api/printer';
        request.get({ headers: headers, url: url},function(error, response, body){
            //var obj = JSON.parse(body);
            //console.log(obj);
            //console.log(obj.temperature.PRINTPART.actual);
            data = body;
            //console.log(data)

        });
        console.log(data)
        var obj = JSON.parse(data);
        //console.log(obj)
        temperature = obj.temperature.PRINTPART.actual;
        conv.ask(`The temperature of the ${PRINTPART} is ${temperature}`);
    }
    else{
        conv.ask(`I don't have access to those statistics yet`);
    }

});

app.intent(MOVE_PRINTER, (conv) =>{
    const move_direction = conv.parameters[MOVE_PRINTER_DIRECTION].toLowerCase();
    const move_distance = Number(conv.parameters[AMOUNTINTEGER]);
    console.log(move_distance);
    var url = 'http://89.98.102.219:55000/api/printer/printhead';
    if (move_direction == "left"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "x": -move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer head to the left");
    }else if (move_direction == "right"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "x": move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer head to the right");
    }else if (move_direction == "up"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "z": move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer head up");
    } else if (move_direction == "down"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "z": -move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer head down");
    } else if (move_direction == "forward"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "y": move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer bed forward");
    } else if (move_direction == "backward"){
        request.post({ headers: headers, url: url, body: {"command": 'jog', "y": -move_distance}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer bed backward");
    } else if (move_direction == "home"){
        request.post({ headers: headers, url: url, body: {"command": 'home', "axes": ["x","y"]}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask("moving printer head home");
    }else conv.ask("sorry to disappoint you Renee, but i can't do this");
});

app.intent(TEMPERATURE, (conv) =>{
    var TEMPAMOUNT = Number(conv.parameters[AMOUNTINTEGER]);
    const PRINTPART = conv.parameters[PRINTERPART].toLowerCase();
    if(PRINTPART == "head"){
        url = 'http://89.98.102.219:55000/api/printer/tool';
        if (TEMPAMOUNT > 210) {TEMPAMOUNT = 210; conv.ask(`max temperature is ${TEMPAMOUNT} degrees for the print ${PRINTPART}`)}
        request.post({ headers: headers, url: url, body: {"command": 'target', "targets": {"tool0": TEMPAMOUNT}}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask(`setting the ${PRINTPART} to ${TEMPAMOUNT} degrees`);
    }
    else if(PRINTPART == "bed"){
        url = 'http://89.98.102.219:55000/api/printer/bed';
        console.log(TEMPAMOUNT);
        if (TEMPAMOUNT > 65) {TEMPAMOUNT = 65; conv.ask(`max temperature is ${TEMPAMOUNT} degrees for the print ${PRINTPART}`);
        }
        request.post({ headers: headers, url: url, body: {"command": 'target', "target": TEMPAMOUNT}, json: true},function(error, response, body){
            console.log(body);
        });
        conv.ask(`setting the print ${PRINTPART} to ${TEMPAMOUNT} degrees`);
    }
});

app.intent(PREHEAT, (conv) =>{
    url = 'http://89.98.102.219:55000/api/printer/tool';
    request.post({ headers: headers, url: url, body: {"command": 'target', "targets": {"tool0": 205}}, json: true},function(error, response, body){
        console.log(body);
    });
    url = 'http://89.98.102.219:55000/api/printer/bed';
    request.post({ headers: headers, url: url, body: {"command": 'target', "target": 65}, json: true},function(error, response, body){
        console.log(body);
    });
    conv.ask(`preheating the 3d printer`);
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);