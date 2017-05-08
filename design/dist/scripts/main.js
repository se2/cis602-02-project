"use strict";var drawMap=function(e,t,a,r,n,o,u,c,s){function i(){var e=d3.select(this).attr("id"),t=d3.select(this),a="#nyc-map-info";if(d3.select("#nyc-map-svg .map-highlight").classed("map-highlight",!1),t.classed("map-highlight",!0),d3.select(a).select(".line-chart").remove(),d3.select(a).select(".legend").remove(),d3.select(a).select(".pie").remove(),void 0!==_.keyBy(r,"key")[e]){var c=+_.keyBy(r,"key")[e].value,s=+_.keyBy(o,"key")[e].value;drawLine(a,n,u,e),drawLegend(a,[c,s]),drawPie(a,[c,s])}}var d=$(c),l=$(s),p=(countValues(_.union(r,o),"value"),_.maxBy(r,function(e){return e.value}),getTotalCountInMap(e,r));l.html(numeral(p).format());var f=d.width()-a,m=d.height(),h=d3.geoCentroid(e),v=[f/2,m/2],t=t,g=d3.select(c).append("svg").attr("id","nyc-map-svg").attr("width",f).attr("height",m),j=d3.scaleSequential(d3.interpolateReds).domain([192,0]),y=d3.geoMercator().scale(t).center(h).precision(.1).translate(v),b=d3.geoPath().projection(y),k=function(e){return r.map(function(e){return e.key}).indexOf(e)};g.append("g").attr("transform","translate(0,0)").selectAll("path").data(e.features).enter().append("path").attr("fill",function(e){return-1==k(e.properties.NTACode)?"white":j(k(e.properties.NTACode))}).attr("d",b).attr("stroke","grey").attr("stroke-width",.5).attr("id",function(e){return e.properties.NTACode}).on("click",i).append("title").text(function(e){var t=0,a=_.split(_.replace(_.replace(e.properties.NTAName,/etc-/,""),/-/g,"/"),"/");r.map(function(a){a.key==e.properties.NTACode&&(t=a.value)}),a=a.map(function(e){return _.capitalize(e)});var n=numeral(t).format();return 0==t&&(n="No Data"),_.join(a,"/")+": "+n})},barW=350,barH=300,barMargin={top:5,bottom:85,left:85,right:5},barX=d3.scaleBand().padding(.1),barY=d3.scaleLinear(),barXAxis=null,drawInfo=function(e){var t=$(e),a=t.height();d3.select(e).append("svg").attr("id","nyc-map-info").attr("width",500).attr("height",a)},drawLine=function(e,t,a,r){var n=[];if(_.each(t,function(e,t){var o={key:a[t].value,value:_.keyBy(countValues(e),"key")};void 0!==o.value[r]&&(n[t]=o,n[t].value=n[t].value[r].value)}),n.length>0){var o=d3.scaleBand().rangeRound([0,barW]).padding(20),u=d3.scaleLinear().range([barH,0]);o.domain(n.map(function(e){return e.key})),u.domain([d3.min(n,function(e){return e.value})/2,1.2*d3.max(n,function(e){return e.value})]);var c=d3.axisBottom(o),s=d3.axisLeft(u).ticks(10),i=d3.select(e).append("svg").attr("class","line-chart").attr("width",barW+barMargin.left+barMargin.right).attr("height",barH+barMargin.top+barMargin.bottom).append("g").attr("transform","translate("+barMargin.left+","+barMargin.top+")").classed("line",!0),d=d3.line().x(function(e){return o(e.key)}).y(function(e){return u(e.value)});i.append("path").datum(n).attr("fill","transparent").attr("stroke","#7BA1C2").attr("stroke-width",2).attr("d",d);i.append("g").attr("class","line xAxis").attr("transform","translate(0,"+barH+")").call(c),i.append("g").attr("class","line yAxis").call(s),i.append("g").attr("transform","translate(-70,"+barH/2+") rotate(-90)").append("text").style("text-anchor","middle").text("Total Pickups"),i.append("text").attr("x",barW/2).attr("y",barH+50).style("text-anchor","middle").text(r)}},drawPie=function(e,t){var t=[{name:"Uber",count:t[0],percentage:numeral(t[0]/_.sum(t)*100).format("0.00"),color:"#222233"},{name:"FHV",count:t[1],percentage:numeral(t[1]/_.sum(t)*100).format("0.00"),color:"#f7b731"}],a=d3.arc().outerRadius(115).innerRadius(0),r=d3.pie().sort(null).value(function(e){return e.count}),n=d3.select(e).append("g").attr("class","pie").attr("transform","translate("+350/1.5+",600)"),o=n.selectAll(".arc").data(r(t)).enter().append("g");o.append("path").attr("d",a).style("fill",function(e,t){return e.data.color}),o.append("text").attr("transform",function(e){var t=a.centroid(e);return t[0]*=2.6,t[1]*=2.6,"translate("+t+")"}).attr("dy",".50em").style("text-anchor","middle").text(function(e){return e.data.percentage+"%"})},drawLegend=function(e,t){var t=[{name:"Uber",count:t[0],percentage:numeral(t[0]/_.sum(t)*100).format("0.00"),color:"#222233"},{name:"FHV",count:t[1],percentage:numeral(t[1]/_.sum(t)*100).format("0.00"),color:"#f7b731"}],a=d3.select(e).append("g").attr("class","legend").attr("transform","translate(100, 450)").selectAll("g").data(t).enter().append("g").attr("class",function(e){return e.name}).attr("transform",function(e,t){return"translate(0,"+10*t*2+")"});a.append("text").attr("font-size",12).attr("text-anchor","end").attr("x",336.5).attr("y",4.5).text(function(e){return e.name}),a.append("circle").attr("cx",350).attr("cy",0).attr("r",9).attr("fill",function(e){return e.color})},dataViz=function(e,t,a,r,n,o,u,c,s,i,d,l,p,f,m,h,v){if(e)throw e;var g=countValues(_.union(n,o,u,c,s,i),"value"),j=countValues(_.union(d,l,p,f,m,h),"value"),y=[n,o,u,c,s,i],b=[{key:0,value:"Jan"},{key:1,value:"Feb"},{key:2,value:"Mar"},{key:3,value:"Apr"},{key:4,value:"May"},{key:5,value:"Jun"}];_.each(y,function(e,t){var a={name:b[t].value,value:_.sumBy(e,"value")};y[t]=a}),drawMap(t,75e3,500,g,[n,o,u,c,s,i],j,b,"#nyc-uber-bar",".totalNYCUberPickups"),drawInfo("#nyc-uber-bar")},processFHVData=function(e){return e=e.map(function(e){var t="";return zones.map(function(a){a.location_id===e.locationID&&264!=a.location_id&&265!=a.location_id&&(t=a.ntacode)}),e.ntacode=t,e}),e=e.filter(function(e){if(""!=e.locationID&&""!=e.ntacode)return e})},processUberData=function(e,t){var a=[{key:0,value:"January 2015"},{key:1,value:"February 2015"},{key:2,value:"March 2015"},{key:3,value:"April 2015"},{key:4,value:"May 2015"},{key:5,value:"June 2015"}],r=a[t];return e=_.orderBy(_.filter(e,function(e){return moment(new Date(e.Pickup_date)).month()===r.key}),["Pickup_date"],["asc"]),_.each(e,function(e){return _.each(e,function(t,a){return e[a]=t.trim()})}),e=e.map(function(e){var t="";return zones.map(function(a){a.location_id===e.locationID&&(t=a.ntacode)}),e.ntacode=t,e}),_.orderBy(_.map(_.countBy(e,"ntacode"),function(e,t){return{key:t,value:e}}),"value","desc")},getTotalCountInMap=function(e,t){var a=0;return _.each(e.features,function(e){_.each(t,function(t){t.key==e.properties.NTACode&&(a+=t.value)})}),a},countValues=function(e){var t=_(e).groupBy("key").map(function(e,t){return{key:t,value:_.sumBy(e,"value")}}).value();return t=_.filter(t,function(e){return""!=e.key&&"undefined"!=e.key}),_.orderBy(t,"value","desc")};d3.queue().defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/design/nyc.geo.2.json").defer(d3.csv,"https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv_bases.csv").defer(d3.csv,"https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/taxi-zone-lookup-with-ntacode.csv").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/jan.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/feb.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/mar.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/apr.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/may.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/jun.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-01.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-02.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-03.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-04.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-05.json").defer(d3.json,"https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-06.json").defer(d3.json,"https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json").await(dataViz);