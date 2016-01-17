//Data source
var data = [
        {"source": "me", "target": "hobbies"}, 
        {"source": "me", "target": "interests"},
        {"source": "me", "target": "personality"},
        {"source": "me", "target": "interests"}
    ];
//Graph's nodes and links
var nodes = {};
var links = [];
//Create links from the data source.
data.forEach(function(row){
    links.push({"source": row.source , "target": row.target});
});
//Create nodes from links
links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

//Define the graphs size
var width = window.innerWidth,
    height = 300,
    link_distance=300;


var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(link_distance)
    .gravity(0)
    /*.charge(function(d){
        //var charge = -100;
        //if (d.index === 0) charge = 10 * charge;
        return d.index * -500;
    }) */
    .on("tick", tick)
    .start();

// Set the range
var  v = d3.scale.linear().range([0, 100]);

// Scale the range of the data
v.domain([0, d3.max(links, function(d) { return d.value; })]);

// asign a type per value to encode opacity
links.forEach(function(link) {
    if (link.value <= 25) {
        link.type = "twofive";
    } else if (link.value <= 50 && link.value > 25) {
        link.type = "fivezero";
    } else if (link.value <= 75 && link.value > 50) {
        link.type = "sevenfive";
    } else if (link.value <= 100 && link.value > 75) {
        link.type = "onezerozero";
    }
});

var svg = d3.select("#graph-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 10)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

// var legend = svg.append("g")
//   .attr("class", "legend")
//   .attr("x", width - 65)
//   .attr("y", 25)
//   .attr("height", 200)
//   .attr("width", 200);

// legend.append("rect")
//   .attr("x", width - 80)
//   .attr("y", 17)
//   .attr("width", 10)
//   .attr("height", 10)
//   .style("fill", "green");

// legend.append("text")
//   .attr("x", width - 65)
//   .attr("y", 25)
//   .text("Target");

// legend.append("rect")
//   .attr("x", width - 80)
//   .attr("y", 42)
//   .attr("width", 10)
//   .attr("height", 10)
//   .style("fill", "orange");

// legend.append("text")
//   .attr("x", width - 65)
//   .attr("y", 50)
//   .text("Source");

function lineX2 (d) {
    var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
    var nodeRadius = d3.select("#node"+d.target.index).select("circle").attr("r");
    var scale = (length - nodeRadius) / length;
    var offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
    return d.target.x - offset;
};
 function lineY2(d) {
    var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
    var nodeRadius = d3.select("#node"+d.target.index).select("circle").attr("r");
    var scale = (length - nodeRadius) / length;
    var offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
    return d.target.y - offset;
};


// add the links and the arrows
var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("id",function(d,i) { return "linkId_" + i; })
    .attr("marker-end", "url(#end)");

  var linktext = svg.append("svg:g").selectAll("g.linklabelholder").data(force.links());
     linktext.enter().append("g").attr("class", "linklabelholder")
     .append("text")
     .attr("class", "linklabel")
     .style("font-size", "13px")
     .attr("x", "50")
     .attr("y", "-20")
     .attr("text-anchor", "start")
     .style("fill","#000")
     .append("textPath")
    .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
     .text(function(d) { 
         return d.value; //Can be dynamic via d object 
     });
         var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        if(d.px + d3.event.dx > width){
            d.px = width - 20;
            d.x = width -20;
        }else if(d.px + d3.event.dx < 0){
            d.px = 20;
            d.x = 20;
        }else{
            d.px += d3.event.dx;
            d.x += d3.event.dx;
        }

        if(d.py + d3.event.dy > height){
            d.py = height - 20;
            d.y = height -20;
        }else if(d.py + d3.event.dy < 0){
            d.py = 20;
            d.y = 20;
        }else{
            d.py += d3.event.dy;
            d.y += d3.event.dy;
        }
        
        // d.py += d3.event.dy;
        // d.x += d3.event.dx;
        // d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }

// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .attr("id", function(d,i){ return "node"+i;})
    .call(node_drag);
    // .on("click", click)
    // .on("dblclick", dblclick);

// add the nodes
node.append("circle")
    .attr("r", 5);

// add the text 
node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });



// add the curvy lines
function tick() {
    path.attr("d", function(d) {
    var x1 = d.source.x,
      y1 = d.source.y,
      x2 = d.target.x,
      y2 = d.target.y,
      
      // x2 = lineX2(d);
      // y2 = lineY2(d);
      
      dx = x2 - x1,
      dy = y2 - y1,
      dr = Math.sqrt(dx * dx + dy * dy),

      // Defaults for normal edge.
      drx = dr,
      dry = dr,
      xRotation = 0, // degrees
      largeArc = 0, // 1 or 0
      sweep = 1; // 1 or 0

      // Self edge.
      if ( x1 === d.target.x && y1 === d.target.y ) {
        // Fiddle with this angle to get loop oriented.
        xRotation = -45;

        // Needs to be 1.
        largeArc = 1;

        // Change sweep to change orientation of loop. 
        //sweep = 0;

        // Make drx and dry different to get an ellipse
        // instead of a circle.
        drx = 30;
        dry = 20;

        // For whatever reason the arc collapses to a point if the beginning
        // and ending points of the arc are the same, so kludge it.
        x2 = d.target.x + 1;
        y2 = d.target.y + 1;
      } 

        return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
    });

    node
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; });


    //   linktext.attr("transform", function(d) {
    //    console.log((d.source.y + d.target.y) / 2);
    //  return "translate(" + (((d.source.y + d.target.y) / 2) - 10) + "," 
    //  + (((d.source.y + d.target.y) / 2) - 10) + ")"; });

}

var associated_nodes_target = [];
var associated_nodes_source = [];


var originalNodeSelection;
var nodeName;

// action to take on mouse click
function click() {
    if(originalNodeSelection){
        reset();
    }

    originalNodeSelection = d3.select(this);
    styleNode(d3.select(this),"lightsteelblue");
    nodeName = d3.select(this).select("text").property("textContent");
    d3.selectAll(".link").style("stroke", function(link){
        if(link.source.name == nodeName){
            associated_nodes_target.push(link.target);
            return "green";
        }else if(link.target.name == nodeName){
            associated_nodes_source.push(link.source)
            return "orange";
        }
    });
    associated_nodes_target.forEach(function(node){
        styleNode(d3.selectAll(".node").filter(function(d){
            return d.name == node.name;
        }),"green");
    });
    associated_nodes_source.forEach(function(node){
        styleNode(d3.selectAll(".node").filter(function(d){
            return d.name == node.name;
        }),"orange");
    });
}

function reset(){
        associated_nodes_target = [];
        associated_nodes_source = [];
        styleOriginal(originalNodeSelection);
        styleOriginal(d3.selectAll(".node"));
        d3.selectAll(".link").style("stroke", function(link){
            return "none";
        });

}

function styleNode(selection, color){
        selection.select("text").transition()
        .duration(750)
        .attr("x", 22)
        .style("fill", "steelblue")
        .style("stroke", color)
        .style("stroke-width", ".5px")
        .style("font", "20px sans-serif");

        selection.select("circle").transition()
        .duration(750)
        .attr("r", 16)
        .style("fill", color);
}

// action to take on mouse double click
function dblclick() {
    reset();
    d3.selectAll(".link").style("stroke", function(link){
        if(link.source.name == nodeName){
            return "#667";
        }
    });
}

function styleOriginal(selection){
    selection.select("circle").transition()
        .duration(750)
        .attr("r", 6)
        .style("fill", "#ccc");
    selection.select("text").transition()
        .duration(750)
        .attr("x", 12)
        .style("stroke", "none")
        .style("fill", "black")
        .style("stroke", "none")
        .style("font", "10px sans-serif");
}