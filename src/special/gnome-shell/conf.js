const GLib = imports.gi.GLib;

function Conf(props) {
    this._init(props);
}

Conf.prototype = {
    _init: function(props) {
        this._options = props.options;
        this._dir = props.dir;
        this._file = props.file;
        this._version = props.version;
    },

    saveFrom: function(object) {
        let configDir = GLib.get_user_config_dir() + this._dir;
        let configFile = configDir + this._file;
        let fileData = null;
        let jsonData = {};

        if (GLib.file_test(configDir, GLib.FileTest.EXISTS | GLib.FileTest.IS_DIR) == false && GLib.mkdir_with_parents(configDir, 0x1ed) != 0)
            global.logError("Failed to create configuration directory. Path = " +  configDir + ". Configuration will not be saved.");
        
        try {
            jsonData["version"] = this._version;

            for (let i = 0; i < this._options.length; i++) { 
                let option = this._options[i]; 

                if (jsonData.hasOwnProperty(option[1]) == false)
                    jsonData[option[1]] = {};       

                jsonData[option[1]][option[2]] = object[option[0]];
            }

            fileData = JSON.stringify(jsonData, null, "  ");
            GLib.file_set_contents(configFile, fileData, fileData.length);
        } catch (e) {
            global.logError("Error writing config file = " + e); 
        } finally {
            jsonData = null;
            fileData = null;
        }
                                                   
        global.log("Updated config file = " + configFile);
    },

    loadInto: function(object) {
        for (let i = 0; i < this._options.length; i++) {
            this[this._options[i][0]] = this._options[i][3];
            object[this._options[i][0]] = this[this._options[i][0]];
        }

        let configDirs = [GLib.get_system_config_dirs(), GLib.get_user_config_dir()];

        for (var i = 0; i < configDirs.length; i++) {
            let configFile = configDirs[i] + this._dir + this._file;

            if (GLib.file_test(configFile, GLib.FileTest.EXISTS)) {
                let fileData = null;

                try {
                    fileData = GLib.file_get_contents(configFile, null, 0);
                    global.log("Using config file = " + configFile);

                    let jsonData = JSON.parse(fileData[1]);
                    let parserVersion = null;

                    if (jsonData.hasOwnProperty("version"))
                        parserVersion = jsonData.version;
                    else
                        throw "Config parser version not defined";

                    for (let i = 0; i < this._options.length; i++) {
                        let option = this._options[i];

                        if (jsonData.hasOwnProperty(option[1]) && jsonData[option[1]].hasOwnProperty(option[2]))
                            object[option[0]] = jsonData[option[1]][option[2]];
                    }
                } catch (e) {
                    global.logError("Error reading config file " + configFile + ", error = " + e);
                } finally {
                    fileData = null;
                }
            }
        }
    }
};
