(function(win, doc){
  //
  // check if d3 is avaliable
  //
  //
  if(typeof d3 == "undefined"){
    throw "Este plugin depende de d3 :/";
    return;
  }

  //
  // set the global vars
  //
  //
  var style = {
    isClient      : false,
    defaultHeight : 300, // la altura de la gráfica, en pixeles
    maxValue      : 70, // el máximo de porcentaje de la eleccion
    dataMargin    : 10, // lo que se le agrega al máximo de valores para la escala Y
    minValue      : 0, // el mínimo porcentaje de la elección
    firstHour     : 8, // la hora en la que empiezan las encuestas
    lastHour      : 20, // la hora en la que terminan las encuestas
    minSteps      : 8,
    useSeconds    : true,
    stepSize      : 60000, // tiempo en milisegundos para completar el eje x
    xRange        : [10, 90],
    margins       : { // los márgenes, en pixeles
      top    : 10,
      right  : 10,
      bottom : 20,
      left   : 30
    },
    tickSize : 6, // el tamaño del lado de los puntos
    ruleWidth : "90%", // el largo de las líneas guías horizontales
    lineClass : "line",
    tooltip  : "gf-tt-cont" // la clase del tooltip
  },

  //
  // el código de _mergeObject es de:
  // http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
  // Extiende un objeto. Se usa para hacer una copia del style con un objeto del constructor
  //
  _mergeObject = function(obj1, obj2) {
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
  },

  //
  // genera un div con el tooltip
  //
  //
  _showTooltip = function(title, content){
    var _container = document.createElement("div"),
        _title     = document.createElement("h3"),
        _content   = document.createElement("p");


    _content.innerHTML   = content;
    _title.innerHTML     = title;
    _container.className = style.tooltip;

    //_container.style.position = "absolute";
    _container.style.left = d3.event.pageX + "px";
    _container.style.top  = d3.event.pageY + "px";

    _container.appendChild(_title);
    _container.appendChild(_content);

    document.querySelector("body").appendChild(_container);
  },

  //
  // elimina el div del tooltip
  //
  //
  _removeTooltip = function(){
    var tooltips = document.querySelectorAll("." + style.tooltip);
    for(var i = 0; i<tooltips.length; i++){
      tooltips[i].parentNode.removeChild(tooltips[i]);
    }
  },

  //
  // helper que regresa un array con valores únicos dado otro array
  //
  //
  _uniq = function(coll){
    var clean = [];
    coll.forEach(function(d){
      if(clean.indexOf(d) === -1){
        clean.push(d);
      }
    });

    return clean;
  },

  _makeTimeLabel  = function(d){
    var minutes   = d.getMinutes(),
        seconds   = d.getSeconds(),
        timeLabel = d.getHours() + ":" 
          + (minutes  < 10? "0".concat(minutes) : minutes) 
          + (style.useSeconds ? ":" + (seconds < 10 ? "0".concat(seconds) : seconds) : "");
    return timeLabel;
  },

  //
  // [ CREATE THE SVG ELEMENT ]
  //
  //
  makeSVG = function(){
    if(this.el.querySelector("svg")){
      this.svg =  d3.select(this.el.querySelector("svg"));
    }
    else{
      this.svg = d3.select(this.el).append("svg")
                   .attr("width", "100%")
                   .attr("height", style.defaultHeight);
    }
  },

  //
  //
  //
  //
  makeYScale = function(){
    var max = d3.max(this.data, function(d){
      return +d.value;
    }) + style.dataMargin;

    var y = d3.scale.linear()
              .domain([style.minValue, max])
              .range([style.defaultHeight - style.margins.bottom, style.margins.top ]);
    this.yScale = y;
  },

  //
  //
  //
  //
  makeXScale = function(){
    var _points = this._data.result.map(function(t){
          return _make_time(t.timestamp);
        }, this),
        _diff = style.minSteps - _points.length;

    if(_diff > 0){
      for(var i = 1; i <= _diff; i++){
        _points.push(new Date(_points[_points.length-1].getTime() + style.stepSize));
      }
    }

    var points = _points.map(_makeTimeLabel);

    if(!points.length){
      this.xScale = null;
      return;
    }

    var x = d3.scale.ordinal()
            .domain(points)
            .rangePoints(style.xRange);
    this.xScale = x;
  },

  //
  //
  //
  //
  setXaxis = function(){

    if(!this.xScale){
      this._xAxis = null;
      this.xAxis  = null;
      return;
    }

    var that  = this,
        xAxis = this.svg.selectAll(".x-axis-label").data(this._timeExtent);
    
    xAxis.transition().attr("x", function(d){
      return that.xScale(d) + "%";
    });

    xAxis.enter()
      .append("text")
        //.attr("text-anchor", "middle")
        .attr("class", "x-axis-label")
        //.attr("fill", "black")
        .attr("y", style.defaultHeight)
        .attr("x", function(d){
          return that.xScale(d) + "%";
        })
        .text(function(d){
          return d;
        });

    xAxis.exit().remove();
  },

  //
  //
  //
  //
  setYaxis = function(){
    var yAxis = d3.svg.axis()
                  .scale(this.yScale)
                  .orient("left")
                  .ticks( Math.ceil(style.maxValue/10));
      
    this._yAxis = yAxis;
    this.yAxis  = this.svg.append("g")
                      .attr("class", "y-axis")
                      .attr("transform", "translate(" + style.margins.left + ",0)")
                      .call(this._yAxis);

    this.yAxis.selectAll("line").attr("x2", style.ruleWidth)
  },

  //
  //
  //
  //
  makeTicks = function(){
    var that  = this,
        ticks = this.svg.selectAll(".line-point").data(this.data);

    ticks.transition().attr("cx", function(d){
      return that.xScale(d.timeLabel) + "%";
    })
    .attr("cy", function(d){
      return that.yScale(d.value);
    });

    ticks.enter()
      .append("circle")
        .attr("class", "line-point")
        //.attr("width", style.tickSize)
        .attr("r", style.tickSize)
        .attr("fill", function(d){
          return d.color;
        })
        .attr("cx", function(d){
          return that.xScale(d.timeLabel) + "%";
        })
        .attr("cy", function(d){
          return that.yScale(d.value);
        })
        //.attr("transform", "translate(" + (-style.tickSize/2) + ", " + (-style.tickSize/2) + ")")
        .on("mouseover", function(d){
          var content = [];
          content.push("<span>partido:</span>" + d.party);
          content.push("<span>punto estimado:</span>" + d.value);
          if(!style.isClient){
            content.push("<span>hora:</span>" + d.timeLabel);
            content.push("<span>límite inferior:</span>" + d.lim_inf);
            content.push("<span>límite superior:</span>" + d.lim_sup);
          }           
          _showTooltip(d.title, content.join("<br>"));
        })
        .on("mouseout", function(d){
          _removeTooltip();
        });

    ticks.exit().remove();
  },

  //
  //
  //
  //
  makeLineGenerator = function(){
    var that  = this,
        width = this.svg.node().parentNode.offsetWidth,
        line  = d3.svg.line()
                 .x(function(d){
                  return that.xScale(d.timeLabel)*.01*width;
                 })
                 .y(function(d){
                  return that.yScale(d.value);
                 });
    this.lineGenerator = line;
  },

  //
  //
  //
  //
  drawLines = function(){
    var that    = this,
        lines   = [],
        _lines  = [],
        labels  = this.data.map(function(d){
          return d.party;
        }),
        _labels = _uniq(labels);

    _labels.forEach(function(label){
          lines.push(this.data.filter(function(d){
            return d.party == label;
          }));
    }, this);

    var theLines = this.svg.selectAll("." + style.lineClass).data(lines);

    theLines.transition()
        .attr("d", function(d){
          return that.lineGenerator(d);
        })
        .attr("stroke", function(d){
          return d[0].color;
        });

    theLines.enter()
      .append("path")
        .attr("class", style.lineClass)
        .attr("d", function(d){
          return that.lineGenerator(d);
        })
        //.attr("fill", "none")
        .attr("stroke", function(d){
          return d[0].color;
        });

    theLines.exit().remove();

  },

  //
  //
  //
  //
  makeTimeExtent = function(){
    var values = this.data.map(function(d){
      d.timeLabel = _makeTimeLabel(d.time);
      return d.timeLabel;
    });

    this._timeExtent = _uniq(values);

    this.timeExtent = d3.extent(this.data, function(d){
      return d.time;
    });
  },

  //
  //
  //
  //
  update = function(url){
    var that = this;
    d3.json(url, function(error, d){
      var data   = _prepare_data(d);
      that.data  = d3.merge(data);
      that._data = d;
      that.makeTimeExtent();
      that.makeXScale();
      that.setXaxis();
      that.makeTicks();
      that.drawLines();
    });
  },

  //
  //
  //
  //
  _make_time = function(str){
    var date_time = str.split(" "),
        date = date_time[0].split("-"),
        time = date_time[1].split(":");

    return new Date(+date[0], +date[1]-1, date[2], time[0], time[1], time[2]);//[date, time];
  },

  //
  //
  //
  //
  _prepare_data = function(d){
    var response = d.result,
          data   = response.map(function(collection){
            var stamp   = collection.timestamp,
                values  = collection.values,
                objects = values.map(function(obj){
                  return {
                    party   : obj.etiqueta,
                    value   : obj.punto_estimado,
                    color   : obj.color,
                    time    : _make_time(stamp),
                    _time   : stamp,
                    project : obj.proyecto,
                    title   : obj.titulo,
                    lim_inf : obj.limite_inferior,
                    lim_sup : obj.limite_superior
                  };
                });
            return objects;
          }, this);
    return data;
  },

  //
  // [ INITIALIZE FUNCTION ]
  //
  //
  initialize = function(url, obj){

    var that = this;
    style    = Object.create(_mergeObject(style, (obj || {})));
    d3.json(url, function(error, d){
      var data   = _prepare_data(d);
      that.data  = d3.merge(data);
      that._data = d;
      // create the container
      that.makeSVG();
      that.makeTimeExtent();
      that.makeYScale();
      that.setYaxis();
      that.makeXScale();
      that.setXaxis();
      that.makeTicks();
      that.makeLineGenerator();
      that.drawLines();
    });
  },

  //
  // [ THE PLUGIN CONSTRUCTOR ]
  //
  // 
  _constructor = function(el, url, obj){
    // [1] define the object
    var lines = {
      el             : el,
      makeSVG        : makeSVG, 
      initialize     : initialize,
      makeYScale     : makeYScale,
      makeXScale     : makeXScale,
      makeTimeExtent : makeTimeExtent,
      setYaxis       : setYaxis,
      setXaxis       : setXaxis,
      makeTicks      : makeTicks,
      update         : update,
      drawLines      : drawLines,
      makeLineGenerator : makeLineGenerator,
    };

    // [2] initialize the object
    lines.initialize(url, obj);

    // [3] return the object n____n
    return lines;
  }; // _constructor ends

  // add the plugin to the window element
  win.GFLines2 = _constructor;


})(window, document);