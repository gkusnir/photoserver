function isJson(json) {
    try {
        let d = JSON.parse(json);
        return true;
    } catch {
        return false;
    }
}

/*
    valid MATCHes
    type,typeonly - matches the type only
    members - matches type and all the members of 'expected' must be present in 'actual'
*/

function injectMatchers() {
    beforeEach(function(){
        jasmine.addMatchers({
            toBeOfType: function(){
                return {
                    compare: function(actual,expected) {
                        switch(expected.toLowerCase()) {
                            case "json":
                                return {
                                    pass: isJson(actual),
                                    message: "not a json string "
                                };
                            default:
                                return {
                                    pass: false,
                                    message: `unknown type '${expected}' `
                                };
                        }
                    }
                };
            },
            toHaveMembers: function(){
                return {
                    compare: function(actual,expected) {
                        for (key in expected) {
                            if (actual[key] === undefined) {
                                return {
                                    pass: false,
                                    message: `missing key '${key}' `
                                };
                            }
                            return {pass: true};
                        }
                    }
                };
            },
            toHaveValues: function(){
                return {
                    compare: function(actual,expected) {
                        for (key in expected) {
                            if (actual[key] !== expected[key]) {
                                return {
                                    pass: false,
                                    message: `value of '${key}' is different`
                                };
                            }
                            return {pass: true};
                        }
                    }
                };
            },
            toBeList: function(){
                return {
                    compare: function(actual,expected) {
                        if (!(!!actual && actual.constructor === Array)) {
                            return {
                                pass: false,
                                message: `value is not an array `
                            };
                        }
                        for (let item in expected) {
                            if (!(actual.includes(expected[item]))) {
                                return {
                                    pass: false,
                                    message: `value is different `
                                };
                            }
                        }
                        return {pass: true};
                    }
                };
            }
        });
    });
}

module.exports = {
    injectMatchers: injectMatchers,
};
