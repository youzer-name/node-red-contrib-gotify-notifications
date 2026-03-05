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

        let reconnectAllowed = true;
        let ws = null;

        function connectWebSocket() {
            ws = new WebSocket(streamUrl);

            ws.on("open", () => {
                node.status({ fill: "green", shape: "dot", text: "connected" });
            });

            ws.on("message", (data) => {
                try {
                    const msg = JSON.parse(data);
                    node.send({ payload: msg });
                } catch (e) {
                    node.error("Failed to parse Gotify message: " + e.message);
                }
            });

            ws.on("error", (err) => {
                node.status({ fill: "red", shape: "ring", text: "error" });
                node.error("Gotify subscribe error: " + err.message);
                // If error is 401 Unauthorized, do not reconnect
                if (err.message && err.message.includes("401")) {
                    node.status({ fill: "red", shape: "dot", text: "unauthorized (check token)" });
                    node.error("Authentication failed: Gotify token is invalid or unauthorized. Reconnection stopped.");
                    reconnectAllowed = false;
                    ws.close();
                }
            });

            ws.on("close", (code, reason) => {
                node.status({ fill: "red", shape: "ring", text: "disconnected" });
                // If closed due to 401, do not reconnect
                if (!reconnectAllowed || (code === 1006 && reason && reason.toString().includes("401"))) {
                    node.status({ fill: "red", shape: "dot", text: "unauthorized (check token)" });
                    node.error("Authentication failed: Gotify token is invalid or unauthorized. Reconnection stopped.");
                    return;
                }
                // attempt reconnect after 5s
                setTimeout(() => {
                    node.log("Reconnecting to Gotify WebSocket stream...");
                    connectWebSocket();
                }, 5000);
            });
        }

        connectWebSocket();

        node.on("close", function(done) {
            reconnectAllowed = false;
            if (ws) {
                ws.close();
            }
            done();
        });
    }

    RED.nodes.registerType("gotify-subscribe", GotifySubscribeNode);
};
