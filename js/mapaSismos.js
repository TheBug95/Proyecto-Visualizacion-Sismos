// mapaSismos.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initMapaSismos(sismos) {
    const width = 550;
    const height = 400;

    const svgMapa = d3.select("#mapa-sismos")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("geojson/costa_rica.json").then(function(data) {
        const projection = d3.geoMercator().fitSize([width, height], data);
        const path = d3.geoPath().projection(projection);

        svgMapa.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "#333");

<<<<<<< HEAD
        /* d3.csv("data/sismos.csv").then(sismos => {
            const tooltip = createTooltip();

            svgMapa.selectAll("circle")
                .data(sismos)
                .enter()
                .append("circle")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                .attr("r", d => Math.sqrt(d.magnitud) * 2)
                .attr("fill", "red")
                .attr("opacity", 0.6)
                .on("mouseover", function(event, d) {
                    showTooltip(tooltip, "Magnitud: " + d.magnitud + "<br>Fecha: " + d.fecha, event);
                })
                .on("mouseout", function(d) {
                    hideTooltip(tooltip);
                }); */

        let size = d3.scaleSqrt()
            .domain(valueExtent) // Que hay en los datos?
            .rang([1, 20]) //tamaño del circulo en pixeles

        d3.csv("data/sismos_1975-2024.csv", (sismos) => {

        svgMapa
            .selectAll("CR_Sismos")
            .data(sismos.filter((d) => { return d.year == "1975" }))
            .enter()
            .append("circle")
            .attr("cx", d => projection([+d.longitude, +d.latitude])[0] )
            .attr("cy", d => projection([+d.longitude, +d.latitude])[1] )
            .attr("r",  d => size(d.magnitude + 1) + 2 )
            .style("fill", "red" /* (d) => { return color(d.month) } */)
            /* .attr("stroke-width", 1) */
            /* .attr("fill-opacity", 0.6) */
            .attr("opacity", 0.6)
            .on("mouseover", () => { return tooltip.style("visibility", "visible"); })
            .on("mousemove", (d) => { 
                tooltip.text(d.year + ' (' + d.month + ' Mes)');
                   return tooltip.style("top", 
                (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        });
     })
 });

/*     //Datos de los sismos
    d3.csv("data/sismos_1975-2022.csv", (sismos) => {

        //Escala de colores
        let color = d3.scale.category20();

        //Se agrega una escala para el tamaño de la burbuja
        let valueExtent = d3.extent(sismos, (d) => { return d.magnitude; })
        let size = d3.scaleSqrt()
            .domain(valueExtent) // Que hay en los datos?
            .rang([1, 20]) //tamaño del circulo en pixeles

        let tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("padding", "15px")
            .style("font", "12px sans-serif")
            .style("background", "#03bafc")
            .style("border", "0px")
            .style("border-radius", "8px")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("a simple tooltip"); */

/*         svgMapa
            .selectAll("CR_Sismos")
            .data(sismos.filter((d) => { return d.year == "1975" })) */
            /* .data(data.sort((a, b) => { return +b.magnitude - +a.magnitude }).filter((d, i) => { return i < 1000 })) */
/*             .enter()
            .append("circle")
            .attr("cx", (d) => { return projection([+d.longitude, +d.latitude])[0] })
            .attr("cy", (d) => { return projection([+d.longitude, +d.latitude])[1] })
            .attr("r",  (d) => { return size(d.magnitude + 1) + 2 })
            .style("fill", "red" /* (d) => { return color(d.month) } ) */
            /* .attr("stroke-width", 1) */
            /* .attr("fill-opacity", 0.6) */
/*             .attr("opacity", 0.6)
            .on("mouseover", () => { return tooltip.style("visibility", "visible"); })
            .on("mousemove", (d) => { 
                tooltip.text(d.year + ' (' + d.month + ' Mes)');
                return tooltip.style("top", 
                    (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            }); */
    /* });  */
=======
        const tooltip = createTooltip();

        svgMapa.selectAll("circle")
            .data(sismos)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.longitud, d.latitud])[0])
            .attr("cy", d => projection([d.longitud, d.latitud])[1])
            .attr("r", d => Math.sqrt(d.magnitud) * 2)
            .attr("fill", "red")
            .attr("opacity", 0.6)
            .on("mouseover", function(event, d) {
                showTooltip(tooltip, "Magnitud: " + d.magnitud + "<br>Fecha: " + d.fecha, event);
            })
            .on("mouseout", function(d) {
                hideTooltip(tooltip);
            });
    });
>>>>>>> 0caa8d52469ebec5f56d6feba401b8a66877ee54
}
