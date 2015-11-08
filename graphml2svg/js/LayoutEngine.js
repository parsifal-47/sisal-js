///<reference path="../Abstraction/IPort.ts"/>
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IDescription.ts"/>
///<reference path="../Abstraction/IEdge.ts"/>
var Details;
(function (Details) {
    var Description = (function () {
        function Description(type, name) {
            this.type = type;
            this.name = name;
        }
        return Description;
    })();
    Details.Description = Description;
})(Details || (Details = {}));
///<reference path="../Abstraction/IEdge.ts"/>
///<reference path="../Abstraction/INode.ts"/>
///<reference path="Description.ts"/>
var Details;
(function (Details) {
    var Edge = (function () {
        function Edge(source, target) {
            if (source.data.type !== target.data.type) {
                throw new Error('Different types ' + source.data.type + ' ' + target.data.type);
            }
            this.sourcePort = source;
            this.targetPort = target;
            this.sourceNode = source.node;
            this.targetNode = target.node;
            var type = source.data.type;
            var name = source.data.name + '->' + target.data.name;
            this.description = new Details.Description(type, name);
        }
        return Edge;
    })();
    Details.Edge = Edge;
})(Details || (Details = {}));
///<reference path="../../Abstraction/IEdge.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Details;
(function (Details) {
    var FakeEdge = (function (_super) {
        __extends(FakeEdge, _super);
        function FakeEdge(source, target, realEdge) {
            _super.call(this, source, target);
            this.realEdge = realEdge;
        }
        return FakeEdge;
    })(Details.Edge);
    Details.FakeEdge = FakeEdge;
})(Details || (Details = {}));
///<reference path="../Abstraction/IDescription.ts"/>
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IEdge.ts"/>
var Details;
(function (Details) {
    var Node = (function () {
        function Node(meta) {
            this.record = meta;
            this.iports = new Array(0);
            this.oports = new Array(0);
            this.nodes = new Array(0);
            this.edges = new Array(0);
        }
        return Node;
    })();
    Details.Node = Node;
})(Details || (Details = {}));
///<reference path="../../Abstraction/IDescription.ts"/>
///<reference path="../../Abstraction/IEdge.ts"/>
///<reference path="../../Details/Node.ts"/>
var Details;
(function (Details) {
    var FakeNode = (function (_super) {
        __extends(FakeNode, _super);
        function FakeNode(meta, edge) {
            _super.call(this, meta);
            this.realEdge = edge;
        }
        return FakeNode;
    })(Details.Node);
    Details.FakeNode = FakeNode;
})(Details || (Details = {}));
var Details;
(function (Details) {
    var Geometry = (function () {
        function Geometry(x, y, w, h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        return Geometry;
    })();
    Details.Geometry = Geometry;
})(Details || (Details = {}));
var Details;
(function (Details) {
    var Port = (function () {
        function Port(node, data) {
            this.data = data;
            this.node = node;
        }
        return Port;
    })();
    Details.Port = Port;
})(Details || (Details = {}));
var Utils;
(function (Utils) {
    function clone(source) {
        var cloneObj = new source.constructor;
        for (var attribut in source) {
            if (source.hasOwnProperty(attribut)) {
                if (typeof source[attribut] === "object") {
                    cloneObj[attribut] = clone(source[attribut]);
                }
                else {
                    cloneObj[attribut] = source[attribut];
                }
            }
        }
        return cloneObj;
    }
    Utils.clone = clone;
    function getNodeKey(node, nodedict) {
        for (var key in nodedict) {
            if (nodedict.hasOwnProperty(key)) {
                if (nodedict[key] === node) {
                    return key;
                }
            }
        }
        throw new Error('Key not found');
    }
    Utils.getNodeKey = getNodeKey;
    function getAllNestedNodes(node) {
        var nodes = new Array(0);
        for (var i = 0; i < node.nodes.length; i++) {
            var nestedNode = node.nodes[i];
            nodes.push(nestedNode);
            var allNestedNodes = getAllNestedNodes(nestedNode);
            for (var j = 0; j < allNestedNodes.length; j++) {
                var childNode = allNestedNodes[j];
                nodes.push(childNode);
            }
        }
        return nodes;
    }
    Utils.getAllNestedNodes = getAllNestedNodes;
    function getNestedNodesDictionary(node) {
        var dict = {};
        var nodes = getAllNestedNodes(node);
        for (var i = 0; i < nodes.length; i++) {
            var nestedNode = nodes[i];
            if (nestedNode.record.name === '') {
                throw new Error('cannot detect node name');
            }
            dict[nestedNode.record.name] = nestedNode;
        }
        return dict;
    }
    Utils.getNestedNodesDictionary = getNestedNodesDictionary;
})(Utils || (Utils = {}));
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IGeometry.ts"/>
///<reference path="../Utils/Utils.ts"/>
var GraphLib;
(function (GraphLib) {
    var getNodeKey = Utils.getNodeKey;
    var CoordinatesAssigner = (function () {
        function CoordinatesAssigner(dw, dh) {
            this.dh = dh;
            this.dw = dw;
        }
        CoordinatesAssigner.prototype.assignCoordinatesToNodes = function (graph, nodedict, levels, geometry) {
            var levelHeights = this.getLevelHeights(nodedict, levels, geometry);
            this.assignVerticalCoordinates(graph, nodedict, levels, levelHeights, geometry);
            var levelNodeMap = this.createLevelNodeMap(graph, nodedict, levels);
            this.assignHorizontalCoordinates(nodedict, levelNodeMap, geometry);
        };
        CoordinatesAssigner.prototype.getLevelHeights = function (nodedict, levels, geometry) {
            var levelHeights = {};
            var levelMap = this.getLevelMap(nodedict, levels, geometry);
            for (var level in levelMap) {
                if (levelMap.hasOwnProperty(level)) {
                    if (levelHeights[level] === undefined) {
                        levelHeights[level] = Number.NEGATIVE_INFINITY;
                    }
                    for (var gi = 0; gi < levelMap[level].length; gi++) {
                        var geom = levelMap[level][gi];
                        if (geom !== undefined && geom !== null) {
                            if (geom.h > levelHeights[level]) {
                                levelHeights[level] = geom.h;
                            }
                        }
                    }
                }
            }
            return levelHeights;
        };
        CoordinatesAssigner.prototype.getLevelMap = function (nodedict, levels, geometry) {
            var levelMap = {};
            for (var nodeKey in nodedict) {
                if (nodedict.hasOwnProperty(nodeKey)) {
                    var level = levels[nodeKey];
                    if (level !== undefined) {
                        if (levelMap[level] === undefined) {
                            levelMap[level] = new Array(0);
                        }
                        levelMap[level].push(geometry[nodeKey]);
                    }
                }
            }
            return levelMap;
        };
        CoordinatesAssigner.prototype.getPreviousLevelsHeight = function (nodeLevel, levelHeights) {
            var sum = 0;
            for (var key in levelHeights) {
                if (levelHeights.hasOwnProperty(key)) {
                    if (key < nodeLevel) {
                        sum += levelHeights[key] + this.dh;
                    }
                }
            }
            return sum;
        };
        CoordinatesAssigner.prototype.assignVerticalCoordinates = function (graph, nodedict, levels, levelHeights, geometry) {
            for (var ni = 0; ni < graph.nodes.length; ni++) {
                var node = graph.nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeLevel = levels[nodeKey];
                var previousLevelsHeight = this.getPreviousLevelsHeight(nodeLevel, levelHeights);
                var nodeGeometry = geometry[nodeKey];
                nodeGeometry.y = previousLevelsHeight + this.dh;
            }
        };
        CoordinatesAssigner.prototype.createLevelNodeMap = function (graph, nodedict, levels) {
            var map = {};
            for (var ni = 0; ni < graph.nodes.length; ni++) {
                var node = graph.nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeLevel = levels[nodeKey];
                var nodes = map[nodeLevel] || (map[nodeLevel] = new Array(0));
                nodes.push(node);
            }
            return map;
        };
        CoordinatesAssigner.prototype.assignHorizontalCoordinates = function (nodedict, levelNodeMap, geometry) {
            for (var level in levelNodeMap) {
                if (levelNodeMap.hasOwnProperty(level)) {
                    var nodes = levelNodeMap[level];
                    var lastX = this.dw;
                    for (var ni = 0; ni < nodes.length; ni++) {
                        var node = nodes[ni];
                        var nodeKey = getNodeKey(node, nodedict);
                        var nodeGeometry = geometry[nodeKey];
                        nodeGeometry.x = lastX; // check next instruction;
                        lastX += nodeGeometry.w + this.dw;
                    }
                }
            }
        };
        return CoordinatesAssigner;
    })();
    GraphLib.CoordinatesAssigner = CoordinatesAssigner;
})(GraphLib || (GraphLib = {}));
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IEdge.ts"/>
///<reference path="../Abstraction/IGeometry.ts"/>
///<reference path="../Details/Fake/FakeEdge.ts"/>
///<reference path="../Utils/Utils.ts"/>
var GraphLib;
(function (GraphLib) {
    var getNodeKey = Utils.getNodeKey;
    var FakeEdge = Details.FakeEdge;
    var CoordinatesOptimizer = (function () {
        function CoordinatesOptimizer() {
        }
        CoordinatesOptimizer.prototype.optimizeCoordinatesToNodes = function (graph, nodedict, levels, geometry) {
            var graphWidth = this.getGraphWidth(graph, nodedict, geometry);
            var currentPortLocation = this.getInputPortCoordinates(graph.iports, graphWidth);
            var filteredEdges = this.getFilteredEdges(graph.edges);
            var ports = this.getTargetPorts(graph.iports, filteredEdges);
            var currentNodes = this.getNodesOfPorts(graph, ports);
            this.allocateNodesBySourcePorts(currentNodes, nodedict, geometry, graph, currentPortLocation);
            currentNodes = this.getNextCurrentNodes(graph, currentNodes, filteredEdges);
            while (currentNodes.length > 0) {
                this.allocateNodesBySourceNodes(currentNodes, nodedict, geometry, graph);
                currentNodes = this.getNextCurrentNodes(graph, currentNodes, filteredEdges);
            }
        };
        CoordinatesOptimizer.prototype.getNodesOfPorts = function (graph, ports) {
            var nodes = new Array(0);
            for (var pi = 0; pi < ports.length; pi++) {
                var node = ports[pi].node;
                if (node !== graph && nodes.indexOf(node) === -1) {
                    nodes.push(node);
                }
            }
            return nodes;
        };
        CoordinatesOptimizer.prototype.getSourcePorts = function (targetPorts, edges) {
            var ports = new Array(0);
            for (var ei = 0; ei < edges.length; ei++) {
                var edge = edges[ei];
                if (targetPorts.indexOf(edge.targetPort) >= 0) {
                    if (ports.indexOf(edge.sourcePort) <= -1) {
                        ports.push(edge.sourcePort);
                    }
                }
            }
            return ports;
        };
        CoordinatesOptimizer.prototype.getTargetPorts = function (sourcePorts, edges) {
            var ports = new Array(0);
            for (var ei = 0; ei < edges.length; ei++) {
                var edge = edges[ei];
                if (sourcePorts.indexOf(edge.sourcePort) >= 0) {
                    if (ports.indexOf(edge.targetPort) <= -1) {
                        ports.push(edge.targetPort);
                    }
                }
            }
            return ports;
        };
        CoordinatesOptimizer.prototype.getInputPortCoordinates = function (iports, graphWidth) {
            var coordDict = {};
            var deltaX = graphWidth / (iports.length + 1);
            for (var pi = 0; pi < iports.length; pi++) {
                coordDict[pi] = deltaX * (pi + 1);
            }
            return coordDict;
        };
        CoordinatesOptimizer.prototype.getMeanHorizontalCoord = function (nodeSourcePorts, portDict, portHorizontalCoord) {
            var x = 0;
            for (var pi = 0; pi < nodeSourcePorts.length; pi++) {
                var port = nodeSourcePorts[pi];
                var portIndex = portDict.indexOf(port);
                x += portHorizontalCoord[portIndex];
            }
            x /= nodeSourcePorts.length;
            return x;
        };
        CoordinatesOptimizer.prototype.shiftNodesToRight = function (nodes, nodedict, geometry, index, shiftValue) {
            for (var ni = index; ni < nodes.length; ni++) {
                var node = nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeGeometry = geometry[nodeKey];
                nodeGeometry.x += shiftValue;
            }
        };
        CoordinatesOptimizer.prototype.allocateNodesBySourcePorts = function (nodes, nodedict, geometry, graph, portHorizontalCoord) {
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeGeometry = geometry[nodeKey];
                var nodeSourcePorts = this.getSourcePorts(node.iports, graph.edges);
                var oldX = nodeGeometry.x;
                nodeGeometry.x = this.getMeanHorizontalCoord(nodeSourcePorts, graph.iports, portHorizontalCoord);
                nodeGeometry.x -= nodeGeometry.w / 2;
                if (nodeGeometry.x > oldX) {
                    this.shiftNodesToRight(nodes, nodedict, geometry, ni + 1, nodeGeometry.x - oldX);
                }
            }
        };
        CoordinatesOptimizer.prototype.getNextCurrentNodes = function (graph, currentNodes, edges) {
            var oports = new Array(0);
            for (var ni = 0; ni < currentNodes.length; ni++) {
                var node = currentNodes[ni];
                for (var opi = 0; opi < node.oports.length; opi++) {
                    var oport = node.oports[opi];
                    oports.push(oport);
                }
            }
            var targetPorts = this.getTargetPorts(oports, edges);
            var targetNodes = this.getNodesOfPorts(graph, targetPorts);
            return targetNodes;
        };
        CoordinatesOptimizer.prototype.allocateNodesBySourceNodes = function (nodes, nodedict, geometry, graph) {
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeGeometry = geometry[nodeKey];
                var nodeSourcePorts = this.getSourcePorts(node.iports, graph.edges);
                var sourceNodes = this.getNodesOfPorts(graph, nodeSourcePorts);
                var oldX = nodeGeometry.x;
                nodeGeometry.x = this.getMeanHorizontalCoordinate(sourceNodes, nodedict, geometry);
                if (nodeGeometry.x > oldX) {
                    this.shiftNodesToRight(nodes, nodedict, geometry, ni + 1, nodeGeometry.x - oldX);
                }
            }
        };
        CoordinatesOptimizer.prototype.getMeanHorizontalCoordinate = function (nodes, nodedict, geometry) {
            var x = 0;
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeGeometry = geometry[nodeKey];
                x += nodeGeometry.x;
            }
            x /= nodes.length;
            return x;
        };
        CoordinatesOptimizer.prototype.getGraphWidth = function (graph, nodedict, geometry) {
            var w = 0;
            for (var ni = 0; ni < graph.nodes.length; ni++) {
                var node = graph.nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                var nodeGeometry = geometry[nodeKey];
                if (nodeGeometry.x + nodeGeometry.w > w) {
                    w = nodeGeometry.x + nodeGeometry.w;
                }
            }
            return w + 42;
        };
        CoordinatesOptimizer.prototype.getFilteredEdges = function (edges) {
            var excludedRealEdges = new Array(0);
            for (var ei = 0; ei < edges.length; ei++) {
                var edge = edges[ei];
                if (edge instanceof FakeEdge) {
                    var fakeEdge = edge;
                    if (excludedRealEdges.indexOf(fakeEdge.realEdge) <= -1) {
                        excludedRealEdges.push(fakeEdge.realEdge);
                    }
                }
            }
            var filteredEdges = new Array(0);
            for (var fei = 0; fei < edges.length; fei++) {
                var filteringEdge = edges[fei];
                if (excludedRealEdges.indexOf(filteringEdge) <= -1) {
                    filteredEdges.push(filteringEdge);
                }
            }
            return filteredEdges;
        };
        return CoordinatesOptimizer;
    })();
    GraphLib.CoordinatesOptimizer = CoordinatesOptimizer;
})(GraphLib || (GraphLib = {}));
var Transformation;
(function (Transformation) {
    var FakeNode = Details.FakeNode;
    var FakeEdge = Details.FakeEdge;
    var getNodeKey = Utils.getNodeKey;
    var Geometry = Details.Geometry;
    function toJsonWithoutHierarchy(node, geometry) {
        return {
            x: geometry.x,
            y: geometry.y,
            width: geometry.w,
            height: geometry.h,
            id: node.record.name,
            graph: null
        };
    }
    function getPointsOfEdge(edge, nodedict, geometry) {
        var points = new Array(0);
        for (var nodeKey in nodedict) {
            if (nodedict.hasOwnProperty(nodeKey)) {
                var node = nodedict[nodeKey];
                if (node instanceof FakeNode) {
                    var fakeNode = node;
                    if (fakeNode.realEdge === edge) {
                        points.push({
                            x: geometry[nodeKey].x,
                            y: geometry[nodeKey].y
                        });
                    }
                }
            }
        }
        return points;
    }
    function getPortDepth(name) {
        return name.lastIndexOf('::');
    }
    function getEdgeRoute(edge, geometry, nodedict, portsGeometry) {
        var points = getPointsOfEdge(edge, nodedict, geometry);
        var sourcePortKey = edge.sourcePort.data.name;
        var sourcePortGeometry = portsGeometry[sourcePortKey];
        var targetPortKey = edge.targetPort.data.name;
        var targetPortGeometry = portsGeometry[targetPortKey];
        var sourcePortPoint = { x: sourcePortGeometry.x, y: sourcePortGeometry.y };
        var targetPortPoint = { x: targetPortGeometry.x, y: targetPortGeometry.y };
        if (getPortDepth(sourcePortKey) <= getPortDepth(targetPortKey)) {
            var targetNodeKey = getNodeKey(edge.targetNode, nodedict);
            var targetNodeGeometry = geometry[targetNodeKey];
            targetPortPoint.x += targetNodeGeometry.x;
            targetPortPoint.y += targetNodeGeometry.y;
        }
        if (getPortDepth(sourcePortKey) >= getPortDepth(targetPortKey)) {
            var sourceNodeKey = getNodeKey(edge.sourceNode, nodedict);
            var sourceNodeGeometry = geometry[sourceNodeKey];
            sourcePortPoint.x += sourceNodeGeometry.x;
            sourcePortPoint.y += sourceNodeGeometry.y;
        }
        points.splice(0, 0, sourcePortPoint);
        points.push(targetPortPoint);
        var route = '';
        for (var pi = 0, length = points.length; pi < length; pi++) {
            var point = points[pi];
            route += pi === 0 ? 'M ' : 'L ';
            route += point.x + ',' + point.y + ' ';
        }
        return route;
    }
    function edgeToJson(edge, geometry, nodedict, portsGeometry) {
        return {
            id: edge.description.name,
            f: edge.sourceNode != null ? edge.sourceNode.record.name : null,
            t: edge.targetNode != null ? edge.targetNode.record.name : null,
            tp: edge.targetPort.data.name,
            fp: edge.sourcePort.data.name,
            route: getEdgeRoute(edge, geometry, nodedict, portsGeometry)
        };
    }
    function portToJson(port, geometry) {
        return {
            id: port.data.name,
            x: geometry.x,
            y: geometry.y,
            width: geometry.w,
            height: geometry.h,
            graph: null
        };
    }
    ;
    function getPortGeometry(nodeGeometry, portIndex, portNumber, useNodeHeight) {
        var x = nodeGeometry.w / (portNumber + 1) * (portIndex + 1);
        var y = useNodeHeight ? nodeGeometry.h : 0;
        var w = 42;
        var h = 42;
        return new Geometry(x, y, w, h);
    }
    ;
    function internalToJson(node, geometry, nodedict, topHierarchy, portsGeometry) {
        var json;
        if (topHierarchy) {
            json = { nodes: [], edges: [] };
        }
        else {
            var nodeKey = getNodeKey(node, nodedict);
            var nodeGeometry = geometry[nodeKey];
            json = toJsonWithoutHierarchy(node, nodeGeometry);
            if (node.nodes.length > 0) {
                json.graph = { nodes: [], edges: [] };
            }
        }
        var container = topHierarchy ? json : json.graph;
        for (var ni = 0, nodeCount = node.nodes.length; ni < nodeCount; ni++) {
            var subNode = node.nodes[ni];
            if (subNode instanceof FakeNode) {
                continue;
            }
            var jsonSubNode = internalToJson(subNode, geometry, nodedict, false, portsGeometry);
            container.nodes.push(jsonSubNode);
        }
        if (node.iports.length + node.oports.length > 0) {
            var jsonNodeKey = getNodeKey(node, nodedict);
            var jsonNodeGeometry = geometry[jsonNodeKey];
            for (var ipi = 0, iportCount = node.iports.length; ipi < iportCount; ipi++) {
                var iPort = node.iports[ipi];
                var iPortGeometry = getPortGeometry(jsonNodeGeometry, ipi, iportCount, false);
                var jsonIPort = portToJson(iPort, iPortGeometry);
                if (container != null) {
                    container.nodes.push(jsonIPort);
                }
                portsGeometry[iPort.data.name] = iPortGeometry;
            }
            for (var opi = 0, oportCount = node.oports.length; opi < oportCount; opi++) {
                var oPort = node.oports[opi];
                var oPortGeometry = getPortGeometry(jsonNodeGeometry, opi, oportCount, true);
                var jsonOPort = portToJson(oPort, oPortGeometry);
                if (container != null) {
                    container.nodes.push(jsonOPort);
                }
                portsGeometry[oPort.data.name] = oPortGeometry;
            }
        }
        for (var ei = 0, edgeCount = node.edges.length; ei < edgeCount; ei++) {
            var edge = node.edges[ei];
            if (edge instanceof FakeEdge) {
                continue;
            }
            var jsonEdge = edgeToJson(edge, geometry, nodedict, portsGeometry);
            container.edges.push(jsonEdge);
        }
        return json;
    }
    function toJson(node, geometry, nodedict) {
        var portsGeometry = {};
        return internalToJson(node, geometry, nodedict, true, portsGeometry);
    }
    Transformation.toJson = toJson;
})(Transformation || (Transformation = {}));
///<reference path="../Abstraction/IGeometry.ts"/>
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IEdge.ts"/>
///<reference path="../Details/Node.ts"/>
///<reference path="../Details/Geometry.ts"/>
///<reference path="../Utils/Utils.ts"/>
///<reference path="../Utils/Transformation.ts"/>
var GraphLib;
(function (GraphLib) {
    var Geometry = Details.Geometry;
    var getNodeKey = Utils.getNodeKey;
    var getNestedNodesDictionary = Utils.getNestedNodesDictionary;
    var toJson = Transformation.toJson;
    var Engine = (function () {
        function Engine() {
        }
        Engine.prototype.perform = function (graph, settings) {
            var nodedict = getNestedNodesDictionary(graph);
            var geometry = {};
            this.internalPerform(graph, nodedict, geometry, settings, true);
            var json = toJson(graph, geometry, nodedict);
            return json;
        };
        Engine.prototype.internalPerform = function (node, nodedict, geometry, settings, root) {
            for (var ni = 0, nodeCount = node.nodes.length; ni < nodeCount; ni++) {
                var subNode = node.nodes[ni];
                this.internalPerform(subNode, nodedict, geometry, settings, false);
            }
            this.layoutSingleGraph(node, nodedict, geometry, settings);
            if (!root) {
                var nodeKey = getNodeKey(node, nodedict);
                if (!geometry.hasOwnProperty(nodeKey)) {
                    var s = settings.simpleNodeGeometry;
                    geometry[nodeKey] = new Geometry(s.x, s.y, s.w, s.h);
                }
                var nodeGeometry = geometry[nodeKey];
                var subNodeSize = this.getNodeSize(node, geometry, nodedict);
                nodeGeometry.w = subNodeSize.w;
                nodeGeometry.h = subNodeSize.h;
            }
        };
        Engine.prototype.layoutSingleGraph = function (graph, nodedict, geometry, settings) {
            if (graph.edges.length > 0) {
                var levelAssigner = new GraphLib.LevelAssigner();
                var levels = levelAssigner.assignLevelsToNodes(graph, nodedict);
                var longEdgesSplitter = new GraphLib.LongEdgesSplitter();
                longEdgesSplitter.split(graph, nodedict, levels);
                levels = levelAssigner.assignLevelsToNodes(graph, nodedict);
                var connectedGeometry = this.createEmptyGeometryFor(nodedict, settings);
                this.appendGeometry(geometry, connectedGeometry);
                var coordinatesAssigner = new GraphLib.CoordinatesAssigner(settings.horizontalNodeGap, settings.verticalNodeGap);
                coordinatesAssigner.assignCoordinatesToNodes(graph, nodedict, levels, geometry);
                var coordinatesOptimizer = new GraphLib.CoordinatesOptimizer();
                coordinatesOptimizer.optimizeCoordinatesToNodes(graph, nodedict, levels, geometry);
            }
            else if (graph.nodes.length > 0) {
                var lastX = 42;
                var lastY = 42;
                var lastW = 0;
                var deltW = settings.horizontalNodeGap;
                for (var i = 0; i < graph.nodes.length; i++) {
                    var n = graph.nodes[i];
                    var nKey = getNodeKey(n, nodedict);
                    var nGem = geometry[nKey];
                    nGem.x = lastX + lastW + deltW * (i === 0 ? 0 : 1);
                    nGem.y = lastY;
                    lastX = nGem.x;
                    lastW = nGem.w;
                }
            }
        };
        Engine.prototype.createEmptyGeometryFor = function (nodedict, settings) {
            var geometry = {};
            var s = settings.simpleNodeGeometry;
            for (var key in nodedict) {
                if (nodedict.hasOwnProperty(key)) {
                    geometry[key] = new Geometry(s.x, s.y, s.w, s.h);
                }
            }
            return geometry;
        };
        Engine.prototype.appendGeometry = function (leftGeometry, rightGeometry) {
            for (var nodeKey in rightGeometry) {
                if (rightGeometry.hasOwnProperty(nodeKey) && !leftGeometry.hasOwnProperty(nodeKey)) {
                    leftGeometry[nodeKey] = rightGeometry[nodeKey];
                }
            }
        };
        Engine.prototype.getNodeSize = function (node, geometry, nodedict) {
            var w = 0;
            var h = 0;
            if (node.nodes.length > 0) {
                for (var ni = 0; ni < node.nodes.length; ni++) {
                    var subNode = node.nodes[ni];
                    var key = getNodeKey(subNode, nodedict);
                    var g = geometry[key];
                    if (w < g.x + g.w) {
                        w = g.x + g.w;
                    }
                    if (h < g.y + g.h) {
                        h = g.y + g.h;
                    }
                }
                return { w: w + 42, h: h + 42 };
            }
            else {
                return { w: 42, h: 42 };
            }
        };
        return Engine;
    })();
    GraphLib.Engine = Engine;
})(GraphLib || (GraphLib = {}));
var GraphLib;
(function (GraphLib) {
    var Node = Details.Node;
    var Port = Details.Port;
    var Edge = Details.Edge;
    var Description = Details.Description;
    var EngineHelper = (function () {
        function EngineHelper() {
        }
        EngineHelper.prototype.createTestNode = function () {
            var portDict = {};
            var port;
            var container = new Node(new Description('container', 'root'));
            for (var ipi = 0; ipi < 4; ipi++) {
                container.iports.push(new Port(undefined, new Description('int', 'exip' + ipi)));
                port = this.getLastItem(container.iports);
                portDict[port.data.name] = port;
            }
            for (var opi = 0; opi < 1; opi++) {
                container.oports.push(new Port(undefined, new Description('int', 'exop' + opi)));
                port = this.getLastItem(container.oports);
                portDict[port.data.name] = port;
            }
            for (var i = 0; i < 3; i++) {
                var func = 'f' + i.toString();
                var n = new Node(new Description('func', func));
                for (var j = 0; j < 2; j++) {
                    var iport = func + 'ip' + j.toString();
                    var ip = new Port(n, new Description('int', iport));
                    n.iports.push(ip);
                    port = this.getLastItem(n.iports);
                    portDict[port.data.name] = port;
                }
                for (var k = 0; k < 1; k++) {
                    var oport = func + 'op' + k.toString();
                    var op = new Port(n, new Description('int', oport));
                    n.oports.push(op);
                    port = this.getLastItem(n.oports);
                    portDict[port.data.name] = port;
                }
                container.nodes.push(n);
            }
            var edgeSchema = new Array(0);
            edgeSchema.push({ source: 'exip0', target: 'f0ip0' });
            edgeSchema.push({ source: 'exip1', target: 'f1ip0' });
            edgeSchema.push({ source: 'exip2', target: 'f2ip0' });
            edgeSchema.push({ source: 'exip3', target: 'f2ip1' });
            edgeSchema.push({ source: 'f1op0', target: 'f0ip1' });
            edgeSchema.push({ source: 'f2op0', target: 'f1ip1' });
            edgeSchema.push({ source: 'f0op0', target: 'exop0' });
            for (var esi = 0; esi < edgeSchema.length; esi++) {
                var es = edgeSchema[esi];
                var sPort = portDict[es.source];
                var tPort = portDict[es.target];
                container.edges.push(new Edge(sPort, tPort));
            }
            return container;
        };
        EngineHelper.prototype.geometryToString = function (geometry) {
            var str = '';
            for (var key in geometry) {
                if (geometry.hasOwnProperty(key)) {
                    var g = geometry[key];
                    str += key + ' ' + this.toString(g) + '<br/>';
                }
            }
            return str;
        };
        EngineHelper.prototype.createFromJson = function (json) {
            var nodedict = {};
            return this.internalCreateFromJson(json, nodedict);
        };
        EngineHelper.prototype.internalCreateFromJson = function (json, nodedict) {
            var container = this.createNodeWithoutHierarchy(json, nodedict);
            json = json.graph || json;
            if (json.nodes !== undefined) {
                for (var ni = 0; ni < json.nodes.length; ni++) {
                    var jsonNode = json.nodes[ni];
                    if (this.isNode(jsonNode)) {
                        var node = this.internalCreateFromJson(jsonNode, nodedict);
                        container.nodes.push(node);
                    }
                }
            }
            if (json.ports !== undefined) {
                for (var pi = 0; pi < json.ports.length; pi++) {
                    var jsonPort = json.ports[pi];
                    if (this.isInPort(jsonPort)) {
                        var iPort = this.createPortFromJson(jsonPort, container);
                        container.iports.push(iPort);
                    }
                    else if (this.isOutPort(jsonPort)) {
                        var oPort = this.createPortFromJson(jsonPort, container);
                        container.oports.push(oPort);
                    }
                }
            }
            if (json.edges !== undefined) {
                for (var ei = 0; ei < json.edges.length; ei++) {
                    var jsonEdge = json.edges[ei];
                    var edge = this.createEdgeFromJson(jsonEdge, nodedict);
                    container.edges.push(edge);
                }
            }
            return container;
        };
        EngineHelper.prototype.createNodeWithoutHierarchy = function (json, nodedict) {
            var node = new Node(new Description('node type', json.id || 'root'));
            if (json.id !== undefined) {
                nodedict[json.id] = node;
            }
            return node;
        };
        EngineHelper.prototype.createEdgeFromJson = function (jsonEdge, nodedict) {
            var sourceNode = nodedict[jsonEdge.f];
            var sourcePortName = jsonEdge.f + '::' + jsonEdge.fp;
            var sourcePort = this.getNodePort(sourceNode, sourcePortName);
            var targetNode = nodedict[jsonEdge.t];
            var targetPortName = jsonEdge.t + '::' + jsonEdge.tp;
            var targetPort = this.getNodePort(targetNode, targetPortName);
            return new Edge(sourcePort, targetPort);
        };
        EngineHelper.prototype.nodeToString = function (node, space) {
            var str = '';
            space = space || '';
            str += space + '[)' + node.record.type + '  "' + node.record.name + '"]<br/>';
            if (node.iports.length > 0) {
                var piStr = space;
                for (var ip = 0; ip < node.iports.length; ip++) {
                    var port = node.iports[ip];
                    piStr += this.portToString(port);
                }
                str += space + piStr + '<br/>';
            }
            if (node.oports.length > 0) {
                var poStr = space;
                for (var op = 0; op < node.oports.length; op++) {
                    var p = node.oports[op];
                    poStr += this.portToString(p);
                }
                str += space + poStr + '<br/>';
            }
            for (var i = 0; i < node.nodes.length; i++) {
                var n = node.nodes[i];
                str += space + this.nodeToString(n, space + '&nbsp;&nbsp;');
            }
            str += space + '[}' + node.record.type + ']<br/>';
            return str;
        };
        EngineHelper.prototype.portToString = function (port) {
            return '(' + port.data.name + ' of ' + port.data.type + ')';
        };
        EngineHelper.prototype.toString = function (o) {
            var str = '[';
            for (var p in o) {
                if (o.hasOwnProperty(p)) {
                    str += p + '= ' + o[p] + '; ';
                }
            }
            return str + ']';
        };
        EngineHelper.prototype.getLastItem = function (array) {
            var length = array.length;
            if (length >= 0) {
                return array[length - 1];
            }
            else {
                throw new Error("empty array");
            }
        };
        EngineHelper.prototype.isNode = function (jsonNode) {
            return !this.isInPort(jsonNode) && !this.isOutPort(jsonNode);
        };
        EngineHelper.prototype.isInPort = function (jsonNode) {
            return this.endsWith(jsonNode.id, 'in\\d+');
        };
        EngineHelper.prototype.isOutPort = function (jsonNode) {
            return this.endsWith(jsonNode.id, 'out\\d+');
        };
        EngineHelper.prototype.createPortFromJson = function (jsonNode, node) {
            var portType = 'port type';
            var port = new Port(node, new Description(portType, jsonNode.id));
            return port;
        };
        EngineHelper.prototype.endsWith = function (input, pattern) {
            return new RegExp(pattern + '$', 'i').test(input);
        };
        EngineHelper.prototype.getNodePort = function (node, portName) {
            for (var ipi = 0; ipi < node.iports.length; ipi++) {
                var iPort = node.iports[ipi];
                var iPortName = iPort.data.name;
                if (portName === iPortName) {
                    return iPort;
                }
            }
            for (var opi = 0; opi < node.oports.length; opi++) {
                var oPort = node.oports[opi];
                var oPortName = oPort.data.name;
                if (portName === oPortName) {
                    return oPort;
                }
            }
            throw 'cannot find port port';
        };
        return EngineHelper;
    })();
    GraphLib.EngineHelper = EngineHelper;
})(GraphLib || (GraphLib = {}));
///<reference path="../Abstraction/INode.ts"/>
///<reference path="../Abstraction/IEdge.ts"/>
///<reference path="../Abstraction/IGeometry.ts"/>
///<reference path="../Details/Fake/FakeEdge.ts"/>
///<reference path="../Utils/Utils.ts"/>
var GraphLib;
(function (GraphLib) {
    var getNodeKey = Utils.getNodeKey;
    var LevelAssigner = (function () {
        function LevelAssigner() {
        }
        LevelAssigner.prototype.assignLevelsToNodes = function (graph, nodedict) {
            var rawlevels = this.getInitialLevels(graph.nodes, nodedict);
            var targetPorts = graph.oports;
            var marker = 0;
            while (targetPorts.length > 0) {
                var sourcePorts = this.getSourcePorts(targetPorts, graph.edges);
                var sourceNodes = this.getSourceNodes(sourcePorts, graph);
                for (var ni = 0; ni < sourceNodes.length; ni++) {
                    var node = sourceNodes[ni];
                    var nodeKey = getNodeKey(node, nodedict);
                    var nodelevel = rawlevels[nodeKey];
                    rawlevels[nodeKey] = Math.max(nodelevel, marker + 1);
                }
                targetPorts = this.getTargetPorts(sourceNodes);
                marker += 1;
            }
            var maxLevel = this.getMaxLevel(rawlevels);
            var topConstantNodes = this.getTopConstantNodes(graph.nodes, nodedict, rawlevels, maxLevel);
            if (topConstantNodes.length > 0) {
            }
            var levels = this.getReversedLevels(rawlevels, maxLevel + 1);
            return levels;
        };
        LevelAssigner.prototype.getSourceNodes = function (ports, exceptNode) {
            var nodes = new Array(0);
            for (var pi = 0; pi < ports.length; pi++) {
                var node = ports[pi].node;
                if (node !== undefined && nodes.indexOf(node) === -1 && node !== exceptNode) {
                    nodes.push(node);
                }
            }
            return nodes;
        };
        LevelAssigner.prototype.getTargetPorts = function (nodes) {
            var ports = new Array(0);
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                for (var pi = 0; pi < node.iports.length; pi++) {
                    var port = node.iports[pi];
                    ports.push(port);
                }
            }
            return ports;
        };
        LevelAssigner.prototype.getSourcePorts = function (targetPorts, edges) {
            var ports = new Array(0);
            for (var ei = 0; ei < edges.length; ei++) {
                var edge = edges[ei];
                if (targetPorts.indexOf(edge.targetPort) >= 0) {
                    if (ports.indexOf(edge.sourcePort) <= -1) {
                        ports.push(edge.sourcePort);
                    }
                }
            }
            return ports;
        };
        LevelAssigner.prototype.getInitialLevels = function (nodes, nodedict) {
            var levels = {};
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                var nodeKey = getNodeKey(node, nodedict);
                levels[nodeKey] = Number.NEGATIVE_INFINITY;
            }
            return levels;
        };
        LevelAssigner.prototype.getReversedLevels = function (rawlevels, maxLevel) {
            var levels = {};
            for (var levelKey in rawlevels) {
                if (rawlevels.hasOwnProperty(levelKey)) {
                    if (Math.abs(rawlevels[levelKey]) < Infinity) {
                        levels[levelKey] = maxLevel - rawlevels[levelKey];
                    }
                }
            }
            return levels;
        };
        LevelAssigner.prototype.getTopConstantNodes = function (nodes, nodedict, rawlevels, maxLevel) {
            var constantNodes = new Array(0);
            for (var ni = 0; ni < nodes.length; ni++) {
                var node = nodes[ni];
                if (node.iports.length === 0) {
                    var nodeKey = getNodeKey(node, nodedict);
                    var nodeLevel = rawlevels[nodeKey];
                    if (nodeLevel === maxLevel) {
                        constantNodes.push(node);
                    }
                }
            }
            return constantNodes;
        };
        LevelAssigner.prototype.getMaxLevel = function (levels) {
            var max = 0;
            for (var index in levels) {
                if (levels.hasOwnProperty(index)) {
                    if (levels[index] > max) {
                        max = levels[index];
                    }
                }
            }
            return max;
        };
        return LevelAssigner;
    })();
    GraphLib.LevelAssigner = LevelAssigner;
})(GraphLib || (GraphLib = {}));
var GraphLib;
(function (GraphLib) {
    var getNodeKey = Utils.getNodeKey;
    var FakeNode = Details.FakeNode;
    var Port = Details.Port;
    var FakeEdge = Details.FakeEdge;
    var Description = Details.Description;
    var LongEdgesSplitter = (function () {
        function LongEdgesSplitter() {
        }
        LongEdgesSplitter.prototype.split = function (graph, nodedict, levels) {
            var longEdges = this.getLongEdges(graph, nodedict, levels);
            for (var ei = 0; ei < longEdges.length; ei++) {
                var edge = longEdges[ei];
                var edgeLength = this.getEdgeLength(graph, edge, nodedict, levels);
                this.splitSingleEdge(graph, edge, nodedict, edgeLength);
            }
        };
        LongEdgesSplitter.prototype.getLongEdges = function (graph, nodedict, levels) {
            var edges = new Array(0);
            for (var ei = 0; ei < graph.edges.length; ei++) {
                var edge = graph.edges[ei];
                if (this.getEdgeLength(graph, edge, nodedict, levels) > 1) {
                    edges.push(edge);
                }
            }
            return edges;
        };
        LongEdgesSplitter.prototype.getEdgeLength = function (graph, edge, nodedict, levels) {
            var sNode = edge.sourceNode;
            var tNode = edge.targetNode;
            if (sNode !== graph && tNode !== graph) {
                // node -> node
                var sNodeKey = getNodeKey(sNode, nodedict);
                var sNodeLevel = levels[sNodeKey];
                var tNodeKey = getNodeKey(tNode, nodedict);
                var tNodeLevel = levels[tNodeKey];
                return Math.abs(sNodeLevel - tNodeLevel);
            }
            else if (tNode !== graph) {
                // port -> node
                var tNodeKey2 = getNodeKey(tNode, nodedict);
                var tNodeLevel2 = levels[tNodeKey2];
                return Math.abs(tNodeLevel2);
            }
            else if (sNode !== graph) {
                // node -> port
                var sNodeLevelVirtual = this.getMaxNodeLevel(levels) + 1;
                var sNodeKey2 = getNodeKey(sNode, nodedict);
                var sNodeLevel2 = levels[sNodeKey2];
                return Math.abs(sNodeLevelVirtual - sNodeLevel2);
            }
            else {
                // port -> port
                return this.getMaxNodeLevel(levels) + 1;
            }
        };
        LongEdgesSplitter.prototype.getMaxNodeLevel = function (levels) {
            var max = Number.NEGATIVE_INFINITY;
            for (var key in levels) {
                if (levels.hasOwnProperty(key)) {
                    if (levels[key] > max) {
                        max = levels[key];
                    }
                }
            }
            return max;
        };
        LongEdgesSplitter.prototype.splitSingleEdge = function (graph, edge, nodedict, edgeLength) {
            var sPort = edge.sourcePort;
            var tPort = edge.targetPort;
            var virtualNodesNumber = edgeLength - 1;
            var lastSourcePort = sPort;
            for (var i = 0; i < virtualNodesNumber; i++) {
                var node = this.createVirtualNodeForEdge(edge, nodedict);
                var lastTargetPort = this.getVirtualInPort(node);
                graph.nodes.push(node);
                var fakeEdge = new FakeEdge(lastSourcePort, lastTargetPort, edge);
                graph.edges.push(fakeEdge);
                lastSourcePort = this.getVirtualOuPort(node);
            }
            graph.edges.push(new FakeEdge(lastSourcePort, tPort, edge));
        };
        LongEdgesSplitter.prototype.createVirtualNodeForEdge = function (edge, nodedict) {
            var count = this.getVirtualNodesCount(nodedict);
            var name = 'vn' + (count + 1);
            var type = edge.description.type;
            var desc = new Description(type, name);
            var node = new FakeNode(desc, edge);
            nodedict[name] = node;
            var ip = new Port(node, new Description(type, name + 'ip0'));
            node.iports.push(ip);
            var op = new Port(node, new Description(type, name + 'op0'));
            node.oports.push(op);
            return node;
        };
        LongEdgesSplitter.prototype.getVirtualInPort = function (node) {
            return node.iports[0];
        };
        LongEdgesSplitter.prototype.getVirtualOuPort = function (node) {
            return node.oports[0];
        };
        LongEdgesSplitter.prototype.getVirtualNodesCount = function (nodedict) {
            var count = 0;
            for (var key in nodedict) {
                if (nodedict.hasOwnProperty(key)) {
                    var node = nodedict[key];
                    if (node instanceof FakeNode) {
                        count += 1;
                    }
                }
            }
            return count;
        };
        return LongEdgesSplitter;
    })();
    GraphLib.LongEdgesSplitter = LongEdgesSplitter;
})(GraphLib || (GraphLib = {}));
var GraphLib;
(function (GraphLib) {
    var Settings = (function () {
        function Settings(simpleNodeGeometry, hGap, vGap) {
            this.horizontalNodeGap = hGap;
            this.verticalNodeGap = vGap;
            this.simpleNodeGeometry = simpleNodeGeometry;
        }
        return Settings;
    })();
    GraphLib.Settings = Settings;
})(GraphLib || (GraphLib = {}));
//# sourceMappingURL=LayoutEngine.js.map