const predefined = require('./predefined')
const Telegraf = require('telegraf')

const bot = new Telegraf(predefined.token);

var pumpGroups = predefined.getPumpGroups();
var totalGroups = pumpGroups.length;
var author = predefined.author;

console.log("author: https://t.me/" + author)

// on /report send the stats
bot.command('report', ({ from, reply }) => {
  console.log("report triggered");
  var promisesChatMembersCount = []; // number of members in the group
  var promisesChat = []; // name of the chat
  // collect the information
  for (var j = 0; j < pumpGroups.length; j++){
    var group = pumpGroups[j]
    promisesChatMembersCount[j] = bot.telegram.getChatMembersCount("@" + group);
    promisesChat[j] = bot.telegram.getChat("@" + group);
  }

  // flatten all promises to be able to process them
  Promise.all( [].concat(promisesChatMembersCount, promisesChat) ).then((response) => {
    // collect names and amount of members
    var groupInfo = [];
    for (var j = 0; j < totalGroups; j++){
      var groupTitle = response[totalGroups + j].title;
      var groupMemberCount = response[j];
      groupInfo.push([groupTitle, pumpGroups[j], groupMemberCount]);
    }
    // sort my number of members
    groupInfo.sort(function(a, b) {
        return b[2] - a[2];
    });
    //
    var report = "";


    for (var j = 0; j < totalGroups; ++j){
      report += ( (j + 1) + ". [" + groupInfo[j][0] + "](https://t.me/" + groupInfo[j][1] + ")" + " : " + groupInfo[j][2] + " members\n");
    }
    // signature
    report += "\nvia [The Pumps Channel](https://t.me/thepumpschannel)";
    const extra = Object.assign({}, Telegraf.Extra.markdown(true).webPreview(false));
    return reply(report, extra);
  })
})





// useless but fun
// bot.on('message', ({from, reply}) => {
//   var message = "--";
//   if (from.username == 'm_bernini'){
//     message = "[Посмотри на это](@polobiggpumpers)";
//   }
//   if (from.username == 'callmyduck')
//     message = "Привет пидОр";
//   const extra = Object.assign({}, Telegraf.Extra.markdown(true).webPreview(false));
//   return reply(message, extra);
// })

// [ ] REVIEW: but this one can forward messages from one person а
// bot.on('message', (ctx) => {
//   ctx.getChat().then((response) => {
//     console.log(ctx.message.message_id);
//     //
//     ctx.telegram.forwardMessage(388405808, ctx.message.chat.id, ctx.message.message_id);
//     return ctx.reply("Greetings!");
//   })
// })

bot.command('feedback', (ctx) => ctx.telegram.forwardMessage(388405808, ctx.message.chat.id, ctx.message.message_id))




bot.startPolling()
