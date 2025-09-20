module.exports = function(RED) {
    function GotifyClientNode(config) {
        RED.nodes.createNode(this, config);
        this.clientname = config.clientname;
        this.token = config.token;
    }
    RED.nodes.registerType("gotify-clients", GotifyClientNode);
}
