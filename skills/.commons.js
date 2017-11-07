//
// Adds meta information about the bot, and exposes them at a public endpoint 
//
module.exports = function (controller, bot) {

    //
    // .botcommons skill
    //
    var botcommons = controller.metadata;    

    controller.hears([/^botcommons$/, /^\.commons$/, /^\.bot$/], 'direct_message,direct_mention', function (bot, message) {

        // [WORKAROUND] Update metadata
        // As the identity is load asynchronously from Cisco Spark token, we need to check until it's fetched
        if ((botcommons.identity == "unknown") && (bot.botkit.identity)) {
            botcommons.identity = bot.botkit.identity.emails[0];
        }

        bot.reply(message, '```json\n' + JSON.stringify(botcommons) + '\n```');
    });

}
