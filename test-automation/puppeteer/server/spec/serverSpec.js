const server = require("../server.js");
const request = require("request");

const PORT = 8001;

describe("server.js", function() {
    let srv;

    it(`should start web server on localhost:${PORT}`, function(done) {
        srv = server.startServer({port:PORT}, ()=>{
            expect(srv).toBeDefined();
            expect(srv.listening).toBe(true);
            done();
        });
    });

    it("should return a web page", (done)=>{
        req = request(`http://localhost:${PORT}`, {}, (err,res,body)=>{
            //console.log(res);
            expect(res.statusCode).toBe(200);
            done();
        });

    });

});

