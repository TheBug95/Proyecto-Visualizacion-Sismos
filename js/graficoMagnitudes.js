// graficoMagnitudes.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initGraficoMagnitudes(data, updateMapaSismos, pauseAnimation, resumeAnimation) {
    var width = 800, height = 700;
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var svg = d3.select("#grafico-magnitudes")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    updateGraficoMagnitudes(data, updateMapaSismos, pauseAnimation, resumeAnimation, svg, innerWidth, innerHeight);
}


export function updateGraficoMagnitudes(data, updateMapaSismos,  pauseAnimation, resumeAnimation, svg = null, innerWidth = null, innerHeight = null) {
    var width = 800, height = 700;
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var animationDuration = 1280000; // Duración de la animación por años en milisegundos
    var displayMonths = 12; // Número de meses a mostrar en la ventana visible
    var timer; // Variable para almacenar el timer de d3
    var endDate; // Fecha final de los datos
    var currentDate; // Fecha actual de la animación
    var intervalTime; // Intervalo de tiempo entre cada paso de la animación
    var stepRate = 0.1; // Tiempo entre cada paso de la animación en milisegundos
    var first_year, last_year;
    var totalAnimationDuration;
    

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

    // Filtrar datos para eliminar fechas anteriores a 1975
    //data = data.filter(d => d.date_time >= new Date(1975, 0, 1));

    first_year = data[0].ano;
    last_year = data[data.length - 1].ano;

    totalAnimationDuration = (last_year - first_year) + 1;


    console.log("first_year", first_year);
    console.log("last_year", last_year);
    console.log("totalAnimationDuration", totalAnimationDuration);

    // Verificar la extensión de los datos
    var dateExtent = d3.extent(data, d => d.date_time);
    console.log("Fecha mínima y máxima en los datos:", dateExtent);

    // Escalas
    var xScale = d3.scaleTime()
        .domain([new Date(dateExtent[0]), currentDate]) // Asegurar que comience en 1975
        .range([0, innerWidth]); // Ampliar el rango para más separación entre meses

    var yMagnitudeScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.magnitude) || 1]) // evitar NaN si no hay datos
        .range([innerHeight / 2, 0]);

    var yDepthScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.depth) || 1]) // evitar NaN si no hay datos
        .range([0, innerHeight / 2]);

    var colorScaleMag = d3.scaleQuantize()
        .domain([d3.min(data, d => d.magnitude) || 0, d3.max(data, d => d.magnitude) || 1])
        .range(["#77DD77", "#FFD700", "#FFB347", "#FF6961", "#fa5f49"]);

    var colorScaleDepth = d3.scaleLinear()
        .domain([d3.min(data, d => d.depth) || 0, d3.max(data, d => d.depth) || 1])
        .range(["rgba(173, 216, 230, 0.6)", "rgba(148, 0, 211, 0.6)"]); // De azul claro a violeta claro pastel

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
        var lines = svg.selectAll(".magnitude-depth-line")
            .data(data, d => d.date_time);

        lines.exit().remove();

        lines.enter()
            .append("line")
            .attr("class", "magnitude-depth-line")
            .attr("x1", d => xScale(d.date_time))
            .attr("y1", d => yMagnitudeScale(d.magnitude) + d.magnitude * 2)
            .attr("x2", d => xScale(d.date_time))
            .attr("y2", d => innerHeight / 2 + yDepthScale(d.depth) - d.depth * 0.15)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .merge(lines)
            .attr("x1", d => xScale(d.date_time))
            .attr("y1", d => yMagnitudeScale(d.magnitude) + d.magnitude * 2)
            .attr("x2", d => xScale(d.date_time))
            .attr("y2", d => innerHeight / 2 + yDepthScale(d.depth) - d.depth * 0.15)
            .attr("stroke-width", 1);

        var circles = svg.selectAll(".quake-circle")
            .data(data, d => d.date_time);

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .attr("class", "quake-circle")
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => yMagnitudeScale(d.magnitude))
            .attr("r", d => d.magnitude * 2)
            .attr("fill", d => colorScaleMag(d.magnitude))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                timer.stop(); // Detener la animación al hacer hover
                var htmlContent = `Fecha: ${d.date_time.toDateString()}<br>Magnitud: ${d.magnitude}`;
                showTooltip(tooltip, htmlContent, event);
            })
            .on("mouseout", function() {
                hideTooltip(tooltip);
                timer = d3.interval(step, intervalTime); // Reanudar la animación al salir del hover
            })
            .merge(circles)
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => yMagnitudeScale(d.magnitude))
            .attr("r", d => d.magnitude * 2)
            .attr("fill", d => colorScaleMag(d.magnitude))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        var depthCircles = svg.selectAll(".depth-circle")
            .data(data, d => d.date_time);

        depthCircles.exit().remove();

        depthCircles.enter()
            .append("circle")
            .attr("class", "depth-circle")
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => innerHeight / 2 + yDepthScale(d.depth)) // Ajuste para eje Y negativo
            .attr("r", d => d.depth * 0.15)
            .attr("fill", d => colorScaleDepth(d.depth))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                timer.stop(); // Detener la animación al hacer hover
                var htmlContent = `Fecha: ${d.date_time.toDateString()}<br>Profundidad: ${d.depth}`;
                showTooltip(tooltip, htmlContent, event);
            })
            .on("mouseout", function() {
                hideTooltip(tooltip);
                timer = d3.interval(step, intervalTime); // Reanudar la animación
            })
            .merge(depthCircles)
            .attr("cx", d => xScale(d.date_time))
            .attr("cy", d => innerHeight / 2 + yDepthScale(d.depth))
            .attr("r", d => d.depth * 0.15)
            .attr("fill", d => colorScaleDepth(d.depth))
            .attr("fill-opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        updateMapaSismos(data); // Actualizar el mapa con los datos actuales
    }

    function step() {
        currentDate = d3.timeHour.offset(currentDate, 18);
        console.log("currentDate", currentDate);    

        if (currentDate > endDate) {
            timer.stop();
            return;
        }

        // Actualizar día, mes y año en la interfaz de usuario
        var vueInstance = document.querySelector('#app').__vue__;
        vueInstance.dia = currentDate.getDate();
        vueInstance.mes = currentDate.getMonth() + 1; // Los meses en JavaScript son 0-11
        vueInstance.ano = currentDate.getFullYear();

        var displayData = data.filter(d => d.date_time <= currentDate && d.date_time >= d3.timeMonth.offset(currentDate, -2));
        update(displayData);

        // Desplazar el dominio de la escala X para mantener el efecto de "cinta caminadora"
        var start = d3.timeMonth.offset(currentDate, -2);
        xScale.domain([start, currentDate]);
        xAxisGroup.call(xAxis);
    }

    // Función para iniciar la animación
    function animateData() {
        var startDate = new Date(dateExtent[0]);
        endDate = new Date(dateExtent[1]);
        console.log("startDate", startDate);    
        var totalDays = d3.timeDay.count(startDate, endDate);
        intervalTime = (totalAnimationDuration * animationDuration) / (totalDays / stepRate); // Ajustar el intervalo de tiempo para cada paso

        currentDate = startDate;

        timer = d3.interval(step, intervalTime);
    }

    animateData();
}

// Pausar y reanudar la animación
export function pauseAnimation() {
    if (timer) timer.stop();
}

export function resumeAnimation() {
    if (!timer) timer = d3.interval(step, intervalTime);
}
