module.exports = function(RED) {
  var tmp = require('tmp');
  var fs = require('fs');
  var rake = require('rapid-automated-keyword-extraction').default;
  var RakeNode = function (config) {
    RED.nodes.createNode(this,config);
    var node = this;

    // Create stop words list once
    var stopWords = config.stopWords || '';
    var tmpobj = tmp.fileSync();
    var stopWordsPath = tmpobj.name;
    fs.writeSync(tmpobj.fd, stopWords);

    // Handle messages
    this.on('input', function (msg) {
      try {
        // Fetch text from payload
        var text = msg.payload || '';

        // Fetch configuration parameters
        var minCharLength = config.minCharLength || msg.minCharLength || 3;
        var maxWordsLength = config.maxWordsLength || msg.maxWordsLength || 5;
        var minKeywordFrequency = config.minKeywordFrequency || msg.minKeywordFrequency || 1;

        // Run rake with stop words and configuration
        rake(msg.payload, stopWordsPath, minCharLength, maxWordsLength, minKeywordFrequency).then(function(res) {
          msg.payload = res;
          node.send(msg);
        });
      } catch(e) {
        this.error("Can't extract keywords");
      }
    });

    // Clean up tmp file with stop words list
    this.on('close', function() {
        tmpobj.removeCallback();
    });
  }
  RED.nodes.registerType("rake", RakeNode);
}
