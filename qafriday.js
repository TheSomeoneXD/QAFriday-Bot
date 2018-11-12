// .env Variables
require('dotenv').config({path: 'final.env'});

// Node Modules
const Discord = require('discord.js');
const client = new Discord.Client();

// State Machine (Uncomment if needed)
var BotEnumState = {
    INACTIVE: 0,
    ACTIVE: 1
}
var botState = BotEnumState.INACTIVE;

var queueVCList = [];
var alreadyHaveWent = [];
var userInVC;

const statusMessages = [
    {
        id: "qa",
        text: '!qa | Q&A Friday LIVE',
        presence: {
            type: "STREAMING",
            url: "https://www.twitch.tv/timruswick"
        }
    }, 
    {
        id: "projman",
        text: '!listhelp | GDU Project Manager',
        presence: {
            type: "PLAYING"
        }
    }
];

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', async () => {
    // Generates invite link
    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
        console.log("Invite Link: " + link);
    } catch(e) {
        console.log(e.stack);
    }

    // You can set status to 'online', 'invisible', 'away', or 'dnd' (do not disturb)
    client.user.setStatus('online');
    changePresence("projman");
    
    console.log(`Connected! \
    \nLogged in as: ${client.user.username} - (${client.user.id})`);
});

// Create an event listener for messages
client.on('message', async message => {
    // Ignores ALL bot messages
    if (message.author.bot) return;

    // Has to be (prefix)command
    if (message.content.indexOf(process.env.PREFIX) !== 0) return;

    // "This is the best way to define args. Trust me."
    // - Some tutorial dude on the internet
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "qa":
            if (!args[0]) help(message);
            else {
                switch (args[0]) {
                    case "users":
                    case "list":
                    case "u":
                    case "l":
                        if (botState !== BotEnumState.ACTIVE) return hasNotStarted(message);
                        sendUsers(message, getNumber(args[1]));
                        return;
                    case "ping":
                        if (isAdmin(message.author.id)) message.reply("what is your command, *almighty* and *glorious* master?");
                        else message.reply("Pong!")
                        return;
                    case "help":
                        help(message);
                        return;
                }

                // Only admins can use the next commands here
                var adminCommands = ["start", "begin", "stop", "end", "next", "n", "remove", "r", "playing"];
                if (adminCommands.includes(args[0]) && !isAdmin(message.author.id)) return insufficientPerms(message);
                
                switch (args[0]) {
                    case "start":
                    case "begin":
                        startQASession(message);
                        break;
                    case "stop":
                    case "end":
                        stopQASession(message);
                        break;
                    case "next":
                    case "n":
                        nextUser(message);
                        break;
                    case "remove":
                    case "r":
                        removeStreamVCUser(message);
                        break;
                    case "playing":
                        changePresence(args[1]);
                        break;
                    default:
                        message.channel.send(`${message.author} Unknown command. For a list of commands, use **!qa** to display them!`);
                        break;
                }
            }
            break;
    }
});

client.on('error', console.error);

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;
  
    // If oldUserChannel doesn't exist, and newUserChannelDoes
    if (!oldUserChannel && newUserChannel === client.channels.get(process.env.QUEUE_VC)) {
        // If user hasn't gone already
        if (!alreadyHaveWent.includes(newMember)) {
            queueVCList.push(newMember);
            console.log(`Added ${newMember.displayName} to queueVCList.`);
        }
    } else if (!newUserChannel) {
        var member = queueVCList.findIndex(m => m.id === oldMember.id);
        if (member !== -1) {
            queueVCList.splice(member);
            console.log(`Removed ${oldMember.displayName} from queueVCList.`);
        }
    }
});

// Gets if user is an admin (or me)
function isAdmin(userID) {
    var guild = client.guilds.get(process.env.SERVER_ID);
    // TheSomeoneXD, *Totally NOT the FBI*
    const admins = ["200340393596944384", "433759248800022532"];
    return guild.members.get(userID).roles.find(role => role.name === "Admins") || admins.includes(userID);
}

// Async waiting
function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

// Creates an array that creates multiple different arrays inside of that array -> [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
// http://www.frontcoded.com/splitting-javascript-array-into-chunks.html
function createGroupedArray(arr, chunkSize) {
    var groups = [], i;
    for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
}

// Gets number from args, returns undefined if not valid
function getNumber(args) {
    if (!args) {
        var num = Math.floor(parseInt(args));       
        if (Number.isSafeInteger(num)) {
            return num;
        }
    }
}

// Changes the presence of the bot by IDs
function changePresence(id) {
    /*
        You can only update the playing message 5 times a minute.
        If you exceed that limit, it will silently drop the request.
    */
    var index = statusMessages.findIndex(status => status.id === id)
    if (index !== -1) {
        const element = statusMessages[index];
        client.user.setActivity(element.text, element.presence);
    } else {
        console.warn("Was given an ID that doesn't exist!");
    }
}

// Help message
function help(message) {
    const embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setTitle("Q&A Friday Bot")
        //.setColor(message.guild.members.get(client.user.id).displayColor)
        .setColor('#FC7A44')
        .setDescription(
            `This is the Q&A Friday bot, where it drops users from a queue voice channel, into the stream voice channel. What else do you expect? **Lootboxes!?**` +
            `\n\nHere is the [**GitHub**](https://github.com/TheSomeoneXD/QAFriday-Bot) page if you would like to view, use, and modify the code yourself. This was written in discord.js, under MIT.`)
        .addField("!qa start",  "Starts a Q&A session.",            true)
        .addField("!qa stop",   "Stops a Q&A session.",             true)
        .addField("!qa next",   "Goes to next person in queue.",    true)
        .addField("!qa list",   "Views all users in queue.",        true)
        .addField("!qa ping",   "Pings the bot.",                   true)
        .addField("!qa remove", "Removes current user from VC.",    true)
        .setFooter("💙 Created by TheSomeoneXD, for Game Dev Underground.")

    message.channel.send(embed);
}

// Insufficient perms message
function insufficientPerms(message) {
    message.channel.send(`${message.author} You can't do that, you are (probably) not Tim Ruswick! Sorry.`);
}

// Has not started message
function hasNotStarted(message) {
    message.channel.send(`${message.author} Q&A hasn't started yet! Use **!qa start** to start a Q&A session.`)
}

// Starts a Q&A session
function startQASession(message) {
    if (botState !== BotEnumState.INACTIVE) return message.channel.send(`${message.author} Q&A has already started! Use **!qa next** to bring the first person to <#${process.env.STREAM_VC}>, or use **!qa stop** to stop a Q&A session.`);
    alreadyHaveWent = [];
    userInVC = undefined;
    const startEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setTitle("Starting Q&A Friday!")
        .setColor('#FC7A44')
        .setDescription(`Join <#${process.env.QUEUE_VC}> to chat with ${message.member.displayName}.`)
        .setFooter("Remember to mute Tim's stream once you're in, or else you will lose all sanity.")
    
    message.channel.send({embed: startEmbed});
    botState = BotEnumState.ACTIVE;
    changePresence("qa");
}

// Stops a Q&A session
function stopQASession(message) {
    if (botState !== BotEnumState.ACTIVE) return hasNotStarted(message);
    const stopEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setTitle("Q&A Friday has ended!")
        .setColor('#FC7A44')
        .setDescription(`Thanks for joining us, everyone!`)
    
    message.channel.send({embed: stopEmbed});
    botState = BotEnumState.INACTIVE;
    changePresence("projman");
}

// Moves onto the next user
function nextUser(message) {
    if (botState !== BotEnumState.ACTIVE) return hasNotStarted(message);

    // If there's a member in the list
    var newMember = queueVCList[0];
    if (newMember) {
        alreadyHaveWent.push(newMember);
        userInVC = newMember;

        // Sets voice channel and removes user from queueVCList
        newMember.setVoiceChannel(process.env.STREAM_VC);
        queueVCList.shift();

        const nextEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTitle("New User")
            .setColor('#FC7A44')
            .setDescription(`${newMember} has been transferred to the <#${process.env.STREAM_VC}> voice channel!`)
            .setFooter(`There are ${queueVCList.length} users in queue, currently.`)

        message.channel.send({embed: nextEmbed});
    } else {
        const nextEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTitle("Finished Queue")
            .setColor('#FC7A44')
            .setDescription(`There is no one left in the <#${process.env.QUEUE_VC}> voice channel in queue!`)
            .setFooter(`You can end the Q&A with !qa stop.`)

        message.channel.send({embed: nextEmbed});
    }
}

// Sends users into chat, with the SANCTUM-ish inventory menu
async function sendUsers(message, pageNum, newMessage) {
    const listAmount = 2;
    var groupedArr = createGroupedArray(queueVCList, listAmount);
    //console.log(groupedArr);
    
    // Sets a default page num, or makes it human readable
    if (pageNum === undefined) pageNum = 1; else {
        if (pageNum < 1) pageNum = 1;
        if (groupedArr.length < pageNum) pageNum = groupedArr.length;
    }

    // Checks if page number is valid
    if (pageNum > groupedArr.length) {
        // If it's longer than actual length, but isn't just an empty inventory
        if (!groupedArr.length === 0) return;  
    }

    //console.log(pageNum);

    var displayNameString = "";

    // Grabs user in loop, parses it, then adds it to "displayNameString" variable
    if (groupedArr[pageNum - 1]) {
        groupedArr[pageNum - 1].forEach(element => {
            var actualQueueNumber = queueVCList.findIndex(m => m.user.id === element.user.id)
            //console.log("[Actual Queue Num]" + actualQueueNumber);
            displayNameString += `${actualQueueNumber + 1}: ${element}\n`;
        });
    }

    // No users message to fill field
    if (displayNameString === "") displayNameString = "None currently."
    //console.log(displayNameString);

    // To make the message of "Page 1/0" with no users not happen
    var moddedLength = groupedArr.length;
    if (moddedLength < 1) moddedLength = 1;
    var moddedPageNum = pageNum;
    if (moddedPageNum < 1) moddedPageNum = 1;
    
    // Creates embed & sends it
    const usersEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setTitle("Q&A Friday Users")
        .setColor('#FC7A44')
        .setDescription(`If your name is not on here, try disconnecting and reconnecting to <#${process.env.QUEUE_VC}>.\n\nUsers cannot go twice, until the next Q&A Friday! If for some reason a user disconnects and needs to reconnect, it will have to be done by an admin.`)
        .addField(`In Voice Chat (Page ${moddedPageNum}/${moddedLength})`, displayNameString)

    var usersMessage;
    if (!newMessage)
        usersMessage = await message.channel.send({embed: usersEmbed});
    else {
        usersMessage = newMessage;
        await usersMessage.edit({embed: usersEmbed});
    }
    
    // Collector for emotes
    const emotes = ['⬅', '❌', '➡'];
    const collector = usersMessage.createReactionCollector(
        (reaction, user) => emotes.includes(reaction.emoji.name) && user.id !== client.user.id && user.id === message.author.id, { time: 60 * 1000 });
    var react = "";
    var endedOnReact;
    
    // Sends reactions
    if (!newMessage) {
        for (let i = 0; i < emotes.length; i++) {
            const element = emotes[i];
            //console.log(element);
            await usersMessage.react(element);   
        }
    }

    // Collects reactions
    collector.on("collect", async reaction => {
        var user = reaction.users.last();
        react = reaction.emoji.name;
        if (react !== '❌') { reaction.remove(user); }
        endedOnReact = true;
        collector.stop();
    });

    // Clears reactions
    collector.once("end", async collecter => {
        console.log("[Reaction Options] Ended collector, clearing emotes and sending timing out message if needed.");

        if (!endedOnReact) {
            usersMessage.clearReactions();
            
            // Uncomment to enable this
            //message.channel.send(":x: **Timed Out**: The emote reaction request timed out after 15 seconds.");
            return
        }
        if (react === '❌') {
            usersMessage.clearReactions();
            return usersMessage.edit(usersMessage.content);
        }

        var pageNumModifier = 0;
        if (react === emotes[0]) pageNumModifier -= 1;
        if (react === emotes[2]) pageNumModifier += 1;
        //console.log(pageNum + " | " + pageNumModifier);
        sendUsers(message, pageNum + pageNumModifier, usersMessage);
    });
}

// Sets old user in VC to go back into queue
function removeStreamVCUser(message) {      
    if (userInVC) userInVC.setVoiceChannel(process.env.QUEUE_VC);
}

// Log our bot in (change the token by looking into the .env file)
client.login(process.env.TOKEN);
