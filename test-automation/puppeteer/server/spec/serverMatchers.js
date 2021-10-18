function isJson(json) {
    try {
        let d = JSON.decrypt(json);
        return true;
    } catch {
        return false;
    }
}

const TYPES = {
    json: 0,

}

const MATCHES = {
    type: 0,
    members: 1,
    members_and_value_types: 2,
    members_and_value_values: 3,
}

function match(test, value) {
    switch (test.type) {
        case TYPES.json:
            return isJson(value);
    }
    return false;
}

module.exports = {
    isJson: isJson,
    TYPES: TYPES,
    MATCHES: MATCHES,
    match: match,
};
