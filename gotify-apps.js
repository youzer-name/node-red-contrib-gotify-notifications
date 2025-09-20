module.exports = function(RED) {
    function GotifyAppNode(config) {
        RED.nodes.createNode(this, config);
        this.appname = config.appname;
        this.token = config.token;
    }
    RED.nodes.registerType("gotify-apps", GotifyAppNode);
}
