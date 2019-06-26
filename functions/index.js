const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const tabletojson = require('tabletojson');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const request = require('request');

//intents
const BRIDGE_STATE = 'Bridge_State';
const BRIDGE_CLOSE = 'Bridge_Close';
const BRIDGE_DURATION = 'Bridge_Duration';
const BRIDGE_FUTURE = 'Bridge_Future';

//entities
const BRIDGE_LOCATION = 'Bridge_Location';

class Helper {
    constructor(conv) {
        this.conv = conv;
    }

    getBridge(bridge) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        let obj = JSON.parse(body);
                        let BridgeName = obj[0]["id"];
                        let bridgeState = obj[0]["open"];

                        if (bridgeState === "begaanbaar") {
                            answer = ("De " + BridgeName + " is begaanbaar");
                            resolve(answer)
                        } else {
                            answer = ("De " + BridgeName + " is Open");
                            resolve(answer)
                        }
                    } catch (e) {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer)
                    }
                } else {
                    answer = "De brug geeft geen antwoord.";
                    reject(answer)
                }
            });
        });
    }

    closeBridge(bridge) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        let obj = JSON.parse(body);
                        let BridgeName = obj[0]["id"];
                        let bridgeState = obj[0]["open"];
                        //bridgeState = "open";

                        if (bridgeState === "begaanbaar") {
                            answer = ("De " + BridgeName + " is begaanbaar.");
                            reject(answer);
                        } else {
                            answer = BridgeName;
                            resolve(answer);
                        }
                    } catch (e) {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer)
                    }
                } else {
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);

                }
            });
        });
    }

    getBridgeName(bridge) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://secretappdeveloper.com/bridgeApi.php/Bridges/' + bridge, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        let obj = JSON.parse(body);
                        let BridgeName = obj[0]["id"];
                        resolve(BridgeName);
                    } catch (e) {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer)
                    }
                } else {
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);
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
                    try {
                        const table = dom.window.document.querySelector("#wrapper > div.content-section-a > div.container > div > div:nth-child(1) > div > table").innerHTML;
                        let tableAsJson = tabletojson.convert("<table>" + table + "</table>");
                        let tableAsJson1 = tableAsJson[0];
                        tableAsJson1.forEach(function (entry) {
                            let name = entry['Naam / Plaats'];
                            if (name.includes(bridgeName)) {
                                console.log(entry['Naam / Plaats']);
                                console.log(entry['Duur']);
                                let closingTime = entry['Tot'];

                                console.log("Time Remaining:" + closingTime);
                                answer = ("De " + bridgeName + " gaat dicht om " + closingTime + ".");
                                resolve(answer);
                            }
                        });
                    } catch {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer);
                    }
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);
                }
            });
        })
    };

    checkOpenDuration(bridgeName) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://www.brug-open.nl', (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const dom = new JSDOM(body);
                    try {
                        const table = dom.window.document.querySelector("#wrapper > div.content-section-a > div.container > div > div:nth-child(1) > div > table").innerHTML;
                        let tableAsJson = tabletojson.convert("<table>" + table + "</table>");
                        let tableAsJson1 = tableAsJson[0];
                        tableAsJson1.forEach(function (entry) {
                            let name = entry['Naam / Plaats'];
                            if (name.includes(bridgeName)) {
                                console.log(entry['Naam / Plaats']);
                                console.log(entry['Duur']);
                                let closingTime = entry['Duur'];

                                console.log("Time Remaining:" + closingTime);
                                answer = ("De " + bridgeName + " is al " + closingTime + " Minuten Open.");
                                resolve(answer);
                            }
                        });

                    } catch {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer);
                    }
                    answer = "De " + bridgeName + " geeft geen antwoord.";
                    reject(answer);
                } else {
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);
                }
            });
        })
    };

    checkFuture(bridgeName) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('https://www.brug-open.nl', (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const dom = new JSDOM(body);
                    //console.log(body)
                    try {
                        const table = dom.window.document.querySelector("#wrapper > div.content-section-a > div.container > div > div:nth-child(2) > div > table").innerHTML;
                        //console.log(table);
                        let tableAsJson = tabletojson.convert("<table>" + table + "</table>");
                        let tableAsJson1 = tableAsJson[0];
                        //console.log(tableAsJson1)
                        //bridgeName = 'Vlotbrug';
                        tableAsJson1.forEach(function (entry) {
                            let name = entry['Naam / Plaats'];
                            if (name.includes(bridgeName)) {
                                console.log(entry['Naam / Plaats']);
                                console.log(entry['Duur']);
                                let openTime = entry['Vanaf'];

                                console.log("Time Remaining:" + openTime);
                                answer = ("Volgens de planning gaat de " + bridgeName + " om " + openTime + " open.");
                                resolve(answer);
                            }
                        });
                    } catch {
                        answer = "De brug geeft geen antwoord.";
                        reject(answer);
                    }
                    answer = "De volgende openings tijd van de " + bridgeName + " is nog niet bekend.";
                    reject(answer);
                } else {
                    console.log('3');
                    answer = "De brug geeft geen antwoord.";
                    reject(answer);
                }
            });
        })
    };

    sayMessage(message) {
        console.log(message);
        this.conv.ask(message + " \n \n Kan ik nog ergens anders mee helpen?");
    }
}

const app = dialogflow().middleware(conv => {
    conv.helper = new Helper(conv);
});


//intents
app.intent(BRIDGE_STATE, async (conv) => {
    console.log(BRIDGE_STATE);
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.getBridge(Bridge).then(message => conv.helper.sayMessage(message), error => console.log(error));
});

app.intent(BRIDGE_CLOSE, async (conv) => {
    console.log(BRIDGE_CLOSE);
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.closeBridge(Bridge).then(bridge => conv.helper.checkCloseTime(bridge).then(message => conv.helper.sayMessage(message), message => conv.helper.sayMessage(message)), message => conv.helper.sayMessage(message));
});

app.intent(BRIDGE_DURATION, async (conv) => {
    console.log(BRIDGE_DURATION);
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.getBridgeName(Bridge).then(bridge => conv.helper.checkOpenDuration(bridge).then(message => conv.helper.sayMessage(message), message => conv.helper.sayMessage(message)), message => conv.helper.sayMessage(message));
});

app.intent(BRIDGE_FUTURE, async (conv) => {
    console.log(BRIDGE_FUTURE);
    const Bridge = conv.parameters[BRIDGE_LOCATION].toLowerCase();
    await conv.helper.getBridgeName(Bridge).then(bridge => conv.helper.checkFuture(bridge).then(message => conv.helper.sayMessage(message), message => conv.helper.sayMessage(message)), message => conv.helper.sayMessage(message));
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);