const server = require("../server.js");
const request = require("http");
const matchers = require("./serverMatchers.js");

const PORT = 8001;

const API_TESTS = [
    {
        path: "/api/version", 
        type: matchers.TYPES.json,
        match: matchers.MATCHES.members_and_value_types, 
        expect: {version: "1.0"},
    }
    //["/api/tasklist", {tasklist: []}]
];

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


    it("should return a web page", (done)=>{
        req = request.get(`http://localhost:${PORT}`, (res)=>{
            expect(res.statusCode).toBe(200);
            let data = '';
            res.on("data",(chunk)=>{ data += chunk; });
            res.on("end", ()=>{
                expect(data).toBeInstanceOf(String);
                done();
            });
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
                    expect(matchers.match(test, data)).toBeTrue();
                    
                    done();
                });
            });
            req.on("error", err=>{
                done.fail(err);
            });
        });
    });


});

