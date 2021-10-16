/*
    web server as an interface for running nodejs scripts

    https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module
    https://stackoverflow.com/a/22649812/5802615
    https://jasmine.github.io/setup/nodejs.html
    https://www.testim.io/blog/jasmine-js-a-from-scratch-tutorial-to-start-testing/
    https://stackoverflow.com/a/6090287/5802615

*/

const http = require("http");
const childProcess = require('child_process');

let settings = {
    host: 'localhost',
    port: 8000,
    server: null,
    requestListener: 
        function (req, res) {
            res.writeHead(200);
            res.end("server is running at "+ settings.host + ":" + settings.port);
        }
};

function runScript(scriptPath, callback) {

    var callbackInvoked = false;

    var process = childProcess.fork(scriptPath);

    process.on('error', function (err) {
        if (callbackInvoked) return;
        callbackInvoked = true;
        callback(err);
    });

    process.on('exit', function (code) {
        if (callbackInvoked) return;
        callbackInvoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

    return process;

}

// Now we can run a script and invoke a callback when complete, e.g.
/*runScript('./some-script.js', function (err) {
    if (err) throw err;
    console.log('finished running some-script.js');
});*/

function startServer(config = {}) {
    settings = Object.assign(settings, config);
    settings.server = http.createServer(settings.requestListener);
    settings.server.listen(settings.port, settings.host, () => {
        console.log(`Server is running on http://${settings.host}:${settings.port}`);
    });
    return settings.server;
}

function stopServer() {
    console.log(`Stopping server running on http://${settings.host}:${settings.port}`);
    settings.server.close();
}

module.exports = {
    runScript: runScript,
    startServer: startServer,
    stopServer: startServer
};

if (typeof require !== 'undefined' && require.main === module) {
    startServer();
}
