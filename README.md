# QAFriday-Bot
[![Game Dev Underground](https://img.shields.io/badge/gdu-discord-%237289DA.svg?logo=discord)](https://discord.gg/mP98ZYv)

# NOTE ON ARCHIVAL
This code has been archived due to not being maintained, and lack of use.

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
    
    ```bash
    git clone https://github.com/TheSomeoneXD/QAFriday-Bot
    ```

2. Rename the `.envtemplate` file to `dev.env`, and fill out tokens and channels.

3. Navigate via command-line to a bot's folder, install dependancies, and run it!

    Make sure you're in the project folder!
    On Windows, you can hold Shift and Right Click the folder to get the option of a command prompt, inside that folder.
    
    ```bash
    cd "QAFriday-Bot"   # Navigate to project folder
    npm i
    node QAFriday.js
    ```
