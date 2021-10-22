/*
    web server as an interface for running nodejs scripts
    api server functions

    https://github.com/JoshuaWise/request-target/blob/master/index.js
    https://nodejs.org/api/url.html#the-whatwg-url-api

*/

const fs = require("fs");
const path = require("path");
const urlparse = require("request-target");
const modurl = require("url");

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
            res.end(JSON.stringify(getScriptList(settings.scriptPath)));
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
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({status:"undefined"}));
            return;
        default:
            res.writeHead(404);
            res.end("page not found");
            return;
    }
}

function getScriptList(dir) {
    dir = path.normalize(path.join(process.cwd(), dir));
    let fl = fs.readdirSync(dir);
    return fl;
}

module.exports = {
    requestListener: requestListener,
    settings: settings,
};
