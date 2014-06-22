(function() {

    if (!window.Layout) {

        window.Layout = (function() {
            return {
                prepareGraphML: function(xml, fn) {
                    var fixedXml = '<graphml>' + xml.substring(453);
                    
                    fixedXml = 
                      
                    '<graphml><graph id="ir1" edgedefault="directed" width="400" height="400">' +
                      '<node id="n0" xx="10" yy="10" width="300" heigth="300">' +      
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
                    fn(xml);
                },
                getVisNode: function(){
                    var node = document.getElementById("visimg");
                    if(!node) {
                        var d = document.createElement('div');
                        d.id = 'visimg';
                        document.body.appendChild(d);
                        node = document.getElementById('visimg');
                    }
                    return node;
                }
            }
        })();
    }
})();