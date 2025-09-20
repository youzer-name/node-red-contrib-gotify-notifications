module.exports = function(RED) {
    const axios = require("axios");

    function buildBaseUrl(server) {
        if (!server || !server.baseUrl) return null;
        let base = server.baseUrl;
        if (base.endsWith("/")) base = base.slice(0, -1);
        if (server.port && server.port !== "") {
            return `${base}:${server.port}`;
        }
        return base;
    }

    function SendGotifyMessage(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function(msg, send, done) {
            const serverNode = RED.nodes.getNode(config.server);
            const appNode = RED.nodes.getNode(config.app);

            if (!serverNode || !appNode) {
                node.status({fill:"red", shape:"ring", text:"no server/app"});
                node.error("Gotify server or app not configured", msg);
                if (done) done();
                return;
            }

            const base = buildBaseUrl(serverNode);
            if (!base) {
                node.status({fill:"red", shape:"ring", text:"invalid base url"});
                node.error("Invalid Gotify base URL", msg);
                if (done) done();
                return;
            }

            const title = (msg.title !== undefined) ? msg.title : (config.title || "");
            const message = (msg.message !== undefined) ? msg.message : (config.message || "");
            const priority = parseInt(msg.priority !== undefined ? msg.priority : config.priority || 0, 10);

            // Markdown boolean (true/false)
            const useMarkdown = (msg.markdown !== undefined) ? msg.markdown : config.markdown;
            const bigImage = (msg.bigimage !== undefined) ? msg.bigimage : config.bigimage;
            const clickUrl = (msg.clickurl !== undefined) ? msg.clickurl : config.clickurl;
            const androidChannel = (msg.androidChannel !== undefined) ? msg.androidChannel : config.androidChannel;

            const extras = {};

            // Map markdown flag to Gotify contentType
            if (useMarkdown === true || useMarkdown === 'true') {
                extras["client::display"] = { contentType: "text/markdown" };
            } else {
                extras["client::display"] = { contentType: "text/plain" };
            }

            const notif = {};
            if (bigImage) notif.bigImageUrl = bigImage;
            if (clickUrl) notif.click = { url: clickUrl };
            if (Object.keys(notif).length > 0) {
                extras["client::notification"] = notif;
            }

            if (androidChannel) {
                extras["android::channel"] = androidChannel;
            }

            const body = {
                title: title,
                message: message,
                priority: priority
            };

            if (Object.keys(extras).length > 0) {
                body.extras = extras;
            }

            const fullUrl = `${base}/message?token=${appNode.token}`;
            node.status({fill:"yellow", shape:"ring", text:"sending"});

            try {
                const response = await axios.post(fullUrl, body, { timeout: 10000 });
                msg.payload = response.data;
                msg.statusCode = response.status;
                node.status({fill:"green", shape:"dot", text:`sent (${response.status})`});
                send ? send(msg) : node.send(msg);
                if (done) done();
            } catch (err) {
                const errMsg = err.response ? `HTTP ${err.response.status}` : err.message;
                node.status({fill:"red", shape:"ring", text:"error"});
                node.error(`Gotify send error: ${errMsg}`, msg);
                if (done) done(err);
            }
        });
    }
    RED.nodes.registerType("gotify-send", SendGotifyMessage);
}
