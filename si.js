var repl = require("repl");

function eval(cmd, context, filename, callback) {
  callback(null, "Error: repl is not implemented");
}

repl.start({
  prompt: "si>",
  eval: eval
});