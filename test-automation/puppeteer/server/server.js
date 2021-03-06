/*
    web server as an interface for running nodejs scripts

    https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module
    https://stackoverflow.com/a/22649812/5802615
    https://jasmine.github.io/setup/nodejs.html
    https://www.testim.io/blog/jasmine-js-a-from-scratch-tutorial-to-start-testing/
    https://stackoverflow.com/a/6090287/5802615
    http://dillonbuchanan.com/programming/gracefully-shutting-down-a-nodejs-http-server/
    https://github.com/thedillonb/http-shutdown
    https://riptutorial.com/jasmine
    https://stackoverflow.com/a/67596281/5802615
    https://jasmine.github.io/1.3/introduction.html#section-Asynchronous_Support
    https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html

*/

const http = require("http");
const requestListener = require("./server_api.js").requestListener;
let api_settings = require("./server_api.js").settings;
let testUtils;
try{ testUtils = require("./server_test_utils.js"); } catch(e){ testUtils = {beforeServerStart: ()=>{}, }; }

let settings = {
    host: 'localhost',
    port: 8000,
    server: null,
    requestListener: requestListener,
    running: false,
    writeToConsole: false,
    configFile: "server-config.json",
    scriptPath: ".",
};

let transferSettingsKeys = [
    "host",
    "port",
    "scriptPath",
]

function transferSettings() {
    transferSettingsKeys.forEach(key => {
        if (settings[key]) {
            api_settings[key] = settings[key];
        }
    });
}

function getSettings() {
    return Object.create(settings);
}

function startServer(config = {}, callback) {
    try{
        configFromFile = require("./server-config.json");
        settings = Object.assign(settings, configFromFile);
    } catch(e) {
        // missing config file        
    }
    settings = Object.assign(settings, config);
    testUtils.beforeServerStart(settings);
    settings.server = http.createServer(settings.requestListener);
    settings.server = require('http-shutdown')(settings.server);
    settings.running = true;
    settings.server.listen(settings.port, settings.host, () => {
        if (settings.writeToConsole) console.log(`Server is running on http://${settings.host}:${settings.port}`);
        try{ callback(); } catch {}
    });
    transferSettings();
    return settings.server;
}

function stopServer(callback) {
    if (settings.writeToConsole) console.log(`Stopping server running on http://${settings.host}:${settings.port}`);
    settings.server.shutdown((err)=>{
        settings.running = false;
        try{ callback(err); } catch {}
    });
}

function isRunning() {
    return settings.running;
}

module.exports = {
    startServer: startServer,
    stopServer: stopServer,
    isRunning: isRunning,
    getSettings: getSettings
};

if (typeof require !== 'undefined' && require.main === module) {

    let argv = process.argv.slice(2);

    let settings = {};

    argv.forEach(arg => {
        let tt = arg.split("=");
        switch (tt[0]) {
            case "--host":
                settings.host = tt[1];
                break;
            case "--port":
                settings.port = parseInt(tt[1]);
                break;
            case "--write-to-console":
                settings.writeToConsole = true;
                break;
            case "--script-path":
                settings.scriptPath = tt[1];
                break;
        }
    });

    startServer(settings);
    
}
