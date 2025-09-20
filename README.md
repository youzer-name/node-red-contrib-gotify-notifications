# node-red-contrib-gotify-notifications

Node-RED nodes to send notifications to a Gotify server.

## Nodes included

- **Gotify Server** (`gotify-server`) — config node for your Gotify instance (base URL and optional port).
- **Gotify App** (`gotify-apps`) — config node for an App token (one per Gotify App).
- **Gotify Send** (`gotify-send`) — a node to send messages to a configured Gotify App.

## Features

- Uses `axios` (modern HTTP client).
- Editor fields for all commonly-used Gotify extras:
  - Markdown vs plain text
  - Big image URL
  - Click URL
  - Android channel
- Incoming `msg.*` overrides editor values:
  - `msg.title`, `msg.message`, `msg.priority`, `msg.markdown`, `msg.contentType`, `msg.bigimage`, `msg.clickurl`, `msg.androidChannel`
- Node status shows `sending`, `sent (HTTP CODE)` or `error`.
- Editor help text explains usage.

## Installation (development)

1. Copy the files into a folder inside your Node-RED `nodes` directory, or package them into an npm package.
2. Ensure `axios` is installed for the node: in the package folder run:
   ```bash
   npm install
