// graficoMagnitudes.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initGraficoMagnitudes() {
    const width = 600;
    const height = 400;

    const svgMagnitudes = d3.select("#grafico-magnitudes")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.csv("data/magnitudes.csv").then(data => {
        data.forEach(d => {
            d.magnitud = +d.magnitud;
            d.profundidad = +d.profundidad;
            d.altitud = +d.altitud;
        });

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.fecha)))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.profundidad), d3.max(data, d => d.magnitud)])
            .range([height, 0]);

        const tooltip = createTooltip();

        svgMagnitudes.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svgMagnitudes.append("g")
            .call(d3.axisLeft(yScale));

        svgMagnitudes.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(new Date(d.fecha)))
        .attr("y", d => yScale(d.magnitud))
        .attr("width", 5)
        .attr("height", d => height - yScale(d.magnitud))
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            showTooltip(tooltip, "Magnitud: " + d.magnitud + "<br>Profundidad: " + d.profundidad, event);
        })
        .on("mouseout", function(d) {
            hideTooltip(tooltip);
        });

        svgMagnitudes.selectAll(".line")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", d => xScale(new Date(d.fecha)))
            .attr("y1", d => yScale(d.magnitud))
            .attr("x2", d => xScale(new Date(d.fecha)))
            .attr("y2", d => yScale(-d.profundidad))
            .attr("stroke", "purple")
            .attr("stroke-width", 2)
            .on("mouseover", function(event, d) {
                showTooltip(tooltip, "Fecha: " + d.fecha + "<br>Magnitud: " + d.magnitud + "<br>Profundidad: " + d.profundidad, event);
            })
            .on("mouseout", function(d) {
                hideTooltip(tooltip);
            });

        svgMagnitudes.selectAll(".circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(new Date(d.fecha)))
            .attr("cy", d => yScale(d.altitud))
            .attr("r", 3)
            .attr("fill", "violet")
            .on("mouseover", function(event, d) {
                showTooltip(tooltip, "Altitud: " + d.altitud, event);
            })
            .on("mouseout", function(d) {
                hideTooltip(tooltip);
            });
    });
}
