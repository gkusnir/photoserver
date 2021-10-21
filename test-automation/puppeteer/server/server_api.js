/*
    web server as an interface for running nodejs scripts
    api server functions

    https://github.com/JoshuaWise/request-target/blob/master/index.js
    
*/

const fs = require("fs");
const path = require("path");
const urlparse = require("request-target");

let settings = {};
let scripts = {};

function requestListener(req, res) {
    console.log(urlparse(req));

    let url = req.url[req.url.length - 1] == '/' ? req.url.substring(0,req.url.length - 1) : req.url;
    // use path without trailing slash
    
    switch(url) {
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
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(getScriptList(settings.scriptPath)));
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
