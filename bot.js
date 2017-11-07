//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//


var debug = require('debug')('starterkit');


//
// BotKit configuration
//

// Load environment variables from project .env file
require('node-env-file')(__dirname + '/.env');

// Fail fast
if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as bots require a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line or to the .env file");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}

// Get public URL where Cisco Spark will post spaces notifications (webhook registration)
var public_url = process.env.PUBLIC_URL;
// Infer the app domain for popular Cloud PaaS
if (!public_url) {

    // Heroku hosting: available if dyno metadata are enabled, https://devcenter.heroku.com/articles/dyno-metadata
    if (process.env.HEROKU_APP_NAME) {
        public_url = "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com";
    }

    // Glitch hosting
    if (process.env.PROJECT_DOMAIN) {
        public_url = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me";
    }
}
if (!public_url) {
    console.log("Could not start as this bot must expose a public endpoint.");
    console.log("Please add env variable PUBLIC_URL on the command line or to the .env file");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}


//
// Create bot
//

var Botkit = require('botkit');

var env = process.env.NODE_ENV || "development";

var configuration = {
    public_address: public_url,
    ciscospark_access_token: process.env.SPARK_TOKEN,
    secret: process.env.SECRET, // this is a RECOMMENDED security setting that checks if incoming payloads originate from Cisco Spark
    webhook_name: process.env.WEBHOOK_NAME || ('built with BotKit (' + env + ')')
}

// Load extra configuration modules
try {
    var configurationPath = require("path").join(__dirname, "configurations");
    require("fs").readdirSync(configurationPath).forEach(function (file) {
        try {
            if (file.endsWith(".js")) {
                require("./configurations/" + file)(configuration);
                console.log("loaded configuration:" + file);
            }
        }
        catch (err) {
            console.log("error, configuration not loaded: " + file);
        }
    });
}
catch (err) {
    if (err.code == "ENOENT") {
        debug("configurations directory not present, continuing....");
    }
    else {
        // fail fast
        throw err;
    }
}

var controller = require('botkit').sparkbot(configuration);

var sparkbot = controller.spawn({}, function (bot) {
    
        // Load bot extensions: append_mention, botcommons metadata
        try {
            var extensionsPath = require("path").join(__dirname, "extensions");
            require("fs").readdirSync(extensionsPath).forEach(function (file) {
                try {
                    if (file.endsWith(".js")) {
                        require("./extensions/" + file)(bot);
                        debug("extension loaded: " + file);
                    }
                }
                catch (err) {
                    debug("error, could not load extension: " + file);
                }
            });
        }
        catch (err) {
            if (err.code == "ENOENT") {
                debug("extensions directory not present, continuing....");
            }
            else {
                // fail fast
                throw err;
            }
        }
    });


//
// Launch bot
//

// Start Bot API
controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    if (err) {
        console.log("could not start Web server, existing... err: " + err.message);
        throw err;
    }

    controller.createWebhookEndpoints(webserver, sparkbot, function (err, success) {
        debug("Webhook successfully setup");
    });

    // Load extra plugins: middlewares, healthchecks...
    try {
        var pluginsPath = require("path").join(__dirname, "plugins");
        require("fs").readdirSync(pluginsPath).forEach(function (file) {
            try {
                if (file.endsWith(".js")) {
                    require("./plugins/" + file)(controller, sparkbot);
                    debug("plugin loaded: " + file);
                }
            }
            catch (err) {
                debug("error, could not load plugin: " + file);
            }
        });
    }
    catch (err) {
        if (err.code == "ENOENT") {
            debug("plugins directory not present, continuing....");
        }
        else {
            // fail fast
            throw err;
        }
    }

    // Load skills
    try {
        var skillsPath = require("path").join(__dirname, "skills");
        require("fs").readdirSync(skillsPath).forEach(function (file) {
            try {
                if (file.endsWith(".js")) {
                    require("./skills/" + file)(controller);
                    debug("skill loaded: " + file);
                }
            }
            catch (err) {
                debug("error, could not load skill: " + file);
            }
        });
    }
    catch (err) {
        if (err.code == "ENOENT") {
            debug("skills directory not present, aborting....");
        }
        
        // fail fast
        throw err;
    }
});

