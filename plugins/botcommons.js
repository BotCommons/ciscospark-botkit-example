//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

//
// Adds meta information about the bot, and exposes them at a public endpoint 
//
module.exports = function (controller, bot) {

    //
    // OVERRIDE WITH YOUR BOT INFORMATION
    // Check the BotCommons specifications for more information: https://github.com/BotCommons/BotCommons-Specification
    //
    var botcommons = {

        // Bot description
        "description": "Example of a `Cisco Spark` bot, implemented with **Botkit**, and conforming to the [BotCommons specifications](https://github.com/BotCommons/BotCommons-Specification).",

        // Where to get more information about the bot
        "url": "https://github.com/BotCommons/ciscospark-botkit-example",

        // Version of the bot from a user perspective (in terms of features)
        "version" : "0.1.0",

        // Legal owner
        "owner": "Cisco DevNet <https://developer.cisco.com>",

        // Contact name for support
        "contact": "Stève Sfartz <mailto:stsfartz@cisco.com>",

        // Messaging platform
        // note that a bot.type variable is exposed by Botkit
        "plaform": "ciscospark",

        // the precise bot identity is loaded asynchronously, as /people/me request - issued by "Botkit CiscoSparkBot.js" - returns
        "identity": "unknown",

        // Endpoint where to check the bot is alive
        "healthcheck": "https://" + controller.config.public_address + process.env.HEALTHCHECK_ROUTE,

        // BotCommons specifications version (should be an href)
        "botcommons": "https://github.com/BotCommons/BotCommons-Specification/releases/0.1.0",
    }

    // Making metadata accessible from skills
    controller.metadata = botcommons;

    // Adding a metadata endpoint
    var route = process.env.BOTCOMMONS_ROUTE || "/botcommons";
    controller.webserver.get(route, function (req, res) {

        // As the identity is load asynchronously, we need to check if it's been fetched
        if (controller.metadata.identity == "unknown") {
            // Get the latest status: either the fetched identity or undefined
            if (bot.botkit.identity) {
                controller.metadata.identity = bot.botkit.identity.emails[0];
            }
        }

        res.json(controller.metadata);
    });

    console.log("Bot metadata available at: " + route);
}
