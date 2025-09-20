module.exports = function(RED) {
    function GotifyServerNode(config) {
        RED.nodes.createNode(this, config);

        this.servername = config.servername;
        this.baseUrl = config.baseUrl;
        this.port = config.port;

        // sanitize baseUrl (remove trailing slash)
        if (this.baseUrl && this.baseUrl.endsWith("/")) {
            this.baseUrl = this.baseUrl.slice(0, -1);
        }

        // Basic runtime validation so users get immediate feedback
        if (!this.baseUrl || !(this.baseUrl.startsWith("http://") || this.baseUrl.startsWith("https://"))) {
            this.warn("Gotify Server baseUrl should start with http:// or https://");
        }
    }
    RED.nodes.registerType("gotify-server", GotifyServerNode);
}
