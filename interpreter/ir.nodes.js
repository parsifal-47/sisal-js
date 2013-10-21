var node = {
	complex : { // Interface class for all complex nodes
		addNodes : function (node) {
			if (!node) return;
			
			if (helper.isArray(node)) {
				this.nodes = this.nodes.concat(node);
				return;
			}
			
			// If the node is complex it have to be disassembled
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
	},

	virtualComplex : function () {
		this.nodes = [];
		this.edges = [];
		this.pureVirtual = true;
	},

	func : function (name, inPorts, outPorts) {
		this.type = "function";
		this.name = name;
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	},

	rangeGen : function (inPorts, outPorts) {
		this.type = "rangeGen";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
		this.nodes = [];
		this.edges = [];
	},

	forAll : function (range, body, returns, inPorts, outPorts) {
		this.type = "forall";
		this.inPorts = inPorts;	
		this.outPorts = outPorts;
		this.range = range;
		this.body = body;
		this.returns = returns;
		this.nodes = []; // There are no usual nodes inside forAll node
		this.edges = []; // There are no explicit connections also
	},

	binary : function (op, inPorts, outPorts) {
		this.type = "binary";
		this.op = op;
		this.inPorts = inPorts;
		this.outPorts = outPorts;
	},

	range : function (inPorts, outPorts) {
		this.type = "range";
		this.inPorts = inPorts;
		this.outPorts = outPorts;
	},

	scatter : function (inPort, outPort) {
		this.type = "scatter";
		this.inPorts = [inPort];
		this.outPorts = [outPort];
	},

	identifier : function Node(id, color) { // port with name
		this.type = "id";
		this.inPorts = [];
		this.outPorts = [new port.colored(color)];
		this.id = id;
		this.color = color;
	},
	
	constant : function (value, color) { // port with name
		this.type = "constant";
		this.inPorts = [];
		this.outPorts = [new port.colored(color)];
		this.value = value;
		this.color = color;
	},
	
	fake : function (color) {
		this.color = color;
		this.fake = 1;
	}
}

node.func.prototype = node.complex;
node.virtualComplex.prototype = node.complex;
node.forAll.prototype = node.complex;
node.rangeGen.prototype = node.complex;