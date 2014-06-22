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
                          '<node id="n0::p0" cx="100" cy="3">' +	
                            '<data key="type">integer</data>' +			
                            '<data key="subPort">true</data>' +		
                          '</node>' +		
                          '<node id="n0::p1" cx="200" cy="3">' +			
                            '<data key="type">integer</data>' +			
                            '<data key="subPort">true</data>' +
                          '</node>' +		
                          '<node id="n0::p2" cx="150" cy="303">' +
                            '<data key="type">integer</data>' +
   			                '<data key="subPort">true</data>' +
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
               		      '<edge source="n0::p0" target="n0::n0" targetport="left" path="M 100 0 L 114 100" />' +
                          '<edge source="n0::p0" target="n0::n1" targetport="right" path="M 100 0 L 228 200" />' +		
                          '<edge source="n0::p1" target="n0::n1" targetport="left" path="M 200 0 L 128 100" />' +		
                          '<edge source="n0::n1" target="n0::n0" sourceport="out" targetport="right" path="M 120 140 L 214 200" />' +		
                          '<edge source="n0::n0" target="p2" sourceport="out" path="M 220 240 L 150 300" />' +
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