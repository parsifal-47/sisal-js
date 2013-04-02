complexNode = {
	addNode : function (node) {
		// If the node is complex it have to be disassembled
		if (node instanceof virtualComplexNode) {
			var increment=this.nodes.length;
			for (var i=0;i<node.nodes.length;i++)
				this.nodes[this.nodes.length]=node.nodes[i];
			// copy variables
			for (var i=0;i<node.vars.length;i++) {
				this.vars[this.vars.length]=new variable(node.vars[i].nodeFrom===-1?-1:node.vars[i].nodeFrom+increment, portFrom, 
														node.vars[i].nodeTo===-1?-1:node.vars[i].nodeTo+increment, portTo);
			}
		} else 
			this.nodes[this.nodes.length]=node;
	}
}

function virtualComplexNode () {
	this.nodes=[];
	this.vars=[];
}
virtualComplexNode.prototype=complexNode;

function variable(nodeFrom, portFrom, nodeTo, portTo) {
	this.nodeFrom=nodeFrom;
	this.protFrom=portFrom;
	this.nodeTo=nodeTo;
	this.portTo=portTo;
}

function functionNode(name) {
	this.name=name;
}
functionNode.prototype=complexNode;

function typedName(id, dtype) {
	this.id=id;
	this.dtype=dtype;
}

irGenerator = {
	parse : function (astNode, inputs, outputs, undefined) {
		if (Object.prototype.toString.call(astNode) === '[object Array]') { // Parse as array of parsed instances
			var first=irGenerator.parse(astNode[0], inputs, outputs);
			for (var i=1;i<astNode.length;i++) {
				first.addNode(irGenerator.parse(astNode[i], inputs, outputs));
			}
			return first;
		}
		switch (astNode.type) {
			case "Function":
				var func=new functionNode(astNode.name);
				var fInputs=irGenerator.parse(astNode.params);
				var fOutputs=irGenerator.parse(astNode.returns);
				// Create SubNodes
				
				if (astNode.expressions.length!==fOutputs.nodes.length) {
					throw "Defined and implemented output mismatch for function " + astNode.name;
				}
				
				for (var i=0;i<astNode.expressions.length;i++) {
					var node=irGenerator.parse(astNode.expressions[i], fInputs, fOutputs[i]);
					func.addNode(node);
				}
				// Connect SubNodes			
				return func;
			case 'TypedIdList':
				var smth=new virtualComplexNode();
				for (var i=0;i<astNode.ids.length;i++) {
					smth.addNode(new typedName(astNode.ids[i], astNode.dtype));
				}
				return smth;
			case 'ArrayOf':
				var smth=new virtualComplexNode();
				smth.addNode(new typedName(null, astNode.dtype));
				return smth;				
		}
	}
}

function sisalir(ast){ // constructs sisal IR from Abstract syntax tree
	this.nodes=[];
	for (var i=0;i<ast.length;i++) {
		this.addNode(irGenerator.parse(ast[i]));
	}
}

sisalir.prototype=complexNode;
