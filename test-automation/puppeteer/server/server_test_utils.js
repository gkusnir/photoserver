const path = require("path");
const fs = require("fs");


module.exports = {
    beforeServerStart: function(settings) {
        let script_path;
        if (path.isAbsolute(settings.scriptPath)) script_path = path.normalize(settings.scriptPath);
        else script_path = path.normalize(path.join(process.cwd(), settings.scriptPath));
        let deleteScript = path.join(script_path, settings.deleteScriptBeforeServerStart);
        if (fs.existsSync(deleteScript)) fs.unlinkSync(deleteScript);
    }
};
