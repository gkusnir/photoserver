/*
    web server as an interface for running nodejs scripts
    api server functions

    https://github.com/JoshuaWise/request-target/blob/master/index.js
    https://nodejs.org/api/url.html#the-whatwg-url-api
    https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
    https://github.com/mscdex/busboy

*/

const fs = require("fs");
const path = require("path");
const urlparse = require("request-target");
const modurl = require("url");
const { fork } = require('child_process');
const Busboy = require('busboy');

let settings = {};
let scripts = {};

const IGNORE_FILE = ".scriptignore";

function requestListener(req, res) {
    let reqparams = urlparse(req);
    let url = new modurl.URL(req.url, `http://${settings.host}:${settings.port}`);
    
    let pathname = reqparams.pathname[reqparams.pathname.length - 1] == '/' ? reqparams.pathname.substring(0,reqparams.pathname.length - 1) : reqparams.pathname;
    // use path without trailing slash
    let script_name;
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
        case "/api/scripts/upload":
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end('<html><body> \
                <form action="/api/scripts/save" method="post" enctype="multipart/form-data"> \
                    <input type="file" name="scriptfile" /> \
                    <input type="submit" /> \
                </form> \
                </body></html>');
            return;
    
        case "/api/scripts/save":
            if (req.method !== 'POST') {
                res.end(JSON.stringify({status: "error", error: "wrong http method"}));
                return;
            }
            let busboy = new Busboy({ headers: req.headers });
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                let script_path;
                if (path.isAbsolute(settings.scriptPath)) script_path = path.normalize(settings.scriptPath);
                else script_path = path.normalize(path.join(process.cwd(), settings.scriptPath));
                let saveTo = path.join(script_path, path.basename(filename));
                file.pipe(fs.createWriteStream(saveTo));
            });
            busboy.on('finish', function() {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"ok"}));
                return;
            });
            busboy.on('error', err => {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error", error: err.stack}));
                return;
            });
            return req.pipe(busboy);

        case "/api/scripts/run":
            script_name = url.searchParams.get("script");
            if (!script_name) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:"missing script parameter "}));
                return;
            }
            let script_path;
            if (path.isAbsolute(settings.scriptPath)) script_path = path.normalize(path.join(settings.scriptPath, script_name));
            else script_path = path.normalize(path.join(process.cwd(), settings.scriptPath, script_name));
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
        case "/api/scripts/status":
            script_name = url.searchParams.get("script");
            if (!script_name) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:"missing script parameter "}));
                return;
            }
            if (scripts[script_name]) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(getScriptListFull(settings.scriptPath, scripts)[script_name]));
                return;
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:`script ${script_name} does not exist `}));
                return;
            }
        case "/api/scripts/kill":
            script_name = url.searchParams.get("script");
            if (!script_name) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:"missing script parameter "}));
                return;
            }
            if (scripts[script_name]) {
                try {
                    if (scripts[script_name].status == "running") {
                        if (scripts[script_name].process.kill()) {
                            scripts[script_name].status = "killed";
                            res.setHeader('Content-Type', 'application/json');
                            res.writeHead(200);
                            res.end(JSON.stringify({status:"ok"}));
                            return;
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                            res.writeHead(200);
                            res.end(JSON.stringify({status:"error",error:`unsuccessful kill attempt for script '${script_name}' `}));
                            return;
                        }
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(200);
                        res.end(JSON.stringify({status:"ok"}));
                        return;
                    }
                } catch(e) {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.end(JSON.stringify({status:"error",error:e.stack}));
                    return;
                }
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({status:"error",error:`script ${script_name} does not exist `}));
                return;
            }
    

        default:
            res.writeHead(404);
            res.end("page not found");
            return;
    }
}

function getScriptListFull(dir, scripts) {
    synchScriptList(dir, scripts);
    let keysToExclude = ["process"];
    let outScripts = {};
    Object.keys(scripts).forEach(s => {
        outScripts[s] = {}
        Object.keys(scripts[s]).forEach(e => {
            if (!keysToExclude.includes(e)) {
                outScripts[s][e] = scripts[s][e];
            }
        });
    });
    return outScripts;
}

function getScriptList(dir, scripts) {
    return Object.keys(getScriptListFull(dir, scripts));
}

function getScriptFileList(dir) {
    if (path.isAbsolute(dir)) dir = path.normalize(dir);
    else dir = path.normalize(path.join(process.cwd(), dir));
    let fl = fs.readdirSync(dir,{withFileTypes:true});
    let ignore = getIgnoredFiles(dir);
    
    let outList = [];
    for (let f in fl) {
        if (ignore.includes(fl[f].name)) continue;
        if (!fl[f].isFile()) continue;
        outList.push(fl[f].name);
    }
    return outList;
}

function getIgnoredFiles(dir) {
    let ignoreFilePath = path.normalize(path.join(dir, IGNORE_FILE));
    if (!fs.existsSync(ignoreFilePath)) return [IGNORE_FILE];
    let ignoreFileContents = fs.readFileSync(ignoreFilePath, "utf8");
    let lines = ignoreFileContents.split(/\r?\n/);
    let outLines = lines.filter(str => str);
    outLines.push(IGNORE_FILE);
    return outLines;
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
    scripts[script].status = 'exited';
    scripts[script].stdout = stdout;
    scripts[script].stderr = stderr;
    scripts[script].exitCode = code;
    scripts[script].stopTime = Date.now();
    scripts[script].error = err instanceof Error ? err.stack : err;
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

    scripts[scriptFile].status = 'running';
    scripts[scriptFile].stdout = null;
    scripts[scriptFile].stderr = null;
    scripts[scriptFile].exitCode = 0;
    scripts[scriptFile].startTime = Date.now();
    scripts[scriptFile].stopTime = null;
    scripts[scriptFile].error = null;
    scripts[scriptFile].process = child;
    
    return child;

}


module.exports = {
    requestListener: requestListener,
    settings: settings,
};
