/*
    web server as an interface for running nodejs scripts
    api server functions

    https://github.com/JoshuaWise/request-target/blob/master/index.js
    https://nodejs.org/api/url.html#the-whatwg-url-api
    https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/

*/

const fs = require("fs");
const path = require("path");
const urlparse = require("request-target");
const modurl = require("url");
const { fork } = require('child_process');

let settings = {};
let scripts = {};

function requestListener(req, res) {
    let reqparams = urlparse(req);
    let url = new modurl.URL(req.url, `http://${settings.host}:${settings.port}`);
    
    let pathname = reqparams.pathname[reqparams.pathname.length - 1] == '/' ? reqparams.pathname.substring(0,reqparams.pathname.length - 1) : reqparams.pathname;
    // use path without trailing slash
    
    switch(pathname) {
        case "/api/version":
        case "/api":
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
                version: "0.1",
                name: settings.name || "server"
            }));
            return;
        case "/api/settings":
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(settings));
            return;
        case "/api/scripts/list":
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(getScriptList(settings.scriptPath, scripts)));
            return;
        case "/api/scripts/run":
            let script_name = url.searchParams.get("script");
            if (!script_name) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:"missing script parameter "}));
                return;
            }
            let script_path = path.normalize(path.join(process.cwd(), settings.scriptPath, script_name));
            if (!fs.existsSync(script_path)) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:`script file ${script_path} does not exist `}));
                return;
            }
            try {
                runScript(script_path, scriptExit);
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"ok"}));
                return;
            } catch (e) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error", error: e.stack}));
                return;
            }
        default:
            res.writeHead(404);
            res.end("page not found");
            return;
    }
}

function getScriptList(dir, scripts) {
    synchScriptList(dir, scripts);
    return scripts;
}

function getScriptFileList(dir) {
    dir = path.normalize(path.join(process.cwd(), dir));
    let fl = fs.readdirSync(dir);
    return fl;
}

function synchScriptList(dir, scripts) {
    let fl = getScriptFileList(dir);
    for(let f in fl) {
        if (scripts[fl[f]] === undefined) {
            scripts[fl[f]] = {status: 'ready', stdout: null, stderr: null, exitCode: 0, startTime: null, stopTime: null, error: null, process: null};
        }
    }
    for(let s in Object.keys(scripts)) {
        if (!fl.includes(s)) {
            delete scripts[s];
        }
    }
    
}

function scriptExit(script, code, err, signal, stdout, stderr) {
    console.log(script, code, err, signal, stdout, stderr);
    // save the status to scripts
}

function runScript(scriptPath, exitCallback, timeout) {

    synchScriptList(settings.scriptPath, scripts);

    let callbackInvoked = false;
    let stderr = "", stdout = "";
    let cwd = path.normalize(path.dirname(scriptPath));
    let scriptFile = path.basename(scriptPath);

    let child = fork(scriptPath, [], {
        cwd: cwd,
        detached: true,
        silent: true,
        timeout: timeout,
    });

    child.on('exit', function (code, signal) {
        if (callbackInvoked) return;
        callbackInvoked = true;
        exitCallback(scriptFile, code, null, signal, stdout, stderr);
    });

    child.on('error', function (err) {
        if (callbackInvoked) return;
        callbackInvoked = true;
        exitCallback(scriptFile, null, err, null, stdout, stderr);
    });

    child.stdout.on('data', data => {
        stdout += data;
    });

    child.stderr.on('data', data => {
        stderr += data;
    });

    scripts[scriptFile] = {
        status: 'running',
        stdout: null,
        stderr: null,
        exitCode: 0,
        startTime: Date.now(),
        stopTime: null,
        error: null,
        process: child,
    };
    
    return child;

}


module.exports = {
    requestListener: requestListener,
    settings: settings,
};
