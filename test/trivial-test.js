var buster = require("buster");
var assert = buster.assertions.assert;

buster.testCase("A module", {
    "states the obvious": function () {
        assert(true);
    }
});
