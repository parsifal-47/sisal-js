helper = {
	isArray : function (value) {
		return (Object.prototype.toString.call(value) === '[object Array]');
	},
	isString : function (value) {
		return typeof value == "string";
	},
	merge : function (source, left, right) { // three arrays
		var merged = source;

		if (helper.isArray(left)) merged = merged.concat(left);
		else if(!left.fake) merged.push(left);

		if (helper.isArray(right)) merged = merged.concat(right);
		else if((right) && (!right.fake)) merged.push(right);

		return merged;
	}
}

irGenerator = function() {
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
			return new type.simple(astNode);
		}
		if (astNode.type==="TypedIdList") {
			var dtype, tuple = [];
			dtype = self.parseType(astNode.dtype);
			for (var i=0;i<astNode.ids.length;i++) {
				tuple.push(new port.typedName(astNode.ids[i], dtype));
			}
			return tuple;
		}
		if (astNode.type==="ArrayOf") {
			var dtype;
			dtype = self.parseType(astNode.dtype);
			return new type.array(dtype);
		}
	}

	this.parseRangeGen = function (astNode, inputs) { // Range gen is a special case because it contains scatter and dot nodes
		var nodes = self.parse(astNode, inputs);
		// add scatter for every range node
		var scatter = [];
		var outPorts = [];
		for (var i = 0; i<nodes.length; i++) {
			if (nodes[i].type!="range") continue;
			var tcolor = color.getNew();
			scatter.push(new node.scatter(new port.colored(color.getColor(nodes[i])), new port.colored(tcolor)));
			outPorts.push(new port.colored(tcolor));
		}
		var gen = new node.rangeGen(inputs, outPorts);
		gen.addNodes(scatter);
		gen.addNodes(nodes);
		self.connectColored(gen);
		return gen;
	}

	this.parseComplex = function (astNode, complex, inputs) {
		if (!astNode) return new node.fake(0);

		if (helper.isArray(astNode)) {
			for (var i=0;i<astNode.length;i++) {
				var nodes=self.parse(astNode[i], inputs);
				complex.outPorts.push(new port.colored(color.getColor(nodes)));
				complex.addNodes(nodes);
			}
			// Connect SubNodes
			self.connectColored(complex);
			return complex;
		} else {
			throw "Unexpected kind of complex node"
		}
	}

	this.parseBody = function (astNode, inputs) { // Body is special case, it conatins self-created ports as "old" values
		return self.parseComplex(astNode, new node.loopBody(inputs, []), inputs);
	}

	this.parseReturns = function (astNode, inputs) {
		return self.parseComplex(astNode.expressions, new node.loopReturn(astNode.reduction.name, inputs, []), inputs);
	}

	this.parse = function (astNode, inputs, undefined) {
		if (helper.isArray(astNode)) { // Parse as array of parsed instances
			var first=self.parse(astNode[0], inputs);
			for (var i=1;i<astNode.length;i++) {
				first.addNodes(self.parse(astNode[i], inputs));
			}
			return first;
		}
		if (helper.isString(astNode) && astNode) {
			if (helper.isArray(inputs)) {
				for (var i = 0; i<inputs.length; i++) {
					if (inputs[i].id==astNode) return new node.fake(inputs[i].color);
				}
			}
			return new node.identifier(astNode, color.getNew());
		}
		switch (astNode.type) {
			case "Let":
				var let = new node.virtualComplex();
				var lInputs = self.parse(astNode.deflist, inputs);
				color.assign(lInputs);
				let.addNodes(lInputs);
				for (var i = 0; i < astNode.body.length; i++) {
					var nodes=self.parse(astNode.body[i], inputs);
					let.outPorts.push(port.colored(color.getColor(nodes)));
					let.addNodes(nodes);
				}

				return let;

			case "NumericLiteral":
				return new node.constant(astNode.value, color.getNew());

			case "Function":
				var fInputs=self.parseType(astNode.params);
				var fOutputs=self.parseType(astNode.returns);
				// Create SubNodes

				if (astNode.expressions.length!==fOutputs.length) {
					throw "Defined and implemented output mismatch for the function " + astNode.name;
				}

				color.assign(fInputs);

				var func=new node.func(astNode.name, fInputs, fOutputs);

				for (var i=0;i<astNode.expressions.length;i++) {
					var nodes=self.parse(astNode.expressions[i], fInputs);
					fOutputs[i].color = color.getColor(nodes);
					func.addNodes(nodes);
				}
				// Connect SubNodes
				self.connectColored(func);

				return func;

			case "For":
				var range = self.parseRangeGen(astNode.range, inputs);
				var body = self.parseBody(astNode.body, helper.merge(range.outPorts, inputs));
				var returns = self.parseReturns(astNode.returns, helper.merge( (body ? body.outPorts : []), range.outPorts, inputs));
				return new node.forAll(range, body, returns, inputs, [new port.colored(color.getColor(returns))]);

			case "BinaryExpression":
				var left = self.parse(astNode.left, inputs);
				var right = self.parse(astNode.right, inputs);
				var op = new node.binary(astNode.operator,
					[new port.colored(color.getColor(left)), new port.colored(color.getColor(right))], [new port.colored(color.getNew())]);

				return helper.merge([op], left, right);

			case "cross":
				return helper.merge([], self.parse(astNode.left, inputs), self.parse(astNode.right, inputs));

			case "RangeTriplet":
				var left = self.parse(astNode.exp, inputs);
				var right = self.parse(astNode.exp2, inputs);
				if (astNode.exp3) throw "Step is not implemented for triplet";// TODO: add exp3 which means step
				var op = new node.range(
					[new port.colored(color.getColor(left)), new port.colored(color.getColor(right))], [new port.colored(color.getNew())]);
				return helper.merge([op], left, right);

			case "Range":
				var range = self.parse(astNode.range, inputs);
				range[0].outPorts[0].name = astNode.name; //out port comes first that's why zero
				// TODO: fix 0
				return range;

			case "Definition":
				var def = self.parse(astNode.right, inputs);
				def.outPorts[0].name = astNode.left[0]; //out port comes first that's why zero
				// TODO: fix 0
				return def;

			case "Postfix":
				var base = self.parse(astNode.base, inputs);
				var nodes = [];
				var current, prev = null;

				for (var i = astNode.opList.length-1; i>=0; i--) {
					current = self.parse(astNode.opList[i], inputs);
					nodes = helper.merge(nodes, current);
					if (prev !== null) {
						prev.inPorts[0].color = current.outPorts[0].color;
					}
					prev = current;
				}
				current[0].inPorts[0].color = color.getColor(base);
				nodes.push(base);
				return nodes;

			case "[]":
				var nodes = [new node.element([new port.empty()], [new port.colored(color.getNew())])];
				var current;
				for (var i = 0; i < astNode.exp.length; i++) {
					current = self.parse(astNode.exp[i]);
					nodes= helper.merge(nodes, current);
					nodes[0].inPorts.push(new port.colored(color.getColor(current)));
				}
				return nodes;
			default: throw "Unexpected node type: " + astNode.type;
		}
	}

	this.connectColored = function (cNode) { // input is a complex node
		if (helper.isArray(cNode.inPorts) && helper.isArray(cNode.nodes)) {
			for (var i = 0; i < cNode.inPorts.length; i++) {
				if (!cNode.inPorts[i].color) continue;
				for (var j = 0; j< cNode.nodes.length; j++) {
					for (var k = 0; k< cNode.nodes[j].inPorts.length; k++) {
						if (cNode.inPorts[i].color==cNode.nodes[j].inPorts[k].color) {
							cNode.edges.push(new edge.single(-1, i, j, k));
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
						cNode.edges.push(new edge.single(-1, i, -1, j));
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
							cNode.edges.push(new edge.single(j, k, -1, i));
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
								cNode.edges.push(new edge.single(l, i, j, k));
							}
						}
					}
				}
			}
		}
	}
}