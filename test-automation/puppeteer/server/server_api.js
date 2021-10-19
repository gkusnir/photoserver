/*
    web server as an interface for running nodejs scripts
    api server functions
*/

let settings = {};

function requestListener(req, res) {
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
        default:
            res.writeHead(404);
            res.end("page not found");
            return;
    }
}

module.exports = {
    requestListener: requestListener,
    settings: settings,
};
