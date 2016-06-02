// 
// app : CRAPPY PLUGIN v1
// description : draw some bars
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
        isClient : false,
        barsA    : {
          height : 30, // the height of the bar in px
          margin : 15, // the top and bottom bar margin
          left   : 27, // the left margin, in %
          right  : 2,  // the right margin, in %
          width  : 40, // the bar width, in %
          min    : 1,  // the min bar width, in %
          xlabel : 75, // the position of the right text, in %
          labelSize : "10em" // the space for the labels
        }
      },
      // the scale for the bar width
      scaleX = d3.scale.linear().domain([0, 100]).range([style.barsA.min, style.barsA.width]);

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
    console.log(this);
    this.svg.attr("height", this.data.length * (style.barsA.height + (style.barsA.margin * 2)) );
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
      .attr("height", style.barsA.height)
      .attr("x", style.barsA.left + "%")
      .attr("y", function(d, i){
        return (i * (style.barsA.height + style.barsA.margin)) + style.barsA.margin;
      })
      .attr("fill", function(d){
        return d.color;
      });

    d.exit().remove();
  };

  //
  // [ MAKE LINES ]
  //
  //
  var makeLines = function(){
    this.lines = this.svg.selectAll(".divisor");

    var d = this.lines.data(this.data);
    d.enter()
      .append("line")
      .attr("class", "divisor")
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("x1", function(d){
        return style.barsA.left + "%";
      })
      .attr("x2", "100%")
      .attr("y1", function(d, i){
        return ((i+1) * (style.barsA.height + style.barsA.margin)) + (style.barsA.margin/2);
      })
      .attr("y2", function(d, i){
        return ((i+1) * (style.barsA.height + style.barsA.margin)) + (style.barsA.margin/2);
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
        .attr("x", style.barsA.labelSize)
        .attr("y", function(d, i){
          return (i * (style.barsA.height + style.barsA.margin)) + (style.barsA.height/2) + style.barsA.margin;
        })
        .attr("class", "label")
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
        .attr("x", style.barsA.xlabel + "%")
        .attr("y", function(d, i){
          return (i * (style.barsA.height + style.barsA.margin)) + (style.barsA.height/2) + style.barsA.margin;
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
        return scaleX(d.val) + style.barsA.left + style.barsA.right + "%";
      })
      .text(function(d){
        return d.val;
      });

    d.enter()
      .append("text")
        .attr("x", function(d){
          return scaleX(d.val) + style.barsA.left + style.barsA.right + "%";
        })
        .attr("y", function(d, i){
          return (i * (style.barsA.height + style.barsA.margin)) + (style.barsA.height/2) + style.barsA.margin;
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
          id    : "mx" + item.id_resultado,
          party : item.etiqueta,
          val   : +item.punto_estimado,
          color : item.color, 
          stamp : item.descripcion,
          pos   : item.orden
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
      this.makeRects();
      this.addLabels();
      this.setSVGHeight();
      this.addValues();
      this.addLabelsB();
      this.makeLines();
    }
    else{
      // si recibe un url desde el que debe obtener los datos
      var that = this;
      d3.json(data, function(error, d){
        var _data = that.cleanData(d);
        that.data = _data;
        that.makeRects();
        that.addLabels();
        that.setSVGHeight();
        that.addValues();
        that.addLabelsB();
        that.makeLines();
      });
    }
  };

  //
  // [ THE PLUGIN CONSTRUCTOR ]
  //
  // 
  var _constructor = function(el, url){
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
      makeLines    : makeLines,
      cleanData    : cleanData,
      initialize   : function(){
        var that = this;
        d3.json(url, function(error, d){
          // prepare the response
          var _data = that.cleanData(d);
          //that.data = _data;

          // create the container
          that.makeSVG();

          // append the first line
          that.svg.append("line")
           .attr("stroke", "grey")
           .attr("stroke-width", 1)
           .attr("x1", function(d){
             return style.barsA.left + "%";
           })
           .attr("x2", "100%")
           .attr("y1", style.barsA.margin / 2)
           .attr("y2", style.barsA.margin / 2);

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
  win.GFBars = _constructor;

})(window, document);