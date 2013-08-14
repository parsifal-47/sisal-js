helper = {
	isArray : function (value) {
		return (Object.prototype.toString.call(value) === '[object Array]');
	},
	isString : function (value) {
		return typeof value == "string";
	}
}

complexNode = {
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
				this.edges.push(new edge(node.edges[i].nodeFrom===-1?-1:node.edges[i].nodeFrom+increment, portFrom, 
														node.edges[i].nodeTo===-1?-1:node.edges[i].nodeTo+increment, portTo));
			}
		} else 
			this.nodes.push(node);
	}
}

colors = {
	current : 0,
	getNew : function () {
		this.current += 1;
		return this.current;
	},
	getColor : function (nodes) {
		if (helper.isArray(nodes)) return this.getColor(nodes[0]); // output node always come first
		if (helper.isArray(nodes.outPorts)) return nodes.outPorts[0].color;
		return nodes.color;
	},
	assign : function (nodes) {
		if (helper.isArray(nodes)) {
			for (var i=0 ; i<nodes.length ; i++)
				nodes[i].color = this.getNew();
		} else
			nodes.color = this.getNew();
	}
}

function simpleType(name) {
	this.name = name;
}

function arrayType(subType) {
	this.isArray = true;
	this.subType = subType;
}

function virtualComplexNode () {
	this.nodes=[];
	this.edges=[];
	this.pureVirtual = true;
}
virtualComplexNode.prototype=complexNode;

function edge(nodeFrom, portFrom, nodeTo, portTo) {
	this.nodeFrom = nodeFrom;
	this.portFrom = portFrom;
	this.nodeTo = nodeTo;
	this.portTo = portTo;
}

function functionNode(name, inPorts, outPorts) {
	this.nodes=[];
	this.edges=[];
	this.inPorts = inPorts;
	this.outPorts = outPorts;
	this.name=name;
}
functionNode.prototype=complexNode;

function forAllNode(range, body, returns, inPorts, outPorts) {
	this.nodes=[];
	this.edges=[];
	this.inPorts = inPorts;
	this.outPorts = outPorts;
	this.range = range;
	this.body = body;
	this.returns = returns;
}
forAllNode.prototype=complexNode;

function binaryExpNode(op, inPorts, outPorts) {
	this.op = op;
	this.inPorts = inPorts;
	this.outPorts = outPorts;
}

function typedName(id, dtype) { // port with name & type
	this.id = id;
	this.dtype = dtype;
}
function identifier(id, color) { // port with name
	this.id = id;
	this.color = color;
}
function coloredPort(color) { // colored port
	this.color = color;
}
function fakeNode(color) {
	this.color = color;
	this.fake = 1;
}

function irGen() {
	var self = this;
	this.parseType = function (astNode) {
		if (helper.isArray(astNode)) { // Parse as array of parsed instances
			var tuple=[];
			for (var i=0;i<astNode.length;i++) {
				var t=self.parseType(astNode[i]);
				if (helper.isArray(t)) tuple = tuple.concat(t);
				else tuple.push(t);
			}
			return tuple;
		}
		if (helper.isString(astNode) && astNode) {
			return new simpleType(astNode);
		}
		if (astNode.type==="TypedIdList") {
			var dtype, tuple = [];
			dtype = self.parseType(astNode.dtype);
			for (var i=0;i<astNode.ids.length;i++) {
				tuple.push(new typedName(astNode.ids[i], dtype));
			}
			return tuple;
		}
		if (astNode.type==="ArrayOf") {
			var dtype;
			dtype = self.parseType(astNode.dtype);
			return new arrayType(dtype);
		}
	}
	
	this.connectColored = function (cNode) { // input is a complex node
		if (helper.isArray(cNode.inPorts) && helper.isArray(cNode.nodes)) {
			for (var i = 0; i < cNode.inPorts.length; i++) {
				if (!cNode.inPorts[i].color) continue;
				for (var j = 0; j< cNode.nodes.length; j++) {
					for (var k = 0; k< cNode.nodes[j].inPorts.length; k++) {
						if (cNode.inPorts[i].color==cNode.nodes[j].inPorts[k].color) {
							cNode.edges.push(new edge(-1, i, j, k));
						}
					}
				}
			}
		}
		if (helper.isArray(cNode.inPorts) && helper.isArray(cNode.outPorts)) {
			for (var i = 0; i < cNode.inPorts.length; i++) {
				if (!cNode.inPorts[i].color) continue;
				for (var j = 0; j< cNode.outPorts.length; j++) {
					if (cNode.inPorts[i].color==cNode.outPorts[j].color) {
						cNode.edges.push(new edge(-1, i, -1, j));
					}
				}
			}
		}
		if (helper.isArray(cNode.outPorts) && helper.isArray(cNode.nodes)) {
			for (var i = 0; i < cNode.outPorts.length; i++) {
				if (!cNode.outPorts[i].color) continue;
				for (var j = 0; j< cNode.nodes.length; j++) {
					for (var k = 0; k< cNode.nodes[j].outPorts.length; k++) {
						if (cNode.outPorts[i].color==cNode.nodes[j].outPorts[k].color) {
							cNode.edges.push(new edge(j, k, -1, i));
						}
					}
				}
			}
		}		
		if (helper.isArray(cNode.nodes)) {
			for (var l = 0; l < cNode.nodes.length; l++) {
				if (!helper.isArray(cNode.nodes[l].outPorts)) continue;
				
				for (var i = 0; i < cNode.nodes[l].outPorts.length; i++) {
					if (!cNode.nodes[l].outPorts[i].color) continue;
					for (var j = 0; j< cNode.nodes.length; j++) {
						for (var k = 0; k< cNode.nodes[j].inPorts.length; k++) {
							if (cNode.nodes[l].outPorts[i].color==cNode.nodes[j].inPorts[k].color) {
								cNode.edges.push(new edge(l, i, j, k));
							}
						}
					}
				}
			}
		}
	}
	
	this.parse = function (astNode, inputs, undefined) {
		if (helper.isArray(astNode)) { // Parse as array of parsed instances
			var first=self.parse(astNode[0], inputs, outputs);
			for (var i=1;i<astNode.length;i++) {
				first.addNodes(self.parse(astNode[i], inputs, outputs));
			}
			return first;
		}
		if (helper.isString(astNode) && astNode) {
			if (helper.isArray(inputs)) {
				for (var i = 0; i<inputs.length; i++) {
					if (inputs[i].id==astNode) return new fakeNode(inputs[i].color);
				}
			}
			return new identifier(astNode, colors.getNew());
		}		
		switch (astNode.type) {
			case "Function":
				var fInputs=self.parseType(astNode.params);
				var fOutputs=self.parseType(astNode.returns);
				// Create SubNodes
				
				if (astNode.expressions.length!==fOutputs.length) {
					throw "Defined and implemented output mismatch for the function " + astNode.name;
				}
				
				colors.assign(fInputs);

				var func=new functionNode(astNode.name, fInputs, fOutputs);
				
				for (var i=0;i<astNode.expressions.length;i++) {
					var nodes=self.parse(astNode.expressions[i], fInputs);
					fOutputs[i].color = colors.getColor(nodes);
					func.addNodes(nodes);
				}
				// Connect SubNodes
				this.connectColored(func);
				
				return func;
				
			case "For":
				return new forAllNode(self.parse(astNode.range), self.parse(astNode.body), self.parse(astNode.returns), inputs, outputs);
				
			case "BinaryExpression":
				var left = self.parse(astNode.left, inputs);
				var right = self.parse(astNode.right, inputs);
				var op = new binaryExpNode(astNode.operator, 
					[new coloredPort(colors.getColor(left)), new coloredPort(colors.getColor(right))], [new coloredPort(colors.getNew())]);
				var merged = [op];
				
				if (helper.isArray(left)) merged = merged.concat(left);
				else if(!left.fake) merged.push(left);

				if (helper.isArray(right)) merged = merged.concat(right);
				else if(!right.fake) merged.push(right);
				
				return merged;
		}
	}
}

var irGenerator = new irGen();

function sisalir(ast){ // constructs sisal IR from Abstract syntax tree
	this.nodes=[];
	for (var i=0;i<ast.length;i++) {
		this.addNodes(irGenerator.parse(ast[i]));
	}
}

sisalir.prototype=complexNode;
