(function () {

    if (!window.Layout) {

        window.Layout = (function () {

            return {
                prepareGraphML: function(xml, json, fn) {
                    var fixedXml = '<graphml>' + xml.substring(453);

                    fixedXml =

                    '<graphml><graph id="ir1" edgedefault="directed" width="400" height="400">' +
                      '<node id="n0" xx="50" yy="50" width="300" heigth="300">' +      
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
                          '<edge source="n0::n0" target="p2" sourceport="out" path="M 223 243 L 150 303" />' +
                        '</graph>' +
                      '</node>' +
                    '</graph></graphml>';

                    var xml = XsltTransform.getXMLFromString(fixedXml);

                    this.doLayout(xml);

                    fn(xml);

                    return xml;
                },
                getVisNode: function () {
                    var node = document.getElementById("visimg");
                    if (!node) {
                        var d = document.createElement('div');
                        d.id = 'visimg';
                        document.body.appendChild(d);
                        node = document.getElementById('visimg');
                    }
                    return node;
                },
                doLayout: function (gml) {
                    for (var i = 0; i < gml.children.length; i++) {
                        var child = gml.children[i];
                        if (child.tagName == 'graphml') {
                            for (var j = 0 ; j < child.children.length; j++) {
                                if (child.children[j].tagName == 'graph') {
                                    this.layoutGraph(child.children[j]);
                                }
                            }
                        }
                    }
                },
                layoutGraph: function (g) {
                    var gr = { nodes: [], edges: [] };

                    for (var i = 0; i < g.children.length; i++) {
                        var child = g.children[i];
                        if (child.tagName == 'node') {
                            for (var j = 0; j < child.children.length; j++) {
                                if (child.children[j].tagName == 'graph') {
                                    this.layoutGraph(child.children[j]);

                                    var size = this.getGraphSize(child.children[j]);
                                    gr.nodes.push({ id: child.id, size: size });
                                    break;
                                }
                            }
                        }
                        else if (child.tagName == 'edge') {
                            gr.edges.push({ from: child.source, to: child.target });
                        }
                    }

                    this.doSingleLayout(gr);


                },
                getGraphSize: function (g) {
                    var mostRight = 0;
                    var mostDown = 0;

                    for (var i = 0; i < g.children.length; i++) {
                        var child = g.children[i];
                        if (child.tagName == 'node') {
                            if (child.xx && mostRight < child.xx + this.getWidth(child)) {
                                mostRight = child.xx + this.getWidth(child);
                            }
                            if (child.yy && mostDown < child.yy + this.getHeight(child)) {
                                mostDown = child.yy + this.getHeight(child);
                            }
                        }
                    }

                    return { width: 42 * 2 + mostRight, height: 42 * 2 + mostDown };
                },
                getNodeWidth: function (n) {
                    return n.width || 42;
                },
                getNodeHeight: function (n) {
                    return n.height || 42;
                },
                doSingleLayout: function (g) {

                },
                hardtest: function () {
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

                    var d = JSON.stringify(g);

                    var url = 'http://paul.iis.nsk.su/layout/Layout.svc/layout';
                    //var url = 'http://localhost:16302/Layout.svc/layout';

                    $.ajax({
                        type: 'GET',
                        url: url,
                        data: { j: d },
                        dataType: 'jsonp',
                        jsonpCallback: 'Layout.emptyFn',
                        success: function (result) {
                            var gr = JSON.parse(result.DoResult.data);
                            alert('success' + JSON.stringify(gr));
                        },
                        error: function (result) {
                            if (result.status != 200) {
                                alert('error' + JSON.stringify(result));
                            }
                        }
                    });
                },
                emptyFn: function (a) {
                    alert('callback' + JSON.stringify(a));
                }
            }
        })();
    }
})();