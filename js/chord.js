d3.json("Data/transicion.json", function(json) {
  // From http://mkweb.bcgsc.ca/circos/guide/tables/
  
  var keys_json = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/cve_ab_estados.json",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })(); 
  keys_list = []
  var matrix = [];

  for(key in keys_json){
    map = {};
    map.key = key;
    map.name = keys_json[key];
    keys_list.push(map); 
  }
  keys_list = keys_list.sort(function(a,b){return d3.ascending(a.key, b.key)});
  keys = keys_list.map(function(item){return item.key})

  json.forEach(function(state){
    row = [];
    keys.forEach(function(i){
      row.push(state[i]);
    })
    matrix.push(row);
  });
  var chord = d3.layout.chord()
      .padding(.01)
      .sortSubgroups(d3.descending)
      .matrix(matrix);

  var width = 600,
      height = 600,
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
///////////////////
  var g = svg.selectAll("g.group")
      .data(chord.groups)
    .enter().append("svg:g")
      .attr("class", "group")
      .on("mouseover", fade(.02))
      .on("mouseout", fade(.80));

  g.append("svg:text")
      .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (outerRadius + 30) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .text(function(d,i) { return keys_list[i].name; })
      .attr("class", "labels-text");
//////////////
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
      .text(function(d) { return d.label; })
      .attr("class", "ticks-text");

  svg.append("g")
      .attr("class", "chord")
    .selectAll("path")
      .data(chord.chords)
    .enter().append("path")
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("fill", function(d) { return fill(d.target.index); })
      .style("opacity", 1)

    


  // Returns an array of tick angles and labels, given a group.
  function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 100).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 2.5 ? null : v
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