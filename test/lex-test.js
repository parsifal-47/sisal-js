var buster = require("buster");
var assert = buster.referee.assert;
require("../lib/lex.js");

buster.testCase("Lex", {
    "trivial lex test": function () {
    	AST = lex.parse("1");
        assert.greater(AST.length, 0, "lex should reproduce non-empty program");
    }
});
