var buster = require("buster");
var assert = buster.referee.assert;
//require("../lib/lex.js");

buster.testCase("Lex", {
    "trivial lex test": function () {
        AST = lex.parse("1");
        assert.greater(AST.length, 0, "lex should reproduce non-empty program");
    },
    "simple function text": function () {
        AST = lex.parse("function Main2( M,N : integer returns integer )\n" +
                        "   M+N*M\n" +
                        "end function");
        assert.greater(AST.length, 0, "lex should reproduce non-empty program");
    },
    "check all programs in examples folder": function () {
        var fs = require("fs");
        var data = fs.readdirSync("examples/");
        for (var i = 0; i<data.length; i++) {
            if (fs.lstatSync("examples/"+data[i]).isDirectory()) continue;

            var prog = fs.readFileSync("examples/"+data[i]);
            AST = lex.parse("" + prog);
            assert.greater(AST.length, 0, "lex for ...");
        }       
    }
});
