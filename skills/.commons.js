//
// Adds meta information about the bot
//
var jsonFormat = require('json-format');

module.exports = function (controller, bot) {

    var botcommons;
    controller.hears([/^botcommons$/, /^\.commons$/, /^\.bot$/], 'direct_message,direct_mention', function (bot, message) {

        if (!botcommons) {
            // [WORKAROUND] Update metadata
            // As the identity is load asynchronously from Cisco Spark token, we need to check until it's fetched
            if ((controller.metadata.identity == "unknown") && (bot.botkit.identity)) {
                controller.metadata.identity = bot.botkit.identity.emails[0];
            }

            var config = {
                type: 'space',
                size: 2
            }
            botcommons = jsonFormat(controller.metadata, config);
        }

        bot.reply(message, '```json\n' + botcommons + '\n```');
    });

}
