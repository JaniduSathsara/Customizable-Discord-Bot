# 🤖 Customizable Discord Bot

A feature-rich Discord bot built with Node.js and Discord.js. Easily customize bot settings, messages, channels, roles, images, and social links to fit your own Discord server.

## ✨ Features

- 👋 Welcome messages for new members
- 🚪 Leave notifications
- 🚀 Server boost notifications
- 🎭 Automatic boost role management
- 💬 Random greeting responses
- 📢 Role-based /say slash command
- 📊 Dynamic bot activity status
- 🔗 Custom bot information and social links
- ⚙️ Easy configuration using environment variables

## 🛠️ Technologies Used

- Node.js
- JavaScript
- Discord.js
- dotenv

## 📋 Requirements

- Node.js
- Discord account
- Discord Developer Portal application
- Discord server with bot permissions

## 🚀 Installation

### 1. Clone the Repository

git clone https://github.com/YOUR-USERNAME/Customizable-Discord-Bot.git

### 2. Navigate to the Project

cd Customizable-Discord-Bot

### 3. Install Dependencies

npm install

### 4. Configure Environment Variables

Create a `.env` file in the project directory.

Add your own configuration:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_BOT_CLIENT_ID
PREFIX=!

SERVER_NAME=My Discord Server
BOT_NAME=My Discord Bot
OWNER_NAME=Your Name

WELCOME_CHANNEL=YOUR_WELCOME_CHANNEL_ID
LEAVE_CHANNEL=YOUR_LEAVE_CHANNEL_ID
ROLES_CHANNEL=YOUR_ROLES_CHANNEL_ID
RULE_CHANNEL=YOUR_RULES_CHANNEL_ID
BOOST_CHANNEL_ID=YOUR_BOOST_CHANNEL_ID
LOG_CHANNEL_ID=YOUR_LOG_CHANNEL_ID

SAY_ROLE_ID=YOUR_SAY_ROLE_ID
BOOST_ROLE_ID=YOUR_BOOST_ROLE_ID

WELCOME_MESSAGE=Welcome to our community!
LEAVE_MESSAGE=We are sad to see you leave!
BOOST_MESSAGE=Thank you for boosting our server!

WELCOME_COLOR=#f434b4
LEAVE_COLOR=#f37ae5
BOOST_COLOR=#ff73fa

WELCOME_IMAGE=https://example.com/welcome.png
BOOST_IMAGE=https://example.com/boost.png
BOT_IMAGE=https://example.com/bot.png

WEBSITE_URL=https://example.com
YOUTUBE_URL=https://youtube.com
SOCIAL_URL=https://example.com

STATUS_1=your community
STATUS_2=your server
STATUS_3=members
