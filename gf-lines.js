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
      left   : 20
    }
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
     x = d3.time.scale()
            .domain(this.timeExtent)
            .range([Margins.left, Margins.width - Margins.left - Margins.right]);
  },

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
  makeTimeExtent = function(){
    this.timeExtent = d3.extent(this.data, function(d){
      return d.time;
    });
  },

  //
  //
  //
  //
  update = function(data){
    this.data = d3.merge(data);
    this.makeTimeExtent();
  },

  //
  // [ INITIALIZE FUNCTION ]
  //
  //
  initialize = function(){
    // create the container
    this.makeSVG();
    this.makeTimeExtent();
    this.makeYScale();
    this.setYaxis();
  },

  //
  // [ THE PLUGIN CONSTRUCTOR ]
  //
  // 
  _constructor = function(el, data){
    // [1] define the object
    var lines = {
      el             : el,
      data           : d3.merge(data),
      makeSVG        : makeSVG, 
      initialize     : initialize,
      makeYScale     : makeYScale,
      makeXScale     : makeXScale,
      makeTimeExtent : makeTimeExtent,
      setYaxis       : setYaxis,
      update         : update
    };

    // [2] initialize the object
    lines.initialize();

    // [3] return the object n____n
    return lines;
  }; // _constructor ends

  // add the plugin to the window element
  win.GFLines = _constructor;


})(window, document);