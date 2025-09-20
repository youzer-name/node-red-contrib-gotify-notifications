module.exports = function(RED) {
    const WebSocket = require("ws");

    function buildBaseUrl(server) {
        if (!server || !server.baseUrl) return null;
        let base = server.baseUrl;
        if (base.endsWith("/")) base = base.slice(0, -1);
        if (server.port && server.port !== "") {
            return `${base}:${server.port}`;
        }
        return base;
    }

    function GotifySubscribeNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const serverNode = RED.nodes.getNode(config.server);
        const clientNode = RED.nodes.getNode(config.client);

        if (!serverNode || !clientNode) {
            node.status({ fill: "red", shape: "ring", text: "no server/client configured" });
            return;
        }

        const baseUrl = buildBaseUrl(serverNode);
        if (!baseUrl) {
            node.status({ fill: "red", shape: "ring", text: "invalid baseUrl" });
            return;
        }

        const streamUrl = `${baseUrl}/stream?token=${clientNode.token}`;

        let ws = new WebSocket(streamUrl);

        ws.on("open", () => {
            node.status({ fill: "green", shape: "dot", text: "connected" });
        });

        ws.on("close", () => {
            node.status({ fill: "red", shape: "ring", text: "disconnected" });
            // attempt reconnect after 5s
            setTimeout(() => {
                node.log("Reconnecting to Gotify WebSocket stream...");
                ws = new WebSocket(streamUrl);
            }, 5000);
        });

        ws.on("error", (err) => {
            node.status({ fill: "red", shape: "ring", text: "error" });
            node.error("Gotify subscribe error: " + err.message);
        });

        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data);
                node.send({ payload: msg });
            } catch (e) {
                node.error("Failed to parse Gotify message: " + e.message);
            }
        });

        node.on("close", function(done) {
            if (ws) {
                ws.close();
            }
            done();
        });
    }

    RED.nodes.registerType("gotify-subscribe", GotifySubscribeNode);
};
