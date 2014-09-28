(function() {

    if (!window.Layout) {

        window.Layout = (function() {

            var cache = {};

            return {
                prepareGraphML: function(xml, json, fn) {
                    var xml2 = XsltTransform.getXMLFromString(xml);

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
                                    this.performJsonGraph(json, function(layed) {
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
                    if (layed.DoResult && layed.DoResult.success == true || layed.success) {
                        var l = layed.DoResult ? JSON.parse(layed.DoResult.data) : JSON.parse(layed.data);
                        var list = this.convertHierarchyToList(l);

                        for (var i = 0; i < gml.childNodes.length; i++) {
                            var child = gml.childNodes[i];
                            if (child.tagName == 'graphml') {
                                for (var j = 0; j < child.childNodes.length; j++) {
                                    if (child.childNodes[j].tagName == 'graph') {
                                        this.applyCoordsToGraphML(child.childNodes[j], list);
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
                applyCoordsToGraphML: function(g, data) {
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
                                    this.applyCoordsToGraphML(child.childNodes[j], data);
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
                convertHierarchyToList: function(g) {
                    var result = {};
                    for (var i = 0; i < g.edges.length; i++) {
                        var edge = g.edges[i];
                        result[edge.f + '::' + edge.fp + '-' + edge.t + '::' + edge.tp] = edge;
                    }
                    for (var i = 0; i < g.nodes.length; i++) {
                        var node = g.nodes[i];
                        if (node.graph) {
                            var r = this.convertHierarchyToList(node.graph);
                            for (var p in r) {
                                result[p] = r[p];
                            }
                        }
                        result[node.id] = node;
                    }
                    return result;
                },
                performJsonGraph: function(g, fn) {
                    this.doExternalCall(g, fn);
                },
                doExternalCall: function (g, fn) {
                    cache.fn = fn;
                    var d = JSON.stringify(g);

                    var url = 'http://paul.iis.nsk.su/layout/GraphLayout.ashx';

                    //var url = 'http://localhost:16302/GraphLayout.ashx';
                    //var url = 'http://paul.iis.nsk.su/layout_local/Layout.svc/layout';

                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: { j: d },
                        success: function (result) {
                            if (result.success == true) {
                                Layout.bufferFn(result);
                            }
                            else {
                                console.error(result.data);
                            }
                        },
                        error: function (result) {
                            console.error(result.data);
                        }
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