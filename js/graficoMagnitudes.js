// graficoMagnitudes.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initGraficoMagnitudes(data) {
    var width = 800, height = 600;
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var animationDuration = 600000; // Duración de la animación total en milisegundos (5 minutos)
    var displayMonths = 12; // Número de meses a mostrar en la ventana visible

    var svg = d3.select("#grafico-magnitudes")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Crear el tooltip
    var tooltip = createTooltip();

    // Convertir las fechas a objetos de fecha
    data.forEach(d => {
        d.date_time = new Date(d.ano, d.mes - 1, d.dia);
        d.magnitude = +d.magnitud;
        d.depth = +d.profundidad;
    });

    // Ordenar los datos por fecha
    data.sort((a, b) => d3.ascending(a.date_time, b.date_time));

    // Escalas
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date_time))
        .range([0, innerWidth * 3]); // Ampliar el rango para más separación entre meses

    var yMagnitudeScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.magnitude) || 1]) // evitar NaN si no hay datos
        .range([innerHeight / 2, 0]);

    var yDepthScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.depth) || 1]) // evitar NaN si no hay datos
        .range([0, innerHeight / 2]);

    var colorScaleMag = d3.scaleLinear()
        .domain([d3.min(data, d => d.magnitude) || 0, d3.max(data, d => d.magnitude) || 1])
        .range(["khaki", "red"]);

    var colorScaleDepth = d3.scaleLinear()
        .domain([d3.min(data, d => d.depth) || 0, d3.max(data, d => d.depth) || 1])
        .range(["midnightblue", "lightcyan"]);

    // Ejes
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b-%Y")).ticks(d3.timeMonth.every(1));
    var yAxisMagnitude = d3.axisLeft(yMagnitudeScale);
    var yAxisDepth = d3.axisLeft(yDepthScale).tickFormat(d3.format(".0f"));

    var xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight / 2})`)
        .call(xAxis);

    xAxisGroup.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)");

    svg.append("g")
        .attr("class", "y-axis y-axis-magnitude")
        .call(yAxisMagnitude);

    svg.append("g")
        .attr("class", "y-axis y-axis-depth")
        .attr("transform", `translate(0, ${innerHeight / 2})`)
        .call(yAxisDepth);

    // Función de actualización de datos
    function update(data) {
        var circles = svg.selectAll(".quake-circle")
            .data(data, d => d.date_time);

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .attr("class", "quake-circle")
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => yMagnitudeScale(d.magnitude))
            .attr("r", 3)
            .attr("fill", d => colorScaleMag(d.magnitude))
            .on("mouseover", function(event, d) {
                var htmlContent = `Fecha: ${d.date_time.toDateString()}<br>Magnitud: ${d.magnitude}`;
                showTooltip(tooltip, htmlContent, event);
            })
            .on("mouseout", function() {
                hideTooltip(tooltip);
            })
            .merge(circles)
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => yMagnitudeScale(d.magnitude))
            .attr("r", 3)
            .attr("fill", d => colorScaleMag(d.magnitude));

        var depthCircles = svg.selectAll(".depth-circle")
            .data(data, d => d.date_time);

        depthCircles.exit().remove();

        depthCircles.enter()
            .append("circle")
            .attr("class", "depth-circle")
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => innerHeight / 2 + yDepthScale(d.depth)) // Ajuste para eje Y negativo
            .attr("r", 3)
            .attr("fill", d => colorScaleDepth(d.depth))
            .on("mouseover", function(event, d) {
                var htmlContent = `Fecha: ${d.date_time.toDateString()}<br>Profundidad: ${d.depth}`;
                showTooltip(tooltip, htmlContent, event);
            })
            .on("mouseout", function() {
                hideTooltip(tooltip);
            })
            .merge(depthCircles)
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => innerHeight / 2 + yDepthScale(d.depth))
            .attr("r", 3)
            .attr("fill", d => colorScaleDepth(d.depth));
    }

    // Función para iniciar la animación
    function animateData() {
        var startDate = data[0].date_time;
        var endDate = data[data.length - 1].date_time;
        var totalDays = d3.timeDay.count(startDate, endDate);
        var intervalTime = animationDuration / totalDays;

        var currentDate = startDate;
        var index = 0;

        function step() {
            currentDate = d3.timeDay.offset(currentDate, 1);

            if (currentDate > endDate) {
                clearInterval(interval);
                return;
            }

            var displayData = data.filter(d => d.date_time <= currentDate && d.date_time >= d3.timeMonth.offset(currentDate, -displayMonths));
            update(displayData);

            xScale.domain([d3.timeMonth.offset(currentDate, -displayMonths), currentDate]);
            xAxisGroup.call(xAxis);

            index++;
        }

        var interval = setInterval(step, intervalTime);
    }

    animateData();
}
