(function() {

    if (!window.Layout) {

        window.Layout = (function() {

            var cache = {};

            return {
                prepareGraphML: function(xml, json, fn) {
                    var fixedXml = xml.substring(38);

                    var fixedXml2 =
                    '<graphml><graph id="ir1" edgedefault="directed" width="400" height="400">' +
                      '<node id="n0" xx="50" yy="50" width="300" height="300">' +
                        '<data key="type">function</data>'+
                        '<data key="name">Main2</data>'+
                        '<graph id="n0:" edgedefault="directed">'+
                          '<port name="in0" cx="100" />' +
                          '<port name="in1" cx="200" />' +
                          '<port name="out0" cx="150" />' +
                          '<node id="n0::n0" xx="100" yy="100">' +
                            '<data key="type">binary</data>' +
                            '<data key="op">+</data>'+
                            '<port name="in0"  />'+
                            '<port name="in1"  />'+
                            '<port name="out0"  />'+
                          '</node>'+
                          '<node id="n0::n1" xx="200" yy="200">' +
                            '<data key="type">binary</data>' +
                            '<data key="op">*</data>'+
                            '<port name="in0"  />'+
                            '<port name="in1"  />'+
                            '<port name="out0"  />'+
                          '</node>'+
                          '<edge source="n0" target="n0::n0" sourceport="in0" targetport="in0" path="M 100 0 L 117 100" />' +
                          '<edge source="n0" target="n0::n1" sourceport="in0" targetport="in1" path="M 100 0 L 231 200" />' +
                          '<edge source="n0" target="n0::n1" sourceport="in1" targetport="in0" path="M 203 0 L 131 100" />' +
                          '<edge source="n0::n0" target="n0" sourceport="out0" targetport="out0" path="M 223 243 L 150 303" />' +
                          '<edge source="n0::n1" target="n0::n0" sourceport="out0" targetport="in1" path="M 123 143 L 217 200" />' +
                        '</graph>'+
                      '</node>' +
                    '</graph></graphml>';

                    var xml2 = XsltTransform.getXMLFromString(fixedXml);

                    console.log(xml2);
                    
                    this.doLayout(xml2, fn); // external service

                    //fn(xml2); // internal service
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
                        else if (child.tagName == 'port') {
                            var node = { id: g.id + ':' + child.getAttribute('name'), width: 42, height: 42 };
                            gr.nodes.push(node);
                        }
                        else if (child.tagName == 'edge') {
                            var fv = child.getAttribute('source');
                            var tv = child.getAttribute('target');
                            var fp = child.getAttribute('sourceport');
                            var tp = child.getAttribute('targetport');

                            gr.edges.push({ f: fv, t: tv, fp: fp, tp: tp });
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
                            child.setAttribute('xx', buffer.x);
                            child.setAttribute('yy', buffer.y);
                            child.setAttribute('width', buffer.width);
                            child.setAttribute('height', buffer.height);

                            for (var j = 0; j < child.childNodes.length; j++) {
                                if (child.childNodes[j].tagName == 'graph') {
                                    this.walkThroughGraphML(child.childNodes[j], data);
                                    break;
                                }
                            }
                        }
                        else if (child.tagName == 'port') {
                            var buffer = data[g.id + ':' + child.getAttribute('name')];
                            child.setAttribute('cx', buffer.x);
                            child.setAttribute('cy', buffer.y);
                            child.setAttribute('width', buffer.width);
                            child.setAttribute('height', buffer.height);
                        }
                        else if (child.tagName == 'edge') {
                            var fv = child.getAttribute('source');
                            var tv = child.getAttribute('target');
                            var fp = child.getAttribute('sourceport');
                            var tp = child.getAttribute('targetport');

                            var key = fv + '::' + fp + '-' + tv + '::' + tp;
                            child.setAttribute('path', data[key].route);
                        }
                    }
                },
                makePlainList: function(g) {
                    var result = {};
                    for (var i = 0; i < g.edges.length; i++) {
                        var edge = g.edges[i];
                        result[edge.f + '::' + edge.fp + '-' + edge.t + '::' + edge.tp] = edge;
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
                doSingleLayout: function(g, fn) {
                    this.doExternalCall(g, fn);
                },
                doExternalCall: function(g, fn) {
                    var d = JSON.stringify(g);

                    //var url = 'http://paul.iis.nsk.su/layout/Layout.svc/layout';

                    //var url = 'http://localhost:16302/Layout.svc/layout';
                    var url = 'http://paul.iis.nsk.su/layout_local/Layout.svc/layout';

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
                    g.edges.push({ id: 1, f: 1, t: 3});
                    g.edges.push({ id: 2, f: 2, t: 3});
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