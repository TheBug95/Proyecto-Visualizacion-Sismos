// graficoFrecuencia.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initGraficoFrecuencia() {
    const width = 600;
    const height = 400;

    const svgFrecuencia = d3.select("#grafico-frecuencia")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.csv("data/frecuencias_sismicas.csv").then(data => {
        data.forEach(d => {
            d.frec = +d.frec;
        });

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.anio))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.frec)])
            .range([height, 0]);

        const tooltip = createTooltip();

        svgFrecuencia.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svgFrecuencia.append("g")
            .call(d3.axisLeft(yScale));

        svgFrecuencia.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.anio))
            .attr("y", d => yScale(d.frec))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.frec))
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                showTooltip(tooltip, "Frecuencia: " + d.frec, event);
            })
            .on("mouseout", function(d) {
                hideTooltip(tooltip);
            });
    });
}
