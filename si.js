require("./lib/lex.js");
require("./lib/ir.nodes.js");
require("./lib/ir.other.js");
require("./lib/ir.gen.js");
require("./lib/si.js");
var repl = require("repl");

function eval(cmd, context, filename, callback) {
  var clean = cmd.substring(1, cmd.length -2); // removing extra brackets
  var result = si.run(cmd);
  callback(null, result);
}

repl.start({
  prompt: "si>",
  eval: eval
});