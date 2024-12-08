class Utils {
    static methodName() {}

    static loadConfig(filePath) {
        const fs = require("fs");
        const path = require("path");
        const configPath = path.resolve(__dirname, filePath);
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
}

module.exports = Utils;
