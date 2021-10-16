const server = require("../server.js");
const request = require("request");

let srv = server.startServer();

describe("server.js", function() {
    it("should start web server on localhost:8000", function() {
        expect(srv).toBeDefined();
    });
});

req = request.get("http://localhost:8000", function(res) {
    describe("server", ()=>{
        it("should serve a page with statuscode 200", ()=>{
            expect(res.statusCode).toEqual(200);
        });
    });
});


