//
// Displays the BotCommons information in a user-friendly format
//
module.exports = function (controller, bot) {

    var formatted;
    controller.hears([/^about$/], 'direct_message,direct_mention', function (bot, message) {

        if (!formatted) {

            // [WORKAROUND] Update metadata
            // As the identity is load asynchronously from Cisco Spark token, we need to check until it's fetched
            if ((controller.metadata.identity == "unknown") && (bot.botkit.identity)) {
                controller.metadata.identity = bot.botkit.identity.emails[0];
            }

            formatted = `> \"${controller.metadata.description}\" Click [here](${controller.metadata.url}) for more details.<br><br>The legal representative is: \`${controller.metadata.owner}\`, and you can send feedback or get support at: \`${controller.metadata.contact}\`.<br>This bot is currently in version \`${controller.metadata.version}\`, and proposes an [healthcheck endpoint](${controller.metadata.healthcheck}).<br>_Brought to you by [BotCommons](${controller.metadata.botcommons})_`;
        }

        // 
        // Build user formatted message
        bot.reply(message, formatted);
    });
}
