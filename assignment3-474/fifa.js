var width = 750;
var height = 450;
var margin = {top: 20, right: 15, bottom: 30, left: 40};
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

var dataset;
var maxRank = 100;
var minRank = 46;
var bufferValue = 5;
var maxWage = 500;
var currNationality = "all";
var currPosition = "all";
var allCountries = d3.set();
var allPositions = d3.set();
var bottomSlider
var upperSlider
var maxAge
var minAge
d3.csv("data.csv", function(error, futbol) {
  if (error) return console.warn(error);
    futbol.forEach(function(d) {
       d.name = d.Name;
      d.age = +d.Age;
      d.overall = +d.Overall;
     	d.wage = +(parseInt(d.Wage.substring(1, d.Wage.length)));
      d.nationality = d.Nationality;
      allCountries.add(d.nationality);
      allPositions.add(d.Position);

  });
  dataset = futbol;
  bufferValue = (maxRank - minRank) / 8


  maxAge = d3.max(dataset.map(function(d) {return d.age;}));
  minAge = d3.min(dataset.map(function(d) {return d.age;}));
  bottomSlider = minAge + 5
  upperSlider = maxAge - 5

  console.log(maxAge, minAge)
  $("#nationality").append(`<option value="all" selected="selected">all</option>`)
  allCountries.values().forEach(function(country){
    newElement = $("<option/>");
    newElement.attr({"value": country}).text(country);
    $("#nationality").append(newElement)
  });

  $("#position").append(`<option value="all" selected="selected">all</option>`)
  allPositions.values().forEach(function(position){
    newElement = $("<option/>");
    newElement.attr({"value": position}).text(position);
    $("#position").append(newElement);
  })


  var positionSelect = d3.select("#position")
    .on("change", function() {
    currPosition = this.value;
    d3.select("#position-label")
      .property("value", currPosition)
      .text(currPosition)
      filterType(dataset);

    });
//all the data is now loaded, so draw the initial vis
  var nationalitySelect = d3.select("#nationality")
    .on("change", function() {
    currNationality = this.value
    d3.select("#nationality-label")
      .property("value", currNationality)
      .text(currNationality);
      filterType(dataset);

    });

    $( function() {
      var sliderange = maxAge - minAge 

      $( "#slider-range" ).slider({
        range: true,
        min: minAge,
        max: maxAge,
        values: [ minAge +5, maxAge-5],
        slide: function( event, ui ) {
          $( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
          bottomSlider = ui.values[0]
          upperSlider = ui.values[1]
          filterType(dataset)
        }
      });
      $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
      $( "#slider-range" ).slider( "values", 1 ) );
    });
  

  drawVis(dataset);

});

var col = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("body").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, w]);

var y = d3.scaleLinear()
        .domain([0, 500])
        .range([h, 0]);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft(y).scale(y);

chart.append("g")
      .attr("transform", "translate(0," + (height-40) + ")")
      .attr("class", "x axis")
      .call(xAxis)
chart.append("text")
      .attr("x", w / 2)
      .attr("y", height - 10 )
      .style("text-anchor", "end")
      .text("Overall Rating of Player");

chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -height/2 + 100)
      .style("text-anchor", "end")
      .text("Earnings in Thousands of Euros (Weekly)");


function drawVis(dataset) { 
  maxRank = d3.max(dataset.map(function(d) {return d.overall;}));
  minRank = d3.min(dataset.map(function(d) {return d.overall;}));
  maxWage = d3.max(dataset.map(function(d) {return d.wage;}));
  minWage = d3.min(dataset.map(function(d) {return d.wage;}));
  x.domain([minRank - 5, maxRank + 5])
  y.domain([0, maxWage + 50])
  chart.select(".y").transition().duration(500).call(yAxis)
  chart.select(".x").transition().duration(500).call(xAxis)


	var circle = chart.selectAll("circle")
	   .data(dataset);

	circle
    	  .attr("cx", function(d) { return x(d.overall);  })
    	  .attr("cy", function(d) { return y(d.wage);  })
     	  .style("fill", function(d) { return col(d.nationality); });

	circle.exit().remove();

	circle.enter().append("circle")
    	  .attr("cx", function(d) { return x(d.overall);  })
    	  .attr("cy", function(d) { return y(d.wage);  })
    	  .attr("r", 4)
     	  .style("fill", function(d) { return col(d.nationality); })
        .style("opacity", 0.35)
        .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html("Name: " + d.name + 
                        ", Weekly Earnings (Thousands Euros): " + d.wage + 
                        ", Nationality: " + d.nationality + 
                        ", Overall Rating: " + d.overall + 
                        ", Position: " + d.Position +
                        ", Preferred Foot: " + d["Preferred Foot"] + 
                        ", Age: " + d.Age)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout", function(d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0)})
}



function filterType(subset) {
    console.log(currNationality, currPosition, upperSlider, bottomSlider)
    var toFilter
    if (currNationality == "all" && currPosition == "all") {
      toFilter = subset.filter(function(d) {
        return d.age >= bottomSlider && d.age <= upperSlider
      })
    } else if (currNationality != "all" && currPosition == "all") {
      toFilter = subset.filter(function(d) {
        return d.age >= bottomSlider && d.age <= upperSlider && d.nationality == currNationality
      })
    } else if (currNationality == "all" && currPosition != "all") {
      toFilter = subset.filter(function(d) {
        return d.age >= bottomSlider && d.age <= upperSlider && d.Position == currPosition
      })
    } else {
      toFilter = subset.filter(function(d) {
        return d.age >= bottomSlider && d.age <= upperSlider && d.Position == currPosition && d.nationality == currNationality
      })
    }

    drawVis(toFilter);
}


