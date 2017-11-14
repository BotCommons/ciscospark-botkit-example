var maze = require('./utils/mazelib')

module.exports = function (controller) {

    controller.hears([/maze/], "direct_message,direct_mention", function (bot, message) {

        bot.startConversation(message, function (err, convo) {

            convo.setVar('current', maze.pickInitialPosition());
            convo.transitionTo('pick_direction', "Then here you are, in the maze, looking for the treasure!");

            convo.addQuestion("Which direction do you wanna go? (up,down,left,right)", [
                {
                    pattern: "left|west",
                    callback: function (response, convo) {
                        convo.setVar('direction', 'left')
                        convo.gotoThread('move');
                    },
                },
                {
                    pattern: "right|east",
                    callback: function (response, convo) {
                        convo.setVar('direction', 'right')
                        convo.gotoThread('move');
                    },
                },
                {
                    pattern: "up|upper|top|above|north",
                    callback: function (response, convo) {
                        convo.setVar('direction', 'up')
                        convo.gotoThread('move');
                    },
                },
                {
                    pattern: "down|below|south|bottom",
                    callback: function (response, convo) {
                        convo.setVar('direction', 'down')
                        convo.gotoThread('move');
                    },
                },
                {
                    pattern: "map|help",
                    callback: function (response, convo) {
                        let pos = convo.vars['current'];
                        convo.setVar('map', maze.show(pos)),
                        convo.gotoThread('show_map');                    
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.say("Sorry, I don't know this direction. Try again...");
                        convo.repeat();
                        convo.next();
                    }
                }
            ], {}, 'pick_direction');

            convo.beforeThread('move', function (convo, next) {
                let pos = convo.vars['current'];
                let direction = convo.vars['direction'];
                let move = maze.tryMove(pos, direction);
                if (move.success) {
                    convo.setVar('current', move.pos);
                    convo.setVar('thing', move.thing);                        
                    next();
                }
                else {
                    convo.gotoThread('stuck');
                }
            });

            convo.addMessage({
                text: "Successfully moved to {{vars.direction}}\n > {{vars.thing}}",
                action: 'pick_direction'
            }, 'move');

            convo.addMessage({
                text: "Ouch, met a wall, try again...",
                action: 'pick_direction'
            }, 'stuck');

            convo.addMessage({
                text: "Got it, let's draw you the map:\n```\n{{vars.map}}\n```",
                action: 'pick_direction'
            }, 'show_map');
        });
    });
};
