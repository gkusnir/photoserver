const server = require("../server.js");
const request = require("http");
const matchers = require("./serverMatchers.js");

const PORT = 8001;

const SCRIPT_RUNS = {
    "script-1-ok.js": {exitCode: 0},
    "script-2-err.js": {exitCode: 1},
    "script-3-ok-msg.js": {exitCode: 0, message: ""},
    "script-4-ok-fail-msg.js": {exitCode: 0, message: "", result: "fail"},
    "script-5-err-fail-msg.js": {},
    "script-6-err-msg.js": {},
};

const SCRIPT_LIST = Object.keys(SCRIPT_RUNS);

const API_TESTS = [
    {
        path: "/api/version/?x=1",
        expect: {version: "0.1"},
    },
    {
        path: "/api/settings",
        expectValues: {host: "localhost", port: PORT},
        expectKeys: {scriptPath: ""}
    },
    {
        path: "/api/scripts/list",
        expectToBeList: SCRIPT_LIST,
    },
    {
        path: "/api/scripts/run",
        expectValues: {status: "error"},
        expectKeys: {status: "", error: ""}
    },
    {
        path: "/api/scripts/run?script=",
        expectValues: {status: "error"},
        expectKeys: {status: "", error: ""}
    },
    {
        path: "/api/scripts/run?file=script-1-ok.js",
        expectValues: {status: "error"},
        expectKeys: {status: "", error: ""}
    },
    {
        path: "/api/scripts/run?script=nonexistent-file.js",
        expectValues: {status: "error"},
        expectKeys: {status: "", error: ""}
    },
    {
        path: "/api/scripts/run?script=script-1-ok.js",
        expectValues: {status: "ok"},
    },
    
];

matchers.injectMatchers();

describe("server.js", function() {
    let srv;

    beforeAll(function(done) {
        srv = server.startServer({port:PORT}, ()=>{
            expect(srv).toBeDefined();
            expect(srv.listening).toBe(true);
            done();
        });
    });

    afterAll(done => {
        server.stopServer((err)=>{
            expect(err).not.toBeDefined();
            expect(server.isRunning()).toBeFalse();
            done();
        });
    });


    // testing api calls

    API_TESTS.forEach(test => {
        it(`should return a result for ${test.path}`, (done)=>{
            req = request.get(`http://localhost:${PORT}${test.path}`, (res)=>{
                expect(res.statusCode).toBe(200);
                let data = '';
                res.on("data",(chunk)=>{ data += chunk; });
                res.on("end", ()=>{
                    expect(data).toBeInstanceOf(String);
                    expect(data).toBeOfType("json");
                    let jsdata = JSON.parse(data);
                    if (test.expectKeys || test.expect) expect(jsdata).toHaveMembers(test.expectKeys || test.expect);
                    if (test.expectValues || test.expect) expect(jsdata).toHaveValues(test.expectValues || test.expect);
                    if (test.expectToBeList) expect(jsdata).toBeList(test.expectToBeList);
                    done();
                });
            });
            req.on("error", err=>{
                done.fail(err);
            });
        });
    });

    // testing script running

    let script = SCRIPT_LIST[Math.floor(Math.random() * SCRIPT_LIST.length)];

    /*it(`should run the script but not specify the script and wait for error `, (done) => {
        req = request.get(`http://localhost:${PORT}/api/scripts/run`, (res)=>{
            expect(res.statusCode).toBe(200);
            let data = '';
            res.on("data",(chunk)=>{ data += chunk; });
            res.on("end", ()=>{
                expect(data).toBeInstanceOf(String);
                expect(data).toBeOfType("json");
                let jsdata = JSON.parse(data);
                expect(jsdata).toHaveMembers({status: "error", error: ""});
                expect(jsdata).toHaveValues({status: "error"});
                done();
            });
        });
        req.on("error", err=>{
            done.fail(err);
        });
    });*/

    /*it(`should run the script '${script}' and wait for result `, (done) => {
        req = request.get(`http://localhost:${PORT}/api/scripts/run?script=${script}`, (res)=>{
            expect(res.statusCode).toBe(200);
            let data = '';
            res.on("data",(chunk)=>{ data += chunk; });
            res.on("end", ()=>{
                expect(data).toBeInstanceOf(String);
                expect(data).toBeOfType("json");
                let jsdata = JSON.parse(data);
                expect(jsdata).toHaveMembers({status: "ok"});
                //expect(jsdata).toHaveValues({status: "ok"});
                done();
            });
        });
        req.on("error", err=>{
            done.fail(err);
        });
    });*/
    




});

