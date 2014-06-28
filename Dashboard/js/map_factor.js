

function draw_map(map_no, pre_fix_file_detailed, pre_fix_file_total, chartfunction, colors, color_scale) {
  var h = $("#map-container" + String(map_no)).width();
  var offSet=8;
  $("#map" + String(map_no)).css("width", (h-offSet));
  var states = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "15"]
  var map = L.map('map' + String(map_no)).setView([24, -100], 5);

  var transition = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/entran.json",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })();
  var cve_estados = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/cve_estados.json",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })();
  var resumen = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/resumen.json",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })();
  var entran_total = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/entran_total.json",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })(); 
  var json = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/Resultados.geojson",
          'dataType': "json",
          'success': function (data) {
              json = data;
          }
      });
      return json;
  })();

  L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
    maxZoom: 7,
    minZoom: 5,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-20v6611k'
  }).addTo(map);


  // control that shows state info on hover
  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    //this.setAttribute('',);
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>Turismo en Mexico</h4>' +  (props ?
      '<b>' + props.NOM_ENT + '</b><br />' +
      'Salieron: ' + resumen[parseInt(props.CVE_ENT)-1].Salen + '</b><br />' +
      'Llegaron: ' + resumen[parseInt(props.CVE_ENT)-1].Entran
      : 'Escoge un estado');
  };

  info.addTo(map);

  function selectScale(id, out_flag, state_id) {
    out_flag = typeof out_flag !== 'undefined' ? out_flag : true;
    state_id = typeof state_id !== 'undefined' ? state_id : "10";

    if(out_flag){

      return transition[parseInt(id)-1][state_id]
    } else {
      return entran_total[id]
    }
  }

  // get color depending on population density value
  function getColor(d) {

    return d > color_scale[6]  ? colors[7] :
           d > color_scale[5]  ? colors[6] :
           d > color_scale[4]  ? colors[5] :
           d > color_scale[3]  ? colors[4] :
           d > color_scale[2]  ? colors[3] :
           d > color_scale[1]  ? colors[2] :
           d > color_scale[0]  ? colors[1] :
                      colors[0];

  }

  function style(feature, state_id, out_flag) {
    if (state_id === "-1"){
      return {
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(selectScale(feature.properties.CVE_ENT, out_flag = false, state_id = false))
      };
    }
    return {
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
      fillColor: getColor(selectScale(feature.properties.CVE_ENT, out_flag = out_flag, state_id = state_id))
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 2,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }

    info.update(layer.feature.properties);
  }

  var geojson;

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: (function (e) {
        updateMap(first = false, state_id = feature.properties.CVE_ENT);

        })
    });
  }

  function updateMap(first, state_id) {
    first = typeof first !== 'undefined' ? first : false;
    state_id = typeof state_id !== 'undefined' ? state_id : "-1";
    
    $('#bar_bar_chart' + String(map_no) + ' svg').remove();
    if(state_id == "-1"){
      $("#chart-bar-header" + String(map_no)).text("Totales")
      chartfunction("Data/" + pre_fix_file_total + ".tsv", String(map_no));
    } else {
      $("#chart-bar-header" + String(map_no)).text("Estado: " + cve_estados[state_id])
      chartfunction( "Data/" + pre_fix_file_detailed + String(parseInt(state_id) - 1) + ".tsv", String(map_no));
    }
    if(!first){
      map.removeLayer( geojson )
    }
    function tempStyle(feature){
      return(style(feature, state_id = state_id))
    }

    geojson = L.geoJson(json, {
      style: tempStyle,
      onEachFeature: onEachFeature
    })

    geojson.addTo(map);

  }

  function onMapClick(e) {
    updateMap()
  }

  updateMap(first = true)

  /*geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });*/

  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0,0.01, .02, .05, .10, .15, .20, .25],
      labels = [],
      from, to;

    for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];

      labels.push(
        '<i style="background:' + getColor(from + .001) + '"></i> ' +
        100*from + '%' + (to ? '&ndash;' + 100*to + '%' : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);
  map.on('click', onMapClick);
}

 // ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 // ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====

 // Se crean los mapas
 // las diferentes funciones createchart estan definidas en bar_chart_factor.js, basicamente sólo cambian el color
 // el primer argumento es para apuntar los ids al mapa y a los contenedores
 // el segundo es el prefijo del archivo del que se sacan los datos, p.ej uno sería out_state_0.tsv, es el de las salidas del estado 0
 // el tercero es donde estan los totales, (entran o salen)
color_scale_tour = [.01, .02, .05, .1, .15, .2, .25]
color_scale_sent =  [.125, .25, .375, .50, .625, .75]

colors1 = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"];
colors2 = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"];
colors3 = ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"];
draw_map("","out_state_","salen_total",createchart, colors1, color_scale_tour);
draw_map("2","in_state_","entran_total",createchart2,colors2, color_scale_tour);
draw_map("3","in_state_","entran_total",createchart2,colors3, color_scale_sent);
draw_map("4","in_state_","entran_total",createchart,colors1, color_scale_tour);
draw_map("5","in_state_","entran_total",createchart,colors1, color_scale_tour);

 // ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 // ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====


$(window).resize(function(){

  var offSet=8;

  var h = $("#map-container").width();
  $("#map").css("width", (h-offSet));

  var h2 = $("#map-container2").width();
  $("#map2").css("width", (h2-offSet));

  var h3 = $("#map-container3").width();
  $("#map3").css("width", (h3-offSet));

  var h4 = $("#map-container4").width();
  $("#map4").css("width", (h4-offSet));

  var h5 = $("#map-container5").width();
  $("#map5").css("width", (h5-offSet));
}).resize();

