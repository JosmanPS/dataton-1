function draw_map() {
  var states = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "15"]
  var map = L.map('map').setView([24, -100], 5);

  var transition = (function () {
      var json = null;
      $.ajax({
          'async': false,
          'global': false,
          'url': "Data/salen.json",
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
    maxZoom: 18,
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
      
      return transition[parseInt(state_id)-1][id]
    }
  }

  // get color depending on population density value
  function getColor(d) {
    return d > .25  ? '#800026' :
           d > .20  ? '#BD0026' :
           d > .15  ? '#E31A1C' :
           d > .10  ? '#FC4E2A' :
           d > .05  ? '#FD8D3C' :
           d > .02  ? '#FEB24C' :
           d > .01  ? '#FED976' :
                      '#FFEDA0';
  }

  function style(feature, state_id, out_flag) {
    if (state_id === "-1"){
      return {
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: '#FFEDA0'
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
        $('#bar_bar_chart svg').remove();
        createchart( "Data/state_" + String(parseInt(state_id) - 1) + ".tsv" );
        })
    });
  }

  function updateMap(first, state_id) {
    first = typeof first !== 'undefined' ? first : false;
    state_id = typeof state_id !== 'undefined' ? state_id : "-1";
    
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

  var legend = L.control({position: 'bottomright'});

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
draw_map()