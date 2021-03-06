(function() {

    if (!window.XsltTransform) {

        window.XsltTransform = (function() {
            return {
                transformXslt: function(source, style, options) {
                    if (!source || !style) {
                        alert('null param');
                        return;
                    }

                    if (window.ActiveXObject) {  
                        /*return source.transformNode(style);*/
                        var xslt = new ActiveXObject("Msxml2.XSLTemplate.6.0");
                        var xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
                        var xslproc;
                        xsldoc.async = false;
                        xsldoc.load(style);
                        if (xsldoc.parseError.errorCode != 0) {
                            var myErr = xsldoc.parseError;
                            alert("You have error " + myErr.reason);
                        } else {
                            xslt.stylesheet = xsldoc;
                            var xmldoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
                            xmldoc.async = false;
                            xmldoc.load(source);
                            if (xmldoc.parseError.errorCode != 0) {
                                var myErr = xmldoc.parseError;
                                alert("You have error " + myErr.reason);
                            } else {
                                xslproc = xslt.createProcessor();
                                xslproc.input = xmldoc;
                                for (var p in options) {
                                    xslproc.addParameter(p, options[p]);
                                }
                                xslproc.transform();
                                return xslproc.output;
                            }
                        }
                    }
                    else if (window.XSLTProcessor) {
                        var xsltProcessor = new XSLTProcessor();
                        for(var p in options){
                            xsltProcessor.setParameter(null, p, options[p]);
                        }
                        xsltProcessor.importStylesheet(style);
                        var resultDocument = xsltProcessor.transformToDocument(source);
                        var xmls = new XMLSerializer();
                        return xmls.serializeToString(resultDocument);
                    }
                    else {
                        alert("XML-transform not supported");
                        return null;
                    }
                },

                getXMLFromString: function(s) {
                    s = s.replace(new RegExp('[\n\r\t]+','g'),'').replace(new RegExp('>\\s+<','g'),'><');

                    var xml;
                    if (window.ActiveXObject) {
                        var xml;
                        xml = new ActiveXObject("Microsoft.XMLDOM");
                        xml.async = false;
                        xml.loadXML(s);
                        return xml;
                    }
                    else if (window.DOMParser) {
                        var parser = new DOMParser();
                        var res = parser.parseFromString(s, 'text/xml');
                        return res;
                    }
                    else {
                        alert("XML load not supported");
                        return null;
                    }
                },

                getXMLFromUrl: function(url) {
                    var xhttp;
                    if (window.ActiveXObject) {
                        xhttp = new ActiveXObject("Msxml2.XMLHTTP.3.0");
                    }
                    else {
                        xhttp = new XMLHttpRequest();
                    }
                    xhttp.open("GET", url, false);
                    xhttp.send("");
                    var res = this.getXMLFromString(xhttp.responseText);
                    return res;
                },

                xml2str: function(xmlNode) {
                    try {
                        // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
                        return (new XMLSerializer()).serializeToString(xmlNode);
                    }
                    catch (e) {
                        try {
                            // Internet Explorer.
                            return xmlNode.xml;
                        }
                        catch (e) {
                            //Other browsers without XML Serializer
                            alert('Xmlserializer not supported');
                        }
                    }
                    return false;
                }
            }
        })();
    }
})();