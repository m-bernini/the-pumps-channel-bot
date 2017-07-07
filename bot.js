const predefined = require('./predefined')
const Telegraf = require('telegraf')

const bot = new Telegraf(predefined.token);

var pumpGroups = predefined.getPumpGroups();
var totalGroups = pumpGroups.length;
var author = predefined.author;

console.log("author: https://t.me/" + author)

// on /pumpchannels send the stats
bot.command("pumpchannels", ({ from, reply }) => {
  // console.log("report triggered")
  if(from.id == predefined.berniniChatId){
    var promisesChatMembersCount = []; // number of members in the group
    var promisesChat = []; // name of the chat
    // collect the information
    for (var j = 0; j < pumpGroups.length; j++){
      var group = pumpGroups[j];
      console.log(group);
      promisesChatMembersCount[j] = bot.telegram.getChatMembersCount("@" + group);
      promisesChat[j] = bot.telegram.getChat("@" + group);
      console.log(group);
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
      var report = "";
      report = "Here is an extensive list of the pump groups.\n\nWe don't claim that some of them are better than others but provide the list in the descending order by number of members.\n\n"
      for (var j = 0; j < totalGroups; ++j){
        report += ( (j + 1) + ". [" + groupInfo[j][0] + "](https://t.me/" + groupInfo[j][1] + ")" + " : " + groupInfo[j][2] + " members\n");
      }
      // signature
      report += "\nvia [The Pumps Channel](https://t.me/thepumpschannel)\n\n#pumps";
      const extra = Object.assign({}, Telegraf.Extra.markdown(true).webPreview(false));
      return bot.telegram.sendMessage(predefined.pumpsChannelChatId, report, extra);
    })
  }
})

// TODO:
// [x] welcome page
// [ ] feedback command to send it to another person
// [ ] deploy

bot.command('start', (ctx) => {
  ctx.reply("Hi, I am the butler of the Pumps Channel.\nI am here to make a feedback process easier for you.")
})

bot.command('feedback', (ctx) => {
    ctx.telegram.forwardMessage(predefined.pumpsChannelInboxChatId, ctx.message.chat.id, ctx.message.message_id)
    ctx.reply("Thanks for your feedback")
})


// useful to get the id of the channel
queryChannel = "@" + "thepumpschannel"
bot.command("getme", (ctx) => {
  bot.telegram.getChat(queryChannel).then((response) =>{
    console.log(response);
  })
})


bot.startPolling()
