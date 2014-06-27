createchart = function(filename){

// var margin = {top: 20, right: 20, bottom: 30, left: 28},
//     width = 1000 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var x = d3.scale.ordinal()
//     .rangeRoundBands([0, width], .1);

// var y = d3.scale.linear()
//     .range([height, 0]);



// var svg_bar = d3.select("#bar_bar_chart").append("svg")
//     .attr("viewBox", "0 0 "+ (width + margin.left + margin.right) + " "
//           + (height+ margin.top + margin.bottom))
//     .attr("preserveAspectRatio", "xMinYMin meet")
//     // .attr("width", width + margin.left + margin.right)
//     // .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
function type(d) {
  d.visitas = +d.visitas;
  return d;
}
d3.tsv(filename, type, function(error, data) {
var valueLabelWidth = 40; // space reserved for value labels (right)
var barHeight = 20; // height of one bar
var barLabelWidth = 100; // space reserved for bar labels
var barLabelPadding = 5; // padding between bar and bar labels (left)
var gridLabelHeight = 18; // space reserved for gridline labels
var gridChartOffset = 3; // space between start of grid and first bar
var maxBarWidth = 420; // width of the bar with the max value
 
// accessor functions 
var barLabel = function(d) { return d.estado; };
var barValue = function(d) { return +d.visitas; };
 
// sorting
var sortedData = data.sort(function(a, b) {
 return d3.descending(barValue(a), barValue(b));
}); 

// scales
var yScale = d3.scale.ordinal().domain(d3.range(0, sortedData.length)).rangeBands([0, sortedData.length * barHeight]);
var y = function(d, i) { return yScale(i); };
var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
var x = d3.scale.linear().domain([0, d3.max(sortedData, barValue)]).range([0, maxBarWidth]);
// svg container element
var chart = d3.select('#bar_bar_chart').append("svg")
  .attr("viewBox", "0 0 "+ (maxBarWidth + barLabelWidth + valueLabelWidth) + " "+ (gridLabelHeight + gridChartOffset + sortedData.length * barHeight))
  .attr("preserveAspectRatio", "xMinYMin meet")

// grid line labels
var gridContainer = chart.append('g')
  .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 
gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
  .attr("x", x)
  .attr("dy", -3)
  .attr("text-anchor", "middle")
  .text(String);
// vertical grid lines
gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
  .attr("x1", x)
  .attr("x2", x)
  .attr("y1", 0)
  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
  .style("stroke", "#ccc");
// bar labels
var labelsContainer = chart.append('g')
  .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
labelsContainer.selectAll('text').data(sortedData).enter().append('text')
  .attr('y', yText)
  .attr('stroke', 'none')
  .attr('fill', 'black')
  .attr("dy", ".35em") // vertical-align: middle
  .attr('text-anchor', 'end')
  .text(barLabel);
// bars
var barsContainer = chart.append('g')
  .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
barsContainer.selectAll("rect").data(sortedData).enter().append("rect")
  .attr('y', y)
  .attr('height', yScale.rangeBand())
  .attr('width', function(d) { return x(barValue(d)); })
  .attr('stroke', 'white')
  .attr('fill', 'steelblue');
// bar value labels
barsContainer.selectAll("text").data(sortedData).enter().append("text")
  .attr("x", function(d) { return x(barValue(d)); })
  .attr("y", yText)
  .attr("dx", 3) // padding-left
  .attr("dy", ".35em") // vertical-align: middle
  .attr("text-anchor", "start") // text-align: right
  .attr("fill", "black")
  .attr("stroke", "none")
  .text(function(d) { return d3.round(barValue(d), 2); });
// start line
barsContainer.append("line")
  .attr("y1", -gridChartOffset)
  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
  .style("stroke", "#000");
});
//   x.domain(data.map(function(d) { return d.estado; }));
//   y.domain([0, d3.max(data, function(d) { return d.visitas; })]);

//   svg_bar.append("g")
//       .attr("class", "x axis")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

        // svg_bar.append("g")
        //     .attr("class", "x axis")
        //     .call(xAxis)
        //   .append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", ".71em")
        //     .style("text-anchor", "end")
        //     .text("Visitantes");

//   svg_bar.selectAll(".bar")
//       .data(data)
//     .enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", function(d) { return x(d.estado); })
//       .attr("width", x.rangeBand())
//       .attr("y", function(d) { return y(d.visitas); })
//       .attr("height", function(d) { return height - y(d.visitas); });


}