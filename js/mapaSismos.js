import { createTooltip, showTooltip, hideTooltip } from './utils.js';

var svgMapa, projection, tooltip;
var pauseAnimation, resumeAnimation;

export function initMapaSismos(sismos, pauseFunc, resumeFunc) {
    const width = 825;
    const height = 700;

    pauseAnimation = pauseFunc; // Asignar funciones de control de animación
    resumeAnimation = resumeFunc;

    // Limpiar el mapa existente antes de volver a inicializar
    d3.select("#mapa-sismos").selectAll("*").remove();

    svgMapa = d3.select("#mapa-sismos")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("geojson/costa_rica.json").then(function(data) {
        projection = d3.geoMercator().fitSize([width, height], data);
        const path = d3.geoPath().projection(projection);

        svgMapa.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "#333");

        tooltip = createTooltip();

        updateMapaSismos(sismos); // Inicializar con los sismos actuales
    });
}

export function updateMapaSismos(sismos) {
    if (!svgMapa || !projection || !tooltip) return; // Asegurarse de que todo está inicializado

    svgMapa.selectAll("circle").remove();

    const circles = svgMapa.selectAll("circle")
        .data(sismos, d => d.fecha);

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .attr("cx", d => projection([d.longitud, d.latitud])[0])
        .attr("cy", d => projection([d.longitud, d.latitud])[1])
        .attr("r", d => d.magnitud * 2.5)
        .attr("fill", d => "#FF6961")
        .attr("fill-opacity", 0.6)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            showTooltip(tooltip, "Magnitud: " + d.magnitud + "<br>Fecha: " + d.fecha, event);
        })
        .on("mouseout", function() {
            hideTooltip(tooltip);
        })
        .merge(circles)
        .attr("cx", d => projection([d.longitud, d.latitud])[0])
        .attr("cy", d => projection([d.longitud, d.latitud])[1])
        .attr("r", d => d.magnitud * 2.5)
        .attr("fill", d => "#FF6961")
        .attr("fill-opacity", 0.6)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}
