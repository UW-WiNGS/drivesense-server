var config = {};

config.database = {};
config.google = {};
config.facebook = {};

config.database.host = "localhost";
config.database.user = "root";
config.database.password = "";
config.database.db = "drivesense_wings";

config.google.clientID = "83228343356-ooeejimtmb7cn3bsnkr06ve67nip7e6o.apps.googleusercontent.com";

config.facebook.clientID = "1788457604730877";
config.facebook.clientSecret = "test";



module.exports = config;

require("./localconfig.js")