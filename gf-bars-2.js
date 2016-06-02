// 
// app : CRAPPY PLUGIN v1
// description : draw some bars with other style
// author : @elcoruco
// url : http://gobiernofacil.com
//

(function(win,doc){
  // check if d3 is avaliable
  if(typeof d3 == "undefined"){
    throw "Este plugin depende de d3 :/";
    return;
  }

  //
  // set the global vars
  //
  //
  var style =  {
        dataDomain : [0, 100],
        isClient   : false,
        height     : 30, // the height of the bar in px
        margin     : 15, // the top and bottom bar margin
        left       : 27, // the left margin, in %
        right      : 2,  // the right margin, in %
        width      : 70, // the bar width, in %
        min        : .1,  // the min bar width, in %
        xlabel     : 75, // the position of the right text, in %
        labelSize  : "10em", // the space for the labels
        labelClass : "label", // the class for the party names
        tooltip    : "gf-tt-cont", // the class for the tooltip
        verticalGuideClass : "verticalGuide", // la clase de las guías verticales
        verticalGuideLabelClass : "verticalGuideLabel" // la clase de las tiquetas de las guías verticales
      },
      // the scale for the bar width
      scaleX = d3.scale.linear().domain(style.dataDomain).range([style.min, style.width]);

  // el código de _mergeObject es de:
  // http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
  var _mergeObject = function(obj1, obj2) {
    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if ( obj2[p].constructor==Object ) {
          obj1[p] = _mergeObject(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];
      }
    }
    return obj1;
  };

  var _showTooltip = function(title, content){
    var _container = document.createElement("div"),
        _title     = document.createElement("h3"),
        _content   = document.createElement("p");


    _content.innerHTML   = content;
    _title.innerHTML     = title;
    _container.className = style.tooltip;

    _container.style.position = "absolute";
    _container.style.left = d3.event.pageX + "px";
    _container.style.top  = d3.event.pageY + "px";

    _container.appendChild(_title);
    _container.appendChild(_content);

    document.querySelector("body").appendChild(_container);
  };

  var _removeTooltip = function(){
    var tooltips = document.querySelectorAll("." + style.tooltip);
    for(var i = 0; i<tooltips.length; i++){
      tooltips[i].parentNode.removeChild(tooltips[i]);
    }
  };
  //
  // [ CREATE THE SVG ELEMENT ]
  //
  //
  var makeSVG = function(){
    if(this.el.querySelector("svg")){
      this.svg =  d3.select(this.el.querySelector("svg"));
    }
    else{
      this.svg = d3.select(this.el).append("svg");
    }

    this.svg.attr("width", "100%");
    this.setSVGHeight();
  };

  //
  // [ SET SVG HEIGHT ]
  //
  //
  var setSVGHeight = function(){
    this.svg.attr("height", this.data.length * (style.height + (style.margin * 2)) );
  };

  //
  // [ MAKE RECTS ]
  //
  //
  var makeRects = function(){

    this.rects = this.svg.selectAll("rect");

    var d = this.rects.data(this.data);
    d.transition().attr("width", function(d){
        return scaleX(d.val) + "%";
      })
      .attr("fill", function(d){
        return d.color;
      });

    d.enter()
      .append("rect")
      .attr("width", function(d){
        return scaleX(d.val) + "%";
      })
      .attr("height", style.height)
      .attr("x", style.left + "%")
      .attr("y", function(d, i){
        return (i * (style.height + style.margin)) + style.margin;
      })
      .attr("fill", function(d){
        return d.color;
      })
      .on("mouseover", function(d){
        
          var content = [],
              st      = d.timestamp.split(" ")[1].split(":");
          content.push("<span>partido:</span>" + d.party);
          content.push("<span>punto estimado:</span>" + d.val);
          if(!style.isClient){
            content.push("<span>límite inferior:</span>" + d.limite_inf);
            content.push("<span>límite superior:</span>" + d.limite_sup);
            content.push("<span>hora:</span>" + st[0] + ":" + st[1]);
          }
          _showTooltip(d.title, content.join("<br>"));
          
      })
      .on("mouseout", function(d){
          _removeTooltip();
      });

    d.exit().remove();
  };

  //
  // [ MAKE VERTICAL GUIDES ]
  //
  //
  var makeVerticalGuides = function(){
    this.verticalGuides = this.svg.selectAll("." +  style.verticalGuideClass);
    var points = scaleX.ticks();
    var height = this.data.length * (style.height + (style.margin * 1.1));
    var d = this.verticalGuides.data(points);
    d.enter()
      .append("line")
      .attr("class", style.verticalGuideClass)
      //.attr("stroke", "grey")
      //.attr("stroke-width", 1)
      .attr("x1", function(d){
        return (style.left + scaleX(d)) + "%";
      })
      .attr("x2", function(d){
        return (style.left + scaleX(d)) + "%";
      })
      .attr("y1", "0")
      .attr("y2", height);

    this.verticalGuidesLabels = this.svg.selectAll("." + style.verticalGuideLabelClass);
    var d = this.verticalGuidesLabels.data(points);

    d.enter()
      .append("text")
        .attr("x", function(d){
          return (style.left + scaleX(d)) + "%";
        })
        .attr("y", height + 10)
        .attr("class", style.verticalGuideLabelClass)
        //.attr("text-anchor", "middle")
        //.attr("alignment-baseline", "middle")
        .text(function(d){
          return d;
        });
  };

  //
  // [ ADD LABELS / PARTY NAME ]
  //
  //
  var addLabels = function(){
    this.labels = this.svg.selectAll(".label");
    var d = this.labels.data(this.data);

    d.text(function(d){
        return d.party;
      });
    
    d.enter()
      .append("text")
        .attr("x", style.labelSize)
        .attr("y", function(d, i){
          return (i * (style.height + style.margin)) + (style.height/2) + style.margin;
        })
        .attr("class", style.labelClass)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(function(d){
          return d.party;
        });

    d.exit().remove();
  };

  //
  // [ ADD B LABELS  / THE RIGHT STUFF ]
  //
  //
  var addLabelsB = function(){
    this.labelsB = this.svg.selectAll(".labelb");
    var d = this.labelsB.data(this.data);
    
    d.enter()
      .append("text")
        .attr("x", style.xlabel + "%")
        .attr("y", function(d, i){
          return (i * (style.height + style.margin)) + (style.height/2) + style.margin;
        })
        .attr("class", "labelb")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(function(d){
          return d.stamp;
        });

    d.exit().remove();
  };

  //
  // [ ADD PERCENTAGES ]
  //
  //
  var addValues = function(){
    this.values = this.svg.selectAll(".value");
    var d = this.values.data(this.data);

    d.transition()
      .attr("x", function(d){
        return scaleX(d.val) + style.left + style.right + "%";
      })
      .text(function(d){
        return d.val;
      });

    d.enter()
      .append("text")
        .attr("x", function(d){
          return scaleX(d.val) + style.left + style.right + "%";
        })
        .attr("y", function(d, i){
          return (i * (style.height + style.margin)) + (style.height/2) + style.margin;
        })
        .attr("class", "value")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(function(d){
          return d.val;
        });

    d.exit().remove();
  };

  //
  //
  //
  //
  var cleanData = function(d){
    if(d.result){
      var response = d.result.map(function(item){
        return {
          id         : "mx" + item.id_resultado,
          party      : item.etiqueta,
          val        : +item.punto_estimado,
          color      : item.color, 
          stamp      : item.descripcion,
          pos        : item.orden,
          estimador  : item.estimador,
          estrato    : item.estrato,
          limite_inf : item.limite_inferior,
          limite_sup : item.limite_superior,
          title      : item.titulo,
          timestamp  : item.timestamp
        }
      });
      response.sort(function(a,b){
        return +a.pos - +b.pos;
      });

      return response;
    }
    else{
      return [];
    }
  };

  //
  // [ UPDATE DATA ]
  //
  //
  var update = function(data){
    // si recibe los datos listos para usarse
    if(Array.isArray(data)){
      this.data = data;
      this.makeVerticalGuides();
      this.makeRects();
      this.addLabels();
      this.setSVGHeight();
      this.addValues();
      this.addLabelsB();
    }
    else{
      // si recibe un url desde el que debe obtener los datos
      var that = this;
      d3.json(data, function(error, d){
        var _data = that.cleanData(d);
        that.data = _data;
        that.makeVerticalGuides();
        that.makeRects();
        that.addLabels();
        that.setSVGHeight();
        that.addValues();
        that.addLabelsB();
      });
    }
  };

  //
  // [ THE PLUGIN CONSTRUCTOR ]
  //
  // 
  var _constructor = function(el, url, obj){
    // [1] define the object
    var bars = {
      el           : el,
      data         : [],
      makeSVG      : makeSVG, 
      makeRects    : makeRects,
      addLabels    : addLabels,
      update       : update,
      addValues    : addValues,
      setSVGHeight : setSVGHeight,
      addLabelsB   : addLabelsB,
      cleanData    : cleanData,
      makeVerticalGuides : makeVerticalGuides,
      initialize   : function(){
        var that   = this;
        style      = Object.create(_mergeObject(style, (obj || {})));
        
        d3.json(url, function(error, d){
          // prepare the response
          var _data = that.cleanData(d);
          //that.data = _data;

          // create the container
          that.makeSVG();

          // make it happen
          that.update(_data);
        });
      }
    };

    // [2] initialize the object
    bars.initialize();

    // [3] return the object n____n
    return bars;
  };

  // add the plugin to the window element
  win.GFBars2 = _constructor;

})(window, document);