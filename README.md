# node-red-contrib-gotify-notifications

Node-RED nodes for working with a [Gotify](https://gotify.net) self-hosted notification server.

This module provides:

- **Gotify Server config** – holds the base URL and optional port of your Gotify server.
- **Gotify Apps config** – holds App tokens, used for sending notifications.
- **Gotify Clients config** – holds Client tokens, used for subscribing to notifications.
- **Gotify Send node** – publishes notifications to a Gotify App.
- **Gotify Subscribe node** – listens for incoming notifications from a Gotify server.

There are other nodes for Gotify available, but I created this one to make the setup of servers, applications, and clients
more user-friendly and also to simplify the use of message extras like click URL, bigImage, and markdown formatting.

---

## Install

From your Node-RED user directory (usually `~/.node-red`), run:

    npm install node-red-contrib-gotify-notifications

Restart Node-RED and the nodes will appear in the **Gotify** category of the palette.

---

## Configuration Nodes

### Gotify Server
Defines the base URL of your Gotify server.  
- Example: `http://gotify.lan` or `https://example.com/gotify`.  
- Optional Port field can be left empty if using standard ports (80/443).  
    Do **not** include `/stream` or `/ws` in the URL.

### Gotify Apps
Represents a Gotify **App** token.  
- Used by the **Send** node to publish messages.  
- Tokens can be created in the Gotify Web UI under **Apps → Create Application**.

### Gotify Clients
Represents a Gotify **Client** token.  
- Used by the **Subscribe** node to listen for incoming messages.  
- Tokens can be created in the Gotify Web UI under **Clients → Create Client**.

---

## Gotify Send Node

The **gotify-send** node publishes messages to a Gotify App.

![Gotify Send Editor](docs/gotify-send.png)

### Options
- **Server**: Select a Gotify Server config.  
- **App**: Select a Gotify App token config.  
- **Title**: Default title (overridden by `msg.title`).  
- **Message**: Default message (overridden by `msg.payload` or `msg.message`).  
- **Priority**: Default priority (overridden by `msg.priority`).  
- **Markdown**: Boolean toggle. If true, message will be sent as `text/markdown`; if false, `text/plain`. Overridden by `msg.markdown`.  
- **Big Image URL**: Optional image to display (overridden by `msg.bigimage`).  

### Input message fields
- `msg.payload` or `msg.message` → message content  
- `msg.title` → optional message title  
- `msg.priority` → priority (integer)  
- `msg.markdown` → boolean, true = Markdown, false = Plain text  
- `msg.bigimage` → optional image URL  

---

## Gotify Subscribe Node

The **gotify-subscribe** node connects to a Gotify server and listens for notifications in real time using WebSockets.

![Gotify Subscribe Editor](docs/gotify-subscribe.png)

### Options
- **Server**: Select a Gotify Server config.  
- **Client**: Select a Gotify Client token config.  

### Output
Each received Gotify message is sent as an object on `msg.payload`. Example shape:

    {
      "payload": {
        "id": 123,
        "appid": 4,
        "message": "Hello from Gotify!",
        "title": "Greeting",
        "priority": 5,
        "extras": { },
        "date": "2025-09-20T12:34:56Z"
      }
    }

### Status indicators
- **green dot** → connected  
- **red ring** → disconnected (auto-reconnect after 5s)  
- **red ring + error** → connection error  

---

## Tokens: App vs Client

Gotify has **two types of tokens**, and it’s important to use the right one:

- **App tokens** → used by **Send** node (publishing).  
- **Client tokens** → used by **Subscribe** node (listening).  

    Using an App token with Subscribe will result in “unauthorized” errors.  

---

## License

MIT
