/**
** CSA - Mapping Students and Faculty
**
** @author Giovanni Zambotti
** @organization Center for Geographic Analysis, Harvard University
** @contact gzambotti@cga.hrvard.edu, g.zambotti@gmail.com
** @license You are free to copy and use this sample.
** @version 0.1
** @updated 
** @since February 1, 2014
** @dependencies Google Maps API v3, jQuery 
**
** Usage Notes: Insipire by http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/adv_fusiontables.html.
**
**/
	
var map, layer, lat = 2.47; lng = 31.37; zoom = 3, year = '2012', myOptions = "", country = 'Tanzania', time = '2012', markersArray = [];	
var tableid = '1ut7SqrD0J60KJIn9RoSGxL0ZUIg5VH_kT-ViZX8';	
var maptype = google.maps.MapTypeId.HYBRID;
google.load("visualization", "1", {packages:["corechart"]});

$(function() {
	$( "#radioLayers" ).buttonset();
	$( "#radioChart" ).buttonset();
});

$(document).ready(function(){
	$.ajax("https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Year FROM " + tableid + "&key=AIzaSyCpHwlJzky3GlrccTkbttPb1DPkb2RXVRs",
      { dataType: "json" }
      ).done(function ( data ) {
            var arrayYear = []; // array for building the selection menu   
            var rows = data['rows'];               
            for (var i in rows) {             
              arrayYear.push(rows[i][0])                                      
            }
            var uniqueArray = [];
              uniqueArray = arrayYear.filter(function(elem, pos) {
              return arrayYear.indexOf(elem) == pos;
            })
            uniqueArray.sort();
            $.each(uniqueArray, function( i, item ) {                    
              // add the carnegie category to the selection menu
              var optionFrom = $('<option />').val(item).text(item);
              $("#africaYear").append(optionFrom);
              //console.log(item)
            });      
    });

    var ex1 = document.getElementById('radio1');
    var ex2 = document.getElementById('radio2');
    var ex3 = document.getElementById('radio3');
    var ex4 = document.getElementById('radio4');    

    ex1.onclick = radioSwitchLayers;
    ex2.onclick = radioSwitchLayers;
    ex3.onclick = radioSwitch;
    ex4.onclick = radioSwitch;
    initialize();
    
    
});



var cRed = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']
var LAYER_STYLES = {'2012': {'min': 1,'max': 24,'colors': cRed},'2013': {'min': 1,'max': 39,'colors': cRed}}
var cRedChart = ["#a50f15", "#de2d26", "#fb6a4a", "#fcae91", "#fee5d9"];

function initialize() {
	// Initialize map
	var myOptions = {
		zoom: zoom,              
		center: new google.maps.LatLng(lat,lng),				
		//navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
		mapTypeControl: false,
		//mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
		zoomControl: true,
		zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
		//mapTypeId: maptype,
		streetViewControl: false,
		panControl: false,
		scaleControl: true
	}

	map = new google.maps.Map(document.getElementById("main"), myOptions);
	
	var style = [{"featureType": "all","stylers": [{"saturation": -100},{"gamma": 0.5}]}]
		
	var styledMapType = new google.maps.StyledMapType(style, {
		map: map,
		name: 'Styled Map'
	});
	
	map.mapTypes.set('map-style', styledMapType);
	map.setMapTypeId('map-style');		
	layer = new google.maps.FusionTablesLayer({suppressInfoWindows: true});
	updateLayerQuery(layer, year);
	layer.setMap(map);

	createLegend(map, year);
	styleLayerBySector(layer, year);
	
	// load the chart the first time
	document.getElementById('piechart_top').innerHTML = "<b class='text'>Country: </b>Tanzania<br /><b class='text'>Year: </b>2012<br/><b class='text'>Students</b>: 23<br/>";
	
	var firstTraveling = [['', ''],['Volunteering',6],['Studying',6],['Travel',1],['Internship/Working',7],['Research',3]]
	var data = google.visualization.arrayToDataTable(firstTraveling);
	
	var options = {'title':'','width':158,'height':130,legend:'none', colors: cRedChart, backgroundColor: {fill:'transparent'},
		chartArea:{left:5,top:10,width:"90%",height:"90%"}};		
	var chart = new google.visualization.PieChart(document.getElementById('piechart_bottom'));		
	chart.draw(data, options);

        //chart = new google.visualization.PieChart(document.getElementById('piechart_bottom'));
        //chart.draw(data, options);

	google.maps.event.addListener(layer, 'click', function(e) {
		country = e.row['Country'].value;
		time = e.row['Year'].value;
		var count = e.row['FREQUENCY'].value;
		var data = new google.visualization.DataTable();	
		document.getElementById('piechart_top').innerHTML = "<b class='text'>Country: </b>" + country + "<br /><b class='text'>Year: </b>" + time + "<br/><b class='text'>Students</b>: " + count + "<br/>";
			
		if (document.getElementById('radio3').checked == true) {
			data.addColumn('string', 'Travel');
			data.addColumn('number', 'Student');
			var a = e.row['Travel'].value;
		}
		else if(document.getElementById('radio4').checked == true) {
			data.addColumn('string', 'School');
			data.addColumn('number', 'Student');
			var a = e.row['School'].value;
		}	
		var result = [];
		a = a.split(','); 
		while(a[0]) {result.push(a.splice(0,2));}
		for (var i = 0; i < result.length; i++){result[i][1] = parseInt(result[i][1]);}
		//console.log(result);
		data.addRows(result);		
		
		// Set chart options
		var options = {'title':'','width':158,'height':130,legend:'none', colors: cRedChart, backgroundColor: {fill:'transparent'},
		chartArea:{left:5,top:10,width:"90%",height:"90%"}};		
		chart = new google.visualization.PieChart(document.getElementById('piechart_bottom'));		
		chart.draw(data, options);		
	});
	
	google.maps.event.addDomListener(document.getElementById('africaYear'),'change', function() {
		year = this.value;
		updateLayerQuery(layer, year);
		styleLayerBySector(layer, year);
		updateLegend(year);
	});
}


function radioSwitchLayers(){
	//console.log(this.value)
	if(this.value == "rStudent"){
		layer.setMap(map);
		clearOverlays();
		$('input[name=chartselect]').attr("disabled",false);
		document.getElementById("piechart_info").innerHTML = "Click over a country to get more information:";
		document.getElementById("piechart_top").innerHTML = "";
	}
	else{
		layer.setMap(null);
		layerFaculty();
		$('input[name=chartselect]').attr("disabled",true);
		document.getElementById("piechart_info").innerHTML = "Click over a red suqare location to get more information:";
		document.getElementById("piechart_top").innerHTML = "";
		document.getElementById("piechart_bottom").innerHTML = "";
	}
}

function layerFaculty() {	
	var goldStar = {
		path: 'M -2,0 0,-2 2,0 0,2 z',		
		fillColor: '#ff0000',
		fillOpacity: 0.8,
		scale: 2,
		strokeColor: '#000',
		strokeWeight: 1
	};
	
	var query = "SELECT 'ProjectTitle', 'HarvardAffiliation','FacultyLead','Latitude', 'Longitude' FROM 1ECenWnV5hcRQxQh_IN_j3azfGzPPXCiLZvXn04I";
        query = encodeURIComponent(query);
        var gvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + query);

        var createMarker = function(coordinate, pTitle, pHAffiliation, pFaculty) {
		marker = new google.maps.Marker({
		map: map,
		position: coordinate,
		animation: google.maps.Animation.DROP,
		icon: goldStar
		//icon: 'images/marker.png'
		});
		markersArray.push(marker);
		google.maps.event.addListener(marker, 'click', function(event) {			
			document.getElementById('piechart_top').innerHTML = "<br/><b>Project: </b>" + pTitle + "<br/><br/><b>Affiliation: </b>" + pHAffiliation + "<br/><br/><b>Faculty Lead: </b>" + pFaculty;
		});
        };

        gvizQuery.send(function(response) {
          var numRows = response.getDataTable().getNumberOfRows();

          // For each row in the table, create a marker
          for (var i = 0; i < numRows; i++) {
            //var stringCoordinates = response.getDataTable().getValue(i, 1);
            //var splitCoordinates = stringCoordinates.split(',');
            var lat = response.getDataTable().getValue(i, 3);
            var lng = response.getDataTable().getValue(i, 4);
            var coordinate = new google.maps.LatLng(lat, lng);
            var pTitle = response.getDataTable().getValue(i, 0);
            var pHAffiliation = response.getDataTable().getValue(i, 1);
	    var pFaculty = response.getDataTable().getValue(i, 2);
		createMarker(coordinate, pTitle, pHAffiliation, pFaculty);
            //createMarker(coordinate, store, delivery);
          }
        });
}
	
function updateLayerQuery(layer, year) {
	var where = "Year = '" + year + "'";        
	layer.setOptions({query: {select: 'geometry', from: tableid, where: where}});
}

function createLegend(map, year) {
	var legendWrapper = document.createElement('div');
	legendWrapper.id = 'legendWrapper';
	legendWrapper.index = 1;
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
			legendWrapper);
	legendContent(legendWrapper, year);
}

function legendContent(legendWrapper, year) {
	var legend = document.createElement('div');
	legend.id = 'legend';
	var title = document.createElement('p');
	title.innerHTML = 'Number of students by Country in ' + year;
	legend.appendChild(title);
	var layerStyle = LAYER_STYLES[year];
	var colors = layerStyle.colors;
	var minNum = layerStyle.min;
	var maxNum = layerStyle.max;
	var step = (maxNum - minNum) / colors.length;
	for (var i = 0; i < colors.length; i++) {
			var legendItem = document.createElement('div');
			var color = document.createElement('div');			
			color.setAttribute('class', 'color');
			color.style.backgroundColor = colors[i];
			legendItem.appendChild(color);
			var newMin = minNum + step * i;			
			var newMax = newMin + step - 1;
			var minMax = document.createElement('span');			
			minMax.innerHTML = parseInt(newMin) + ' - ' + parseInt(newMax);
			legendItem.appendChild(minMax);
			legend.appendChild(legendItem);
	}
	legendWrapper.appendChild(legend);
}

function updateLegend(year) {
	var legendWrapper = document.getElementById('legendWrapper');
	var legend = document.getElementById('legend');
	legendWrapper.removeChild(legend);
	legendContent(legendWrapper, year);
}

function styleLayerBySector(layer, year) {
	var layerStyle = LAYER_STYLES[year];
	var colors = layerStyle.colors;
	var minNum = layerStyle.min;
	var maxNum = layerStyle.max;
	var step = (maxNum - minNum) / colors.length;
	
	var styles = new Array();
	for (var i = 0; i < colors.length; i++) {
			var newMin = minNum + step * i;
			styles.push({
				where: generateWhere(newMin, year),
				polygonOptions: {
					fillColor: colors[i],
					fillOpacity: 0.7,
					strokeColor: "#000000"
				}
			});
		}
	layer.set('styles', styles);
}

function generateWhere(minNum, year) {
	var whereClause = new Array();
	whereClause.push("Year = '");
	whereClause.push(year);
	whereClause.push("' AND 'FREQUENCY' >= ");
	whereClause.push(minNum);
	return whereClause.join('');
}

function radioSwitch(){
	
	var radioSwitchValue = this.value;
	document.getElementById("piechart_bottom").innerHTML = ''
	var data = new google.visualization.DataTable();	
	var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
	var query = "SELECT Country,Year,FREQUENCY,School,Travel FROM 1ut7SqrD0J60KJIn9RoSGxL0ZUIg5VH_kT-ViZX8 WHERE Country = '" + country + "' AND Year = '" + time + "'&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";
	var queryurl = encodeURI(queryUrlHead + query);
	// Set chart options
	var options = {'title':'','width':158,'height':130,legend:'none', colors: cRedChart, backgroundColor: {fill:'transparent'},
		chartArea:{left:5,top:10,width:"90%",height:"90%"}};		
	var chart = new google.visualization.PieChart(document.getElementById('piechart_bottom'));
	
	$.getJSON(queryurl, function(table) {			
		console.log(radioSwitchValue);
		if(radioSwitchValue == "school"){
			school = table.rows[0][3];
			console.log("Harvard Affiliation", country, time);
			data.addColumn('string', 'School');
			data.addColumn('number', 'Student');
			var result = [];
			school = school.split(','); 
			while(school[0]) {result.push(school.splice(0,2));}
			for (var i = 0; i < result.length; i++){result[i][1] = parseInt(result[i][1]);}
			data.addRows(result);					
			chart.draw(data, options);
		}
		else if (radioSwitchValue == "travel"){
			travel = table.rows[0][4];
			console.log("Purpose of Travel", country, time);
			data.addColumn('string', 'Travel');
			data.addColumn('number', 'Student');
			var result = [];
			travel = travel.split(','); 
			while(travel[0]) {result.push(travel.splice(0,2));}
			for (var i = 0; i < result.length; i++){result[i][1] = parseInt(result[i][1]);}
			data.addRows(result);					
			chart.draw(data, options);
		}		
	});	
}	

// remove all the markers and set the markers array to zero
function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}