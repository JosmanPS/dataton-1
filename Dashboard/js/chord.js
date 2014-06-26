d3.json("Data/test.json", function(json) {
// From http://mkweb.bcgsc.ca/circos/guide/tables/
var matrix = [];

// function listToMatrix(list, elementsPerSubArray) {
//   var matrix = [], i, k;
//   for (i = 0, k = -1; i < list.length; i++) {
//     if (i % elementsPerSubArray === 0) {
//       k++;
//       matrix[k] = [];
//     }
//     matrix[k].push(list[i]);
//   }
//   return matrix;
// }

// keys = []

// keys = json[0].map(function(state){
//   for (var i in state){
// })
json.forEach(function(state){
  row = [];
  for (var i in state){
    row.push(state[i]);
  }
  matrix.push(row);
});

var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending)
    .matrix(matrix);

var width = 500,
    height = 500,
    innerRadius = Math.min(width, height) * .35,
    outerRadius = innerRadius * 1.1;

var fill = d3.scale.category20();

var svg = d3.select("#chord-container").append("svg")
    .attr("viewBox", "0 0 "+ width + " "+ height)
    .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.append("g").selectAll("path")
    .data(chord.groups)
  .enter().append("path")
    .style("fill", function(d) { return fill(d.index); })
    .style("stroke", function(d) { return fill(d.index); })
    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .on("mouseover", fade(.1))
    .on("mouseout", fade(1));

var ticks = svg.append("g").selectAll("g")
    .data(chord.groups)
  .enter().append("g").selectAll("g")
    .data(groupTicks)
  .enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + outerRadius + ",0)";
    });

// var g = svg.selectAll("g.group")
//       .data(chord.groups)
//     .enter().append("svg:g")
//       .attr("class", "group")

// g.append("svg:text")
//       .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
//       .attr("dy", ".35em")
//       .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
//       .attr("transform", function(d) {
//         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
//             + "translate(" + (r0 + 26) + ")"
//             + (d.angle > Math.PI ? "rotate(180)" : "");
//       })
//       .text(function(d) { return nameByIndex[d.index]; });

ticks.append("line")
    .attr("x1", 1)
    .attr("y1", 0)
    .attr("x2", 5)
    .attr("y2", 0)
    .style("stroke", "#000");

ticks.append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .text(function(d) { return d.label; });

svg.append("g")
    .attr("class", "chord")
  .selectAll("path")
    .data(chord.chords)
  .enter().append("path")
    .attr("d", d3.svg.chord().radius(innerRadius))
    .style("fill", function(d) { return fill(d.target.index); })
    .style("opacity", 1);
  


// Returns an array of tick angles and labels, given a group.
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1000).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v / 1000 + "k"
    };
  });
}

// Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
      .transition()
        .style("opacity", opacity);
  };
}
})