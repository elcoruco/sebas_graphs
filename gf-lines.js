(function(win, doc){
  // check if d3 is avaliable
  if(typeof d3 == "undefined"){
    throw "Este plugin depende de d3 :/";
    return;
  }

  //
  // set the global vars
  //
  //
  var style = {
    defaultHeight : 300,
    maxValue      : 70,
    firstHour : 8,
    lastHour : 20,
    margins : {
      top    : 10,
      right  : 10,
      bottom : 20,
      left   : 30
    }
  },

  _uniq = function(coll){
    var clean = [];
    coll.forEach(function(d){
      if(clean.indexOf(d) === -1){
        clean.push(d);
      }
    });

    return clean;
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
    var y = d3.scale.linear()
              .domain([0, style.maxValue])
              .range([style.defaultHeight - style.margins.bottom, style.margins.top ]);
    this.yScale = y;
  },

  //
  //
  //
  //
  makeXScale = function(){
    if(!this.data.length){
      this.xScale = null;
      return;
    }
    var x = d3.scale.ordinal()
            .domain(this._timeExtent)
            .rangePoints([10, 90]);
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
        .attr("text-anchor", "middle")
        .attr("class", "x-axis-label")
        .attr("fill", "black")
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

    this.yAxis.selectAll("line").attr("x2", "90%")
  },

  //
  //
  //
  //
  makeTicks = function(){
    var that  = this,
        ticks = this.svg.selectAll(".line-point").data(this.data);

    ticks.transition().attr("x", function(d){
      return that.xScale(d.timeLabel) + "%";
    })
    .attr("y", function(d){
      return that.yScale(d.value);
    });

    ticks.enter()
      .append("rect")
        .attr("class", "line-point")
        .attr("width", 7)
        .attr("height", 6)
        .attr("fill", function(d){
          return d.color;
        })
        .attr("x", function(d){
          return that.xScale(d.timeLabel) + "%";
        })
        .attr("y", function(d){
          return that.yScale(d.value);
        });

    ticks.exit().remove();
  },
  //
  //
  //
  //
  makeTimeExtent = function(){
    var values = this.data.map(function(d){
      var minutes = d.time.getMinutes();
      d.timeLabel = d.time.getHours() + ":" + (minutes  < 10? "0".concat(minutes) : minutes);
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
      var data  = _prepare_data(d);
      that.data = d3.merge(data);
      that.makeTimeExtent();
      that.makeXScale();
      that.setXaxis();
      that.makeTicks();
    });
  },

  _make_time = function(str){
    var date_time = str.split(" "),
        date = date_time[0].split("-"),
        time = date_time[1].split(":");

    return new Date(+date[0], +date[1]-1, date[2], time[0], time[1], time[2]);//[date, time];
  },

  _prepare_data = function(d){
    var response = d.result,
          data   = response.map(function(collection){
            var stamp   = collection.timestamp,
                values  = collection.values,
                objects = values.map(function(obj){
                  return {
                    party : obj.etiqueta,
                    value : obj.punto_estimado,
                    color : obj.color,
                    time  : _make_time(stamp),
                    _time : stamp
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
  initialize = function(url){

    var that = this;
    d3.json(url, function(error, d){
      var data  = _prepare_data(d);
      that.data = d3.merge(data);
      // create the container
      that.makeSVG();
      that.makeTimeExtent();
      that.makeYScale();
      that.setYaxis();
      that.makeXScale();
      that.setXaxis();
      that.makeTicks();
    });
  },

  //
  // [ THE PLUGIN CONSTRUCTOR ]
  //
  // 
  _constructor = function(el, url){
    // [1] define the object
    var lines = {
      el             : el,
      //data           : d3.merge(data),
      makeSVG        : makeSVG, 
      initialize     : initialize,
      makeYScale     : makeYScale,
      makeXScale     : makeXScale,
      makeTimeExtent : makeTimeExtent,
      setYaxis       : setYaxis,
      setXaxis       : setXaxis,
      makeTicks      : makeTicks,
      update         : update
    };

    // [2] initialize the object
    lines.initialize(url);

    // [3] return the object n____n
    return lines;
  }; // _constructor ends

  // add the plugin to the window element
  win.GFLines = _constructor;


})(window, document);