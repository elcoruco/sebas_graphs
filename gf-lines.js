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
    defaultHeight : 500,
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
              .domain([0, syle.maxValue])
              .range([style.defaultHeight - style.margins.bottom, style.margins.top ]);
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