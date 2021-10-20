const server = require("../server.js");
const request = require("http");
const matchers = require("./serverMatchers.js");

const PORT = 8001;

const API_TESTS = [
    {
        path: "/api/version", 
        expect: {version: "0.1"},
    },
    {
        path: "/api/settings", 
        expectValues: {host: "localhost", port: PORT},
        expectKeys: {scriptPath: ""}
    }
    //["/api/tasklist", {tasklist: []}]
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
                    expect(jsdata).toHaveMembers(test.expectKeys || test.expect);
                    expect(jsdata).toHaveValues(test.expectValues || test.expect);
                    done();
                });
            });
            req.on("error", err=>{
                done.fail(err);
            });
        });
    });


});

