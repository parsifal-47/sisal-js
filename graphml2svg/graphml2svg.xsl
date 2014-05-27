<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                >
  <xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="no"/>

  <xsl:template match="graphml">
    <svg width="400" height="400">
      <xsl:call-template name="definitions" />
      <xsl:for-each select="./graph">
        <xsl:if test="position()=1">
          <svg x="0" y="0" class="ir1">
            <xsl:attribute name="id">
              <xsl:value-of select="@id"/>
            </xsl:attribute>
            <rect x="0" y="0" width="400" height="400" class="ir1" />
            <xsl:call-template name="perform_graph">
              <xsl:with-param name="pGraph" select="." />
            </xsl:call-template>
          </svg>
        </xsl:if>
      </xsl:for-each>
    </svg>
  </xsl:template>

  <xsl:template name="perform_graph">
    <xsl:param name="pGraph" />
    <xsl:for-each select="$pGraph/node">
      <xsl:call-template name="perform_node">
        <xsl:with-param name="vertex" select="."/>
      </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="$pGraph/edge">
      <xsl:call-template name="perform_edge">
        <xsl:with-param name="link" select="."/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="perform_node">
    <xsl:param name="vertex" />
    <xsl:choose>
      <xsl:when test="$vertex/data/@key = 'subPort'">
        <circle r="2" class="subport">
          <xsl:attribute name="id">
            <xsl:value-of select="@id"/>
          </xsl:attribute>
          <xsl:attribute name="cx" />
          <xsl:attribute name="cy" />
        </circle>
      </xsl:when>
      <xsl:otherwise>
        <svg>
          <xsl:attribute name="id">
            <xsl:value-of select="@id"/>
          </xsl:attribute>
          <xsl:attribute name="class">
            <xsl:text>vertex </xsl:text>
            <xsl:choose>
              <xsl:when test="$vertex/graph">
                <xsl:text>expanded</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                <xsl:text>collapsed</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <rect x="3" y="3" class="vertex-bg" height="40" width="40" />
          <xsl:for-each select="$vertex/port">
            <circle cx="33" cy="3" r="2" class="port" />
          </xsl:for-each>
          <xsl:if test="$vertex/graph">
            <xsl:call-template name="perform_graph">
              <xsl:with-param name="pGraph" select="$vertex/graph" />
              <xsl:with-param name="isRoot" select="'false'"></xsl:with-param>
            </xsl:call-template>
          </xsl:if>
        </svg>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="perform_edge">
    <xsl:param name="link" />
    <xsl:for-each select="$link">
      <xsl:element name="path">
        <xsl:attribute name="class">
          <xsl:text>edge</xsl:text>
        </xsl:attribute>
        <xsl:attribute name="d">
          <xsl:text>M 10 10 l 50 50 l 100 0</xsl:text>
        </xsl:attribute>
      </xsl:element>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="definitions">
    <defs>
      <style type="text/css">
        <![CDATA[
	      svg.ir1 > rect.ir1
              {
	        stroke: green; 
	        fill: #AAAAAA;
	        stroke-width: 5px;  
	      }

	      svg.vertex.collapsed > rect.vertex-bg
              {
	        stroke:#ccaabb;
                fill: #ccdd44; 
                stroke-width:3px;
	      }

	      svg.vertex.expanded > rect.vertex-bg
              {
                stroke:brown;
                fill: #ddcc44; 
                stroke-width:3px;
              }

	      svg.vertex.collapsed svg.vertex,
	      svg.vertex.collapsed circle.subport,
	      svg.vertex.collapsed path.edge  
              {
                display: none;
	      }

 	      circle.port,
	      circle.subport	         
	      {
                stroke: black; 
	        fill: black;
	        stroke-width: 2;
	      }

              path.edge
	      {
	        fill: none;
	        fill-rule: evenodd;
	        stroke: black;
	        stroke-width: 1px;
	        stroke-linecap: butt;
	        stroke-linejoin: miter;
	        stroke-opacity: 1;
	        marker-end:url(#arrow);
	      }
        
              text.subportdesc
	      {
	        fill: black;
                font-size: 18px;
	      }
              
              text.desc
              {
	        fill: black;
                font-size: 18;
	        font-weight: bold;
                text-anchor: middle;
	      }
      ]]>
      </style>

      <marker id="arrow" viewBox="0 0 40 10" refX="40" refY="10" markerUnits="strokeWidth" markerWidth="10" markerHeight="10" stroke="black" stroke-width="4" orient="auto">
        <path d="M 0 0 L 40 10 L 0 20 z"/>
      </marker>

    </defs>

  </xsl:template>

</xsl:stylesheet>