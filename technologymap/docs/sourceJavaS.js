var database = [];
var nodesbase = [];
var years = {};

var Boxes = [];

var circles = null;
var texts = null;
var paths = null;
var svg;
var container;
var force;

var mouseOverTool;
var zoom;

var allForcenodes = {};
var forceNodes = [];
var types = [];
var color;
var allnodes = {};
var changedNodes = [];
var connections = [];

var isAllVisible;
var isAnim;

var width = 1890;
var height = 990;
var offSetx = 350;

function clickText(val)
{
	if(!!!$($("#tags").autocomplete('widget')).is(':visible'))
		$( "#tags" ).autocomplete( "search", val );
	else
		$( "#tags" ).autocomplete( "close" );
}
function PlayZoom()
{
	isAnim = true;
	yearCircles = 2;
	console.log(years);
	for(i in Object.keys(years))
	{
		if(i != Object.keys(years).length);
		{
			trans = [-1120+(1120 * i)/6,-495+(495 * i)/6];
			scal = 2 -(1/6)*i;
			container.transition()
				.delay(1500*i)
				.duration(1500)
				.attr("transform","translate(" + trans+ ")scale(" + scal +")");
							
			setTimeout(ZoomAnimPaths, 1500 * i);
		}
	}
}
yearCircles = 2;
function ZoomAnimPaths() {
if(yearCircles==Object.keys(years).length + 1)
{	
	sliderChange(1);
	isAnim = false;
}else
	sliderChange(yearCircles);
	yearCircles++;
}
function createCombo()
{
	var Comp = [];
	force.nodes().forEach(function(each){ if( each.name != "dummy")Comp.push(each.name);})
	$(function() {
    $( "#tags" ).autocomplete({
      source: Comp,
	  minLength: 0
    });
	});
	

    $('#tags').on('autocompleteselect', function (e, ui) {
	if(isAllVisible)
        HideAll(ui.item.value);
	else
		this.value = "";
		update(ui.item.value);
		return false;
		});
}
function createBox(paths)
{
	var myDiv = document.getElementById("boxes");
 	for(var i in paths)
	{
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.y = 15;
		checkbox.name = "checkBoxes";
		checkbox.value = paths[i];
		checkbox.id = i;
		Boxes.push({name:paths[i], checked:true});
		checkbox.checked = true;
		checkbox.onchange = isChecked;

		var label = document.createElement('label')
		label.htmlFor = "id";
		label.appendChild(document.createTextNode(paths[i]));
		myDiv.appendChild(checkbox);
		
		myDiv.appendChild(label);
		if(i!=paths.length-1)
		{
			myDiv.appendChild(document.createElement("br"));
		}
	}
}

function isChecked()
{
	for(var i in Boxes)
	{
		var val = document.getElementById(i);
		
		if(Boxes[i].checked != val.checked)
		{
			if(!isAnim)
			{
				Boxes[i].checked = val.checked;
				modifyPaths(val.value,val.checked);
				break;
			}
			else
			{
				val.checked = !val.checked;
			}
		}
	}
}

function loadData()
{

	 d3.json("/technologymap/docs/Database.json",function(error,data){
 		 var secondArr=false;
		var i = 0;
		while(!secondArr)
 		{
			if(i<data.length && data[i].A!=null)
			{
				database.push(data[i]);
				i++;
			}
			else
			{
				secondArr = true;
			}
		}
		d3.json("/technologymap/docs/nodes.json",function(error,datav){
			
		var j = 0;
		while(j<datav.length)
		{
			console.log(datav[j]);
			nodesbase.push(datav[j]);
			j++;
		}
  			loadScreen();
  			InitialState();
		});
		});
	// $.getJSON("docs/Database.json", function(error, json) {
  		 // if (error) return console.warn(error);
  		 // database = json;
  		// $.getJSON("docs/nodes.json", function(error, json) {
  			 // if (error) return console.warn(error);
  				 // nodesbase = json;
  				 // loadScreen();
  				 // InitialState();
  		 // });
  	 // });
  	
}

function loadScreen()
{
	isAllVisible = true;
	isAnim = false;
	var nodes = {};
	var abicim = [];

	allnodes["dummy"] = {name: "dummy", x: (width - offSetx)/2 + offSetx, y:height/2, fixed: true};
	var pathType = {};
	
	var nodesR = {};

	
	database.forEach(function(eachLine){
		var path = {};
		path.source = allnodes[eachLine.A] || (allnodes[eachLine.A] = {name: eachLine.A, connectedNodes: [], year: "undefined"});
		path.target = allnodes[eachLine.B] || (allnodes[eachLine.B] = {name: eachLine.B, connectedNodes: [], year: "undefined"});
		path.type = eachLine.C.replace(/\s+/g,'');
		
		if(types.indexOf(path.type)<0)
		{ 
			types[types.length] = path.type;
		}
		connections.push(path);
	});
	
	createBox(types);
	years["undefined"] = "undefined";
	
	console.log("nodesbase");
	console.log(nodesbase);
	nodesbase.forEach(function(eachNode){
		var each ={};
		//console.log(eachNode);
		each.target = nodesR[eachNode.B] || (nodesR[eachNode.B] = {name: eachNode.B, year: eachNode.E});
		if(allnodes.hasOwnProperty(eachNode.B) && eachNode.E !=null)
		{
			var year;
			if(typeof(eachNode.E)!= typeof(1))
			{
				var yearCand = eachNode.E;
				var index = eachNode.E.indexOf("-")
				if( index >=0)
				{
					yearCand = eachNode.E.substring(0,index);
					year = parseInt(yearCand);
				}
				else
				{
					year = parseInt(eachNode.E);
				}
			}
			else
			{
				year = eachNode.E;
			}
			var remain = year % 5;
			year = year - remain;
			allnodes[eachNode.B].year = years[year] || (years[year] = year);
		}
	});
	
			console.log("eachNode");
	color = d3.scale.category10()
			.domain(d3.range(Object.keys(types).length));
	
	var sliderStepNum = document.getElementById("sliderBar");
	sliderStepNum.max = Object.keys(years).length + 1;
	
	
	for(var i in connections)
	{
	 	allnodes[connections[i].source.name].connectedNodes.push({name: connections[i].target.name, type: connections[i].type, source: false});
	 	allnodes[connections[i].target.name].connectedNodes.push({name: connections[i].source.name, type: connections[i].type, source: true});
	}
	
	for(var i in allnodes)
	{
		var nodeForForce = {};
		nodeForForce.source = allnodes["dummy"];
		nodeForForce.target = allnodes[i];
		if(i != "dummy")
			forceNodes.push(nodeForForce);
	}
	
	zoom = d3.behavior.zoom()
		.scaleExtent([1, 3])
		.on("zoom", zoomed);
	
	svg = d3.select("#svgArea").append("svg")
    	.attr ("width", width)
    	.attr("height", height);
	
	
	svg.selectAll("#LayerReset")
				.data([0])
				.enter().append("rect")
				.attr("id","LayerReset")
				.attr("x",offSetx)
				.attr("y",0)
				.attr("height",height)
				.attr("width",width - offSetx)
				.attr("opacity",0)
				.on("click",function(){resetScene(force.nodes())});
				
	container = svg.append("g")	//.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom)
		.on("mousedown.zoom",null);
    	
	svg.append("rect")
		.attr("x", offSetx)
    	.attr("y", 0)
        .attr("width", width - offSetx)
        .attr("height", height)
        .style("fill","none")
		.style("stroke", "black")
		.style("stroke-width", 1);
	
	svg.append("rect")
		.attr("x", 0)
    	.attr("y", 0)
        .attr("width",  offSetx)
        .attr("height", height)
        .style("fill","white");
		
	for(i in types)
	{
		svg.append("rect")
			.attr("x",65)
			.attr("y",93 + 3.3 * (i+1))
			.attr("width",10)
			.attr("height",10)
			.style("fill",color(i))
			.style("stroke","black")
			.style("stroke - width",0.5);
	}
        
	
    container.append("defs").selectAll("marker")
   	 	.data(types)
  		.enter().append("marker")
    	.attr("id", function(d) { return d; })
		.attr("viewBox", "0 -5 10 10")
    	.attr("refX", 10)
    	.attr("refY", 0)
    	.attr("markerWidth", 5)
    	.attr("markerHeight", 5)
    	.attr("orient", "auto")
  		.append("path")
    	.attr("d", "M0,-5L10,0L0,5");
}
function InitialState()
{
	var allForcenodes = allnodes;
	force = d3.layout.force()
    	 .nodes(d3.values(allForcenodes))
    	 .links(forceNodes)
    	 .size([width, height])
		 .gravity(0)
    	 .linkDistance(function(d){
    	 	if(d.target.year == "undefined")
    	 	{
    	 		return 280;
    	 	}
    	 	else
    	 	{
    	 		var index = 1;
    	 		for(var i in years)
				{
					if(d.target.year == years[i])
					{
						return index*40;
					}
					index++;
				}
    	 	}
    	 	})
   		 .charge(-300);
	
	var loading = container.append("text")
    	.attr("x", (width - offSetx)/2 + offSetx)
    	.attr("y", height / 2)
    	.attr("dy", ".35em")
    	.style("text-anchor", "middle")
    	.text("Simulating. One moment please...");
    	
    mouseOverTool = d3.select("body").append("div")	
    					.attr("class","tooltip")
    					.style("opacity", 0);
    					
	setTimeout(function(){
		createCombo();
		force.start();
  			for (var i = 10000; i > 0; --i) force.tick();
			force.stop();
	 		delete allnodes["dummy"];
	 		var index = 0;
	 		
			container.append("g").selectAll("circle")
				.data([0])
				.enter().append("circle")
				.attr("id","zoomable")
				.attr("cx",(width - offSetx)/2 + offSetx)
				.attr("cy",height/2)
				.attr("r",500)
  				.attr("opacity",0)
				.on("click",function(){resetScene(force.nodes())});
			
			container.append("g").selectAll("path")
    			.data(connections)
  				.enter().append("path")
  				.attr("id","allPaths")
  				.attr("d",linkArc)
				.attr("opacity",1)
  				.style("stroke",colorDet)
    			.attr("class", function(d) {return "link  " + d.type; })
    			.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

			container.append("g").selectAll("circle")
    			.data(d3.values(allnodes))
  				.enter().append("circle")
  				.attr("id","allCircles")
  				.attr("cx",function(d){ return d.x;})
  				.attr("cy",function(d){ return d.y;})
  				.attr("opacity",1)
				.style("fill",function(d){ 
				var index = 0;
				for(i in years)
				{	
					if(years[i] == d.year){return d3.rgb(255,183,183).darker(index*0.5)/*(index/Object.keys(years).length)*/;}
					index++;
				}
				})
    			.attr("r", function(d){ return 10 + 0.4*d.connectedNodes.length;})
    			.on("click" , function(d){ if(!isAnim)
    				HideAll(d.name);});

			container.append("g").selectAll("text")
    			.data(d3.values(allnodes))
  				.enter().append("text")
  				.attr("id","allTexts")
    			.attr("x", 8/*function(d){return -1*(d.name.length/2)*4;}*/)
    			.attr("y", ".31em")
    			.attr("transform",transform)
				//.style("font-size",10)
				.style("text-shadow","red")
    			.text(function(d) { return d.name; });
    
    		loading.remove();
    },0);
}
function colorDet(d)
{
	return color(types.indexOf(d.type));
}

function sliderChange(valueS) { 
console.log(keys);
	var slider = document.getElementById("sliderBar");
	slider.value = valueS;
	var keys = Object.keys(years);
	var yearText = document.getElementById("yearsText");
	if(valueS == 1)
	{
		yearText.innerHTML = 2015;
	}
	else if(valueS == keys.length+1)
	{
		yearText.innerHTML = "unknown"; 
	}
	else
	{
		yearText.innerHTML = years[keys[valueS-2]] + 5;
	}
	
	if( isAllVisible )
	{
	container.selectAll("#allCircles")
		.attr("opacity",function(d){if(valueS != 1 && d.year <= years[keys[valueS-2]]) {return 1;} else if(valueS == 1) return 1; else return 0;});
	container.selectAll("#allTexts")
		.attr("opacity",function(d){if(valueS != 1 && d.year <= years[keys[valueS-2]]) {return 1;} else if(valueS == 1) return 1; else return 0;});
	container.selectAll("#allPaths")
		.attr("opacity",function(d){if(pathVisible(d.type)){if(valueS == 1 || (d.source.year <= years[keys[valueS-2]] && d.target.year <= years[keys[valueS-2]])) return 1;else return 0;} else return 0;});
	
	}	
	else
	{
	container.selectAll("#copyC")
		.attr("opacity",function(d){if(valueS != 1 && d.year <= years[keys[valueS-2]]) {return 1;} else if(valueS == 1) return 1; else return 0;});
	container.selectAll("#copyT")
		.attr("opacity",function(d){if(valueS != 1 && d.year <= years[keys[valueS-2]]) {return 1;} else if(valueS == 1) return 1; else return 0;});
	container.selectAll("#copyP")
		.attr("opacity",function(d){if(pathVisible(d.type)){if(valueS == 1 || (d.source.year <= years[keys[valueS-2]] && d.target.year <= years[keys[valueS-2]])) return 1;else return 0;} else return 0;});
	}
}

function pathVisible(name)
{
	for(i in Boxes)
	{
		if(Boxes[i].name == name)
			return Boxes[i].checked;
	}
}

var oldScale = 0.9;
var zoomIn = 0;//1 == zoom in 2 zoom out 3 idle
var inScale;
var inTransform;

function zoomed() {
  var scale = d3.event.scale;	
  var translateT;
  if( oldScale > d3.event.scale )
  {
	if(zoomIn!=3)
	{
		zoomIn = 3;
		inScale = oldScale;
	}
	translateT = [inTransform[0] * ((scale - 1)/(inScale-1)),inTransform[1] * ((scale - 1)/(inScale-1))];
	if(scale==1)
		zoom.translate([0,0]);
  }
  else
  {
	zoomIn = 1;
	translateT = zoom.translate();
	if(scale == 1)
	{
		translateT = [0,0];
		zoom.translate(translateT);
	}
	inTransform = translateT;
  }
  oldScale = d3.event.scale;
  container.attr("transform", "translate(" + translateT + ")scale(" + scale + ")");
}
function tick() {
  paths.attr("d", linkArc);
  circles.attr("cx", function(d){ return d.x;})
  		 .attr("cy", function(d){ return d.y;});
  texts.attr("transform", transform);
}

function linkArc(d) {
	var rConst = allnodes[d.target.name].connectedNodes.length;
	var r = rConst * 0.5 + 10;
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
	var targetX = dx * ((dr-r)/dr) + d.source.x;
	var targetY = dy * ((dr-r)/dr) + d.source.y;
	
  return "M" + d.source.x + "," + d.source.y + "L" + targetX + "," + targetY;
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function modifyPaths(value, checked)
{
	var slider = document.getElementById("sliderBar");
	valueS = slider.value;
	var keys = Object.keys(years);
	if(valueS != 1)
	{
		if(!isAllVisible)
			paths.attr("opacity",function(d){ if(d.type == value){ if(d.source.year <= years[keys[valueS-2]] && d.target.year <= years[keys[valueS-2]]){ if(checked) return 1;} return 0;} return d3.select(this).attr("opacity");});
		else
			container.selectAll("#allPaths").data(connections)
				.attr("opacity",function(d){ if(d.type == value){ if(d.source.year <= years[keys[valueS-2]] && d.target.year <= years[keys[valueS-2]]){ if(checked) return 1;} return 0;} return d3.select(this).attr("opacity");});
	}
	else
	{
		if(!isAllVisible)
			paths.attr("opacity",function(d){ if(d.type == value){ if(checked) return 1; else return 0;} return d3.select(this).attr("opacity");});
		else
			container.selectAll("#allPaths").data(connections)
				.attr("opacity",function(d){ if(d.type == value){  if(checked) return 1; else return 0;} return d3.select(this).attr("opacity");});
	}
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function HideAll(chosen)
{
	container.selectAll("#allCircles").data(d3.values(allnodes))
		.attr("opacity",0);
	container.selectAll("#allPaths").data(connections)
		.attr("opacity",0);
	container.selectAll("#allTexts").data(d3.values(allnodes))
		.attr("opacity",0);
	update(chosen);
}

function resetScene(ChangedNodes)
{
	var sliderStepNum = document.getElementById("sliderBar");
	sliderStepNum.value = 0;
	isAllVisible = true;
	container.selectAll("#allCircles").data(d3.values(allnodes))
		.attr("opacity",1);
	container.selectAll("#allPaths").data(connections)
		.attr("opacity",function(d){for(box in Boxes){if(d.type == Boxes[box].name){var opValue = Boxes[box].checked ? 1: 0;	return opValue;}}});
	container.selectAll("#allTexts").data(d3.values(allnodes))
		.attr("opacity",1);
		
	container.selectAll("#LayerZoomable").remove();
	
	force.stop();
	
	container.selectAll("#copyC").data(ChangedNodes)
		.transition()
		.duration(2000)
		.attr("cx",function(d){ return allnodes[d.name].x;})
		.attr("cy",function(d){ return allnodes[d.name].y;})
		.each("end",function(d){ if(isAllVisible) d3.select(this).remove();});
	
	container.selectAll("#copyP").remove();
	container.selectAll("#copyT").remove();
		
}

function update(chosen)
{
	if(!isAnim)
	{
	isAllVisible = false;
	force.stop();
	force.links().splice(0,force.links().length);
	force.nodes().splice(0,force.nodes().length);
	var tempChangedNodes = {};
	var nodesTempArr = {};
	var tempLinks = [];
	
	nodesTempArr[chosen] = {name: allnodes[chosen].name, x: (width - offSetx)/2 + offSetx, y:height/2, year: allnodes[chosen].year, fixed: true, nodeNum: allnodes[chosen].connectedNodes.length };
	force.nodes().push(nodesTempArr[chosen]);
	for(var i in allnodes[chosen].connectedNodes)
	{
		var linkElement = {};
		var temp = allnodes[chosen].connectedNodes[i];
		tempChangedNodes[temp.name] = i;
		nodesTempArr[temp.name] = {name: temp.name, year: allnodes[temp.name].year, nodeNum: allnodes[temp.name].connectedNodes.length};
		
		if(temp.source)
		{
			linkElement.source = nodesTempArr[temp.name];
			linkElement.target = nodesTempArr[chosen];
			force.links().push({ source:linkElement.target, target:linkElement.source });
		}
		else
		{
			linkElement.source = nodesTempArr[chosen];
			linkElement.target = nodesTempArr[temp.name];
			force.links().push({ source:linkElement.source, target:linkElement.target });
		}
		linkElement.type = temp.type;
		tempLinks.push(linkElement);
		force.nodes().push(nodesTempArr[temp.name]);
	}
	force.start()
	for (var i = nodesTempArr[chosen].nodeNum*nodesTempArr[chosen].nodeNum /2; i > 0; --i) force.tick();
	force.stop();
	
	container.selectAll("#LayerZoomable")
				.data([0])
				.enter().append("circle")
				.attr("id","LayerZoomable")
				.attr("cx",(width - offSetx)/2 + offSetx)
				.attr("cy",height/2)
				.attr("r",500)
				.attr("opacity",0)
				.on("click",function(){resetScene(force.nodes())});
	
	paths = container.selectAll("#copyP").data(tempLinks);
	
	paths.attr("class", function(d) {return "link  " + d.type; })
   	 	 .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
   	 		
	paths.enter().append("path")
  			.attr("id","copyP")
  			.attr("opacity",function(d){ 
				for(var i in Boxes)
				{
					if(d.type == Boxes[i].name)
					{
		 				if(Boxes[i].checked) 
		 					return 1; 
		 				return 0;
		 			} 
		 		}
		 		return d3.select(this).attr("opacity");
			})
  			.attr("class", function(d) {return "link  " + d.type; })
   	 		.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
	
	paths.style("stroke",colorDet)
		.style("stroke-width",2)
		.on("mouseover",function(d){  mouseOverTool.transition()
      									.duration(500)
      									.style("opacity", 1);})
      	.on("mousemove",function(d){mouseOverTool.text(d.type)
      											.attr("text-anchor","middle")
      											.style("left", (d3.event.pageX - 35) + "px")
      											.style("top", (d3.event.pageY - 31) + "px");
      								})
		.on("mouseout",function(d){		mouseOverTool.transition()
      									.duration(50)
      									.style("opacity", 0);});
									
	paths.exit().remove();
	
	circles = container.selectAll("#copyC").data(force.nodes());
	
	circles.attr("cx",function(d){ d3.select(this).moveToFront(); return d.x;})
  			.attr("cy",function(d){ return d.y;})
    		.style("fill",function(d){ 
				var index = 0;
				for(i in years)
				{	
				console.debug(d);
					if(years[i] == d.year){return d3.rgb(255,183,183).darker(index*0.5);}
					index++;
				}
				})
    		.attr("r", function(d){ return 10 + 0.4 * nodesTempArr[d.name].nodeNum;});
    		
  	circles.enter().append("circle")
  			.attr("id","copyC")
  			.attr("cx",function(d){ return d.x;})
  			.attr("cy",function(d){ return d.y;})
			.style("fill",function(d){ 
				var index = 0;
				for(i in years)
				{	
					if(years[i] == d.year){return d3.rgb(255,183,183).darker(index*0.5);}
					index++;
				}
				})
    		.attr("r", function(d){ return 10 + 0.4 * nodesTempArr[d.name].nodeNum;})
    		.on("click" , function(d){
    		update(d.name);});
    
    circles.exit().remove();
	
	texts = container.selectAll("#copyT").data(force.nodes())
	
	texts.text(function(d){ d3.select(this).moveToFront();return d.name; });
	
	texts.enter().append("text")
  			.attr("id","copyT")
    		.attr("x", 8)
    		.attr("y", ".31em")
    		.text(function(d) { return d.name; });
    
    texts.exit().remove();
	 
	 force.on("tick",tick)
 	 .linkDistance(100)
 	 .gravity(0)
   	 .start(); 
	 }
 }
