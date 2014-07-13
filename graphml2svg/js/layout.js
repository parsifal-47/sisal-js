(function() {

    if (!window.Layout) {

        window.Layout = (function() {

            var cache = {};

            return {
                prepareGraphML: function(xml, json, fn) {
                    var fixedXml = '<graphml>' + xml.substring(453);

                    var fixedXml2 =

                    '<graphml><graph id="ir1" edgedefault="directed" width="400" height="400">' +
                      '<node id="n0" xx="50" yy="50" width="300" height="300">' +
                        '<data key="type">function</data>' +
                        '<graph id="n0:" edgedefault="directed">' +
                          '<node id="n0::p0" cx="100">' +
                            '<data key="type">integer</data>' +
                            '<data key="subPort">true</data>' +
                          '</node>' +
                          '<node id="n0::p1" cx="200">' +
                            '<data key="type">integer</data>' +
                            '<data key="subPort">true</data>' +
                          '</node>' +
                          '<node id="n0::p2" cx="150">' +
                            '<data key="type">integer</data>' +
   			                '<data key="subPort">true</data>' +
   			                '<data key="output">true</data>' +
                          '</node>' +
                          '<node id="n0::n0" xx="100" yy="100">' +
       			            '<data key="type">+</data>' +
                            '<port name="left"  />' +
                            '<port name="right" />' +
                            '<port name="out" />' +
                          '</node>' +
                     	  '<node id="n0::n1" xx="200" yy="200">' +
  			                '<data key="type">*</data>' +
                            '<port name="left" />' +
                            '<port name="right" />' +
                            '<port name="out" />' +
                          '</node>' +
               		      '<edge source="n0::p0" target="n0::n0" targetport="left" path="M 100 0 L 117 100" />' +
                          '<edge source="n0::p0" target="n0::n1" targetport="right" path="M 100 0 L 231 200" />' +
                          '<edge source="n0::p1" target="n0::n1" targetport="left" path="M 203 0 L 131 100" />' +
                          '<edge source="n0::n1" target="n0::n0" sourceport="out" targetport="right" path="M 123 143 L 217 200" />' +
                          '<edge source="n0::n0" target="n0::p2" sourceport="out" path="M 223 243 L 150 303" />' +
                        '</graph>' +
                      '</node>' +
                    '</graph></graphml>';

                    var xml = XsltTransform.getXMLFromString(fixedXml);

                    this.doLayout(xml, fn);

                    console.log(xml);
                },
                getVisNode: function(nodeid) {
                    var nodeid = nodeid || 'visimg';
                    var node = document.getElementById(nodeid);
                    if (!node) {
                        var d = document.createElement('div');
                        d.id = nodeid;
                        document.body.appendChild(d);
                        node = document.getElementById(nodeid);
                    }
                    return node;
                },
                doLayout: function(gml, fn) {
                    for (var i = 0; i < gml.childNodes.length; i++) {
                        var child = gml.childNodes[i];
                        if (child.tagName == 'graphml') {
                            for (var j = 0; j < child.childNodes.length; j++) {
                                if (child.childNodes[j].tagName == 'graph') {
                                    var json = this.convertGraphMLToJson(child.childNodes[j]);
                                    this.doSingleLayout(json, function(layed) {
                                        if (true == Layout.convertJsonToGraphML(gml, layed)) {
                                            fn(gml);
                                        }
                                    });
                                    break;
                                }
                            }
                        }
                    }
                },
                convertGraphMLToJson: function(g) {
                    var gr = { nodes: [], edges: [] };

                    for (var i = 0; i < g.childNodes.length; i++) {
                        var child = g.childNodes[i];
                        if (child.tagName == 'node') {
                            var node = { id: child.id, width: 42, height: 42 };

                            for (var j = 0; j < child.childNodes.length; j++) {
                                if (child.childNodes[j].tagName == 'graph') {
                                    node.graph = this.convertGraphMLToJson(child.childNodes[j]);
                                    break;
                                }
                            }

                            gr.nodes.push(node);
                        }
                        else if (child.tagName == 'edge') {
                            gr.edges.push({ f: child.getAttribute('source'), t: child.getAttribute('target'), tp: child.getAttribute('targetport'), fp: child.getAttribute('sourceport') });
                        }
                    }

                    return gr;
                },
                convertJsonToGraphML: function (gml, layed) {
                    if (layed.DoResult.success == true) {
                        var l = JSON.parse(layed.DoResult.data);
                        var list = this.makePlainList(l);

                        for (var i = 0; i < gml.childNodes.length; i++) {
                            var child = gml.childNodes[i];
                            if (child.tagName == 'graphml') {
                                for (var j = 0; j < child.childNodes.length; j++) {
                                    if (child.childNodes[j].tagName == 'graph') {
                                        this.walkThroughGraphML(child.childNodes[j], list);
                                        break;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                    else {
                        console.error(layed.DoResult.data);
                        return false;
                    }
                },
                walkThroughGraphML: function(g, data) {
                    for (var i = 0; i < g.childNodes.length; i++) {
                        var child = g.childNodes[i];
                        if (child.tagName == 'node') {
                            var buffer = data[child.id];
                            if (this.isNode(child.id) == false) {
                                child.setAttribute('cx', buffer.x);
                                child.setAttribute('cy', buffer.y);
                                child.setAttribute('width', buffer.width);
                                child.setAttribute('height', buffer.height);
                            }
                            else {
                                child.setAttribute('xx', buffer.x);
                                child.setAttribute('yy', buffer.y);
                                child.setAttribute('width', buffer.width);
                                child.setAttribute('height', buffer.height);
                            }

                            for (var j = 0; j < child.childNodes.length; j++) {
                                if (child.childNodes[j].tagName == 'graph') {
                                    this.walkThroughGraphML(child.childNodes[j], data);
                                    break;
                                }
                            }
                        }
                        else if (child.tagName == 'edge') {
                            var key = child.getAttribute('source') + '-' + child.getAttribute('target');
                            child.setAttribute('path', data[key].route);
                        }
                    }
                },
                makePlainList: function(g) {
                    var result = {};
                    for (var i = 0; i < g.edges.length; i++) {
                        var edge = g.edges[i];
                        result[edge.f + '-' + edge.t] = edge;
                    }
                    for (var i = 0; i < g.nodes.length; i++) {
                        var node = g.nodes[i];
                        if (node.graph) {
                            var r = this.makePlainList(node.graph);
                            for (var p in r) {
                                result[p] = r[p];
                            }
                        }
                        result[node.id] = node;
                    }
                    return result;
                },
                isNode: function(id) {
                    return id.indexOf('::p') == -1;
                },
                doSingleLayout: function(g, fn) {
                    this.doExternalCall(g, fn);
                },
                doExternalCall: function(g, fn) {
                    var d = JSON.stringify(g);

                    var url = 'http://paul.iis.nsk.su/layout/Layout.svc/layout';
                    //var url = 'http://localhost:16302/Layout.svc/layout';

                    cache.fn = fn;

                    $.ajax({
                        type: 'GET',
                        url: url,
                        data: { j: d },
                        dataType: 'jsonp',
                        jsonpCallback: 'Layout.bufferFn',
                        success: function(result) {
                            var gr = JSON.parse(result.DoResult.data);
                            alert('success' + JSON.stringify(gr));
                        },
                        error: function(result) {
                            if (result.status != 200) {
                                alert('error' + JSON.stringify(result));
                            }
                        }
                    });
                },
                hardtest: function() {
                    var g = {};

                    g.nodes = [];
                    g.nodes.push({ id: 1, width: 30, height: 30 });
                    g.nodes.push({ id: 2, width: 30, height: 30 });
                    g.nodes.push({ id: 3, width: 30, height: 30 });
                    g.nodes.push({ id: 4, width: 30, height: 30 });
                    g.nodes.push({ id: 5, width: 30, height: 30 });

                    g.edges = [];
                    g.edges.push({ id: 1, f: 1, t: 3 });
                    g.edges.push({ id: 2, f: 2, t: 3 });
                    g.edges.push({ id: 3, f: 3, t: 4 });
                    g.edges.push({ id: 4, f: 1, t: 4 });
                    g.edges.push({ id: 5, f: 4, t: 5 });

                    this.doExternalCall(g, function(a) {
                        alert('callback ' + JSON.stringify(a));
                    });
                },
                bufferFn: function(a) {
                    if (typeof cache.fn == 'function') {
                        cache.fn(a);
                    }
                }
            }
        })();
    }
})();