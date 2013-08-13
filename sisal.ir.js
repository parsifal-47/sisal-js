complexNode = {
	addNode : function (node) {
		if (!node) return;
		
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

helper = {
	isArray : function (value) {
		return (Object.prototype.toString.call(value) === '[object Array]');
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

function typedName(id, dtype) {
	this.id=id;
	this.dtype=dtype;
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
		if (astNode.type==="TypedIdList") {
			var dtype, tuple = [];
			if (["integer", "real"].indexOf(astNode.dtype)!==-1) {
				dtype = new simpleType(astNode.dtype);
			} else dtype = self.parseType(astNode.dtype);
			for (var i=0;i<astNode.ids.length;i++) {
				tuple.push(new typedName(astNode.ids[i], dtype));
			}
			return tuple;
		}
		if (astNode.type==="ArrayOf") {
			var dtype;
			if (["integer", "real"].indexOf(astNode.dtype)!==-1) {
				dtype = new simpleType(astNode.dtype);
			} else dtype = self.parseType(astNode.dtype);
			return new arrayType(dtype);
		}
	}
	
	this.parse = function (astNode, inputs, outputs, undefined) {
		if (helper.isArray(astNode)) { // Parse as array of parsed instances
			var first=self.parse(astNode[0], inputs, outputs);
			for (var i=1;i<astNode.length;i++) {
				first.addNode(self.parse(astNode[i], inputs, outputs));
			}
			return first;
		}
		switch (astNode.type) {
			case "Function":
				var fInputs=self.parseType(astNode.params);
				var fOutputs=self.parseType(astNode.returns);
				// Create SubNodes
				
				if (astNode.expressions.length!==fOutputs.length) {
					throw "Defined and implemented output mismatch for the function " + astNode.name;
				}

				var func=new functionNode(astNode.name, fInputs, fOutputs);
				
				for (var i=0;i<astNode.expressions.length;i++) {
					var node=self.parse(astNode.expressions[i], fInputs, [fOutputs[i]]);
					func.addNode(node);
				}
				// Connect SubNodes	
				return func;
				
			case "For":
				return new forAllNode(self.parse(astNode.range), self.parse(astNode.body), self.parse(astNode.returns), inputs, outputs);
		}
	}
}

var irGenerator = new irGen();

function sisalir(ast){ // constructs sisal IR from Abstract syntax tree
	this.nodes=[];
	for (var i=0;i<ast.length;i++) {
		this.addNode(irGenerator.parse(ast[i]));
	}
}

sisalir.prototype=complexNode;
