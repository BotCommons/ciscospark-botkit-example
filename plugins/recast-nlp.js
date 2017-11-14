//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Adds Recast NLP as a botkit middleware
 */
if (!process.env.RECAST_TOKEN) {
    console.log('No bot token found, env variable RECAST_TOKEN is not set');
    console.log('Recast plugin not loaded');
}
else {
    var RecastaiMiddleware = require('botkit-middleware-recastai')({
        request_token: process.env.RECAST_TOKEN,
        confidence: 0.4
    });

    module.exports = function (controller, bot) {

        controller.middleware.receive.use(RecastaiMiddleware.receive);

        console.log('Recast NLP added to enrich user messages');
    }
}