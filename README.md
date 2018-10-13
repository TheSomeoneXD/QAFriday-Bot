# QAFriday-Bot
[![Game Dev Underground](https://img.shields.io/badge/gdu-discord-%237289DA.svg?logo=discord)](https://discord.gg/mP98ZYv)

# Description
This is the Q&amp;A Friday Bot for Game Dev Underground. It transports users from a voice channel queue, to a private voice channel, for use on stream!

- [Game Dev Underground Invite Link](https://discord.gg/mP98ZYv)

# Run the Bot
## Requirements:
You will need:
- [Node.js](https://nodejs.org/en/) (recommended v8.12.0 LTS)

## Steps
1. Clone the repo. 

    You can use programs like [Git](https://git-scm.com/), [SourceTree](https://www.sourcetreeapp.com/) or simply download the project, although you won't be getting updates as easily.

2. Rename the `.envtemplate` file to `.env`, and fill out tokens and channels. 

    On Windows, you must give the .env file a name, but you can circumvent it by using a program like [VS Code](https://code.visualstudio.com/) to rename files!

3. Navigate via command-line to a bot's folder, install dependancies, and run it!

    Make sure you're in the project folder!
    On Windows, you can hold Shift and Right Click the folder to get the option of a command prompt, inside that folder.
    ```bash
    # If you already haven't, clone the repo
    git clone https://github.com/TheSomeoneXD/QAFriday-Bot
    cd "QAFriday-Bot"

    npm i
    node QAFriday.js
    ```
