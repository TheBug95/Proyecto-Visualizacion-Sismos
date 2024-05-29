// mapaSismos.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initMapaSismos() {
    const width = 1200;
    const height = 800;

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

        d3.csv("data/sismos.csv").then(sismos => {
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
                });
        });
    });
}
