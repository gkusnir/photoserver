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
        },
    running: false
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

function startServer(config = {}, callback) {
    settings = Object.assign(settings, config);
    settings.server = http.createServer(settings.requestListener);
    settings.server = require('http-shutdown')(settings.server);
    settings.running = true;
    settings.server.listen(settings.port, settings.host, () => {
        console.log(`Server is running on http://${settings.host}:${settings.port}`);
        try{ callback(); } catch {}
    });
    return settings.server;
}

function stopServer(callback) {
    console.log(`Stopping server running on http://${settings.host}:${settings.port}`);
    settings.server.shutdown((err)=>{
        settings.running = false;
        try{ callback(err); } catch {}
    });
}

function isRunning() {
    return settings.running;
}



module.exports = {
    runScript: runScript,
    startServer: startServer,
    stopServer: stopServer,
    isRunning: isRunning
};

if (typeof require !== 'undefined' && require.main === module) {
    startServer();
}
