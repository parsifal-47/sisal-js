var node = {
	complex : { // Interface class for all complex nodes
		addNodes : function (node) {
			if (!node) return;

			if (helper.isArray(node)) {
				this.nodes = this.nodes.concat(node);
				return;
			}

			// If the node is complex it has to be disassembled
			if (node.pureVirtual) { //node instanceof virtualComplexNode) { -- this typing is not working, using duck typing
				var increment=this.nodes.length;
				for (var i=0;i<node.nodes.length;i++)
					this.nodes.push(node.nodes[i]);
				// copy variables
				for (var i=0;i<node.edges.length;i++) {
					this.edges.push(new edge.single(node.edges[i].nodeFrom===-1?-1:node.edges[i].nodeFrom+increment, portFrom,
															node.edges[i].nodeTo===-1?-1:node.edges[i].nodeTo+increment, portTo));
				}
			} else
				this.nodes.push(node);
		}
	}
}
node.virtualComplex = function () {
		this.nodes = [];
		this.edges = [];
		this.pureVirtual = true;
	}

node.virtualComplex.prototype = node.complex;

node.func = function (name, inPorts, outPorts) {
		this.type = "function";
		this.name = name;
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	}

node.func.prototype = node.complex;

node.loopBody = function (inPorts, outPorts) {
		this.type = "loopBody";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	}

node.loopBody.prototype = node.complex;

node.loopReturn = function (name, inPorts, outPorts) {
		this.type = "loopReturn";
		this.name = name;
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	}

node.loopReturn.prototype = node.complex;

node.rangeGen = function (inPorts, outPorts) {
		this.type = "rangeGen";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	}

node.rangeGen.prototype = node.complex;

node.forAll = function (range, body, returns, inPorts, outPorts) {
		this.type = "forall";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [range, body, returns];
		this.edges = []; // There are no explicit connections also
	}

node.forAll.prototype = node.complex;

node.binary = function (op, inPorts, outPorts) {
		this.type = "binary";
		this.op = op;
		this.inPorts = inPorts;
		this.outPorts = outPorts;
	}

node.element = function (inPorts, outPorts) {
		this.type = "element";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
	}

node.range = function (inPorts, outPorts) {
		this.type = "range";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
	}

node.scatter = function (inPort, outPort) {
		this.type = "scatter";
		this.inPorts = [inPort];
		this.outPorts = [outPort];
	}

node.identifier = function (id, color) { // port with name
		this.type = "id";
		this.inPorts = [];
		this.outPorts = [new port.colored(color)];
		this.id = id;
		this.color = color;
	}

node.constant = function (value, color) { // port with name
    var self = this;
		this.type = "constant";
		this.inPorts = [];
		this.outPorts = [new port.colored(color)];
		this.value = value;
		this.color = color;
    this.execute = function () {return self.value;}
	}

node.fake = function (color) {
		this.inPorts = [];
		this.outPorts = [];
		this.color = color;
		this.fake = 1;
	}
