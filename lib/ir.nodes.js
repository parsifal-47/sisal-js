node = {
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
        },
        toXML : function (id) {
            var innerXML = '';
            var i;
            var data = {type:this.type};
            if (typeof this.fields !== "undefined") for (i=0; i<this.fields.length; i++) data[this.fields[i]] = this[this.fields[i]];

            for (i=0; i<this.inPorts.length; i++) innerXML += graphmlgen.port('in' + i);
            for (i=0; i<this.outPorts.length; i++) innerXML += graphmlgen.port('out' + i);
            for (i=0; i<this.nodes.length; i++) innerXML += this.nodes[i].toXML(id + '::n' + i);
            for (i=0; i<this.edges.length; i++) innerXML += edge.toXML(id, this.edges[i]);
            return graphmlgen.node(id, data, graphmlgen.subgraph(id + ':', innerXML));
        },
        execute : function () {
            for (var i=0; i<this.nodes.length; i++) {
              if (this.nodes[i].execute) this.nodes[i].execute();
            }
        },
        toText : function () {
            var inFree = 0, outFree = 0; // Number of non-assigned input and output ports
            for (i=0; i<this.outPorts.length; i++)
                if (!this.outPorts.value) outFree++;
            for (i=0; i<this.inPorts.length; i++)
                if (!this.inPorts.value) inFree++;
            if (inFree === 0) {
                return this.outPorts.toString();
            } else {
                return this.inPorts.toString() + " -> " + this.outPorts.toString();
            }
        }
    },
    simple : {
        toXML : function (id) {
            var innerXML = '';
            var i;
            var data = {type:this.type};
            if (typeof this.fields !== "undefined") for (i=0; i<this.fields.length; i++) data[this.fields[i]] = this[this.fields[i]];
            
            for (i=0; i<this.inPorts.length; i++) innerXML += graphmlgen.port('in' + i);
            for (i=0; i<this.outPorts.length; i++) innerXML += graphmlgen.port('out' + i);
            return graphmlgen.node(id, data, innerXML);
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
        var self = this;
        this.type = "function";
        this.name = name;
        this.inPorts = inPorts;
        this.outPorts = outPorts;
        this.nodes = [];
        this.edges = [];
        this.fields = ["name"];
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
        this.fields = ["op"];        
    }

node.binary.prototype = node.simple;

node.element = function (inPorts, outPorts) {
        this.type = "element";
        this.inPorts = inPorts;
        this.outPorts = outPorts;
    }

node.element.prototype = node.simple;

node.range = function (inPorts, outPorts) {
        this.type = "range";
        this.inPorts = inPorts;
        this.outPorts = outPorts;
    }

node.range.prototype = node.simple;

node.scatter = function (inPort, outPort) {
        this.type = "scatter";
        this.inPorts = [inPort];
        this.outPorts = [outPort];
    }

node.scatter.prototype = node.simple;

node.identifier = function (id, color) { // port with name
        this.type = "id";
        this.inPorts = [];
        this.outPorts = [new port.colored(color)];
        this.id = id;
        this.color = color;
    }

node.identifier.prototype = node.simple;

node.constant = function (value, color) { // port with name
        var self = this;
        this.type = "constant";
        this.inPorts = [];
        this.outPorts = [new port.colored(color)];
        this.value = value;
        this.color = color;
        this.fields = ["value"];
        this.toText = function () {return this.value;}
    }

node.constant.prototype = node.simple;

node.fake = function (color) {
        this.inPorts = [];
        this.outPorts = [];
        this.color = color;
        this.fake = 1;
    }

node.fake.prototype = node.simple;

node.sisalir = function(ast){ // constructs sisal IR from Abstract syntax tree
    var irGen = new irGenerator();
    var self = this;

    this.nodes=[];
    this.inPorts = [];
    this.outPorts = [];

    for (var i=0;i<ast.length;i++) {
        this.addNodes(irGen.parse(ast[i]));
    }
    this.toGraphML = function () {
        var xmlstr = '';
        for (var i=0; i<self.nodes.length; i++) {
           xmlstr += self.nodes[i].toXML("n" + i);
        }
        return graphmlgen.headers(xmlstr);    
    }
    this.toText = function () {
        var str = '';
        for (var i=0; i<self.nodes.length; i++) {
           str += self.nodes[i].toText();
        }
        return str;            
    }
}

node.sisalir.prototype=node.complex;
