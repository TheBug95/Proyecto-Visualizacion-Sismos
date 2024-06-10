// graficoFrecuencia.js

import { createTooltip, showTooltip, hideTooltip } from './utils.js';

export function initGraficoFrecuencia(data) {
    var widthYM = 1700, heightYM = 825;
    var svgYM = d3.select("#grafico-frecuencia").append("svg")
        .attr("width", widthYM)
        .attr("height", heightYM);

    updateGraficoFrecuencia(data, svgYM);
}

export function updateGraficoFrecuencia(data, svgYM = null) {
    var widthYM = 1700, heightYM = 825;
    var numYears = data.reduce((acc, curr) => acc.includes(curr.ano) ? acc : [...acc, curr.ano], []).length; // Número de años en los datos
    var cellHeight = (heightYM - 40) / 12; // Altura de cada celda considerando el espacio para el encabezado de los meses
    var yearWidth = (widthYM - 40) / numYears; // Ancho de cada celda para los años

    var svgYM = d3.select("#grafico-frecuencia")
        .append("svg")
        .attr("width", widthYM)
        .attr("height", heightYM);

    // Crear el tooltip
    var tooltip = createTooltip();

    // Transformar los datos para obtener la frecuencia mensual
    var nestedByYearMonth = Array.from(
        d3.rollups(
            data,
            v => ({
                count: v.length,
                minMag: d3.min(v, d => d.magnitud ? +d.magnitud : null),
                maxMag: d3.max(v, d => d.magnitud ? +d.magnitud : null)
            }),
            d => d.ano,
            d => d.mes
        ),
        ([key, values]) => ({
            key,
            values: Array.from(
                { length: 12 },
                (_, i) => ({
                    key: i + 1,
                    value: values.find(([month]) => month === i + 1)?.[1] || { count: 0, minMag: null, maxMag: null }
                })
            )
        })
    );

    console.log("Datos agrupados por año y mes:", nestedByYearMonth);

    nestedByYearMonth.sort((a, b) => d3.ascending(a.key, b.key));
    for (var i = 0; i < nestedByYearMonth.length; i++) {
        nestedByYearMonth[i].values.sort((a, b) => d3.ascending(+a.key, +b.key));
    }

    var minMonthlyMagnitude = d3.min(nestedByYearMonth, d => d3.min(d.values, d => d.value.count));
    var maxMonthlyMagnitude = d3.max(nestedByYearMonth, d => d3.max(d.values, d => d.value.count));

    console.log("nestedByYearMonth", nestedByYearMonth);

    var colorScaleMonth = d3.scaleLinear()
        .domain([
            minMonthlyMagnitude,
            minMonthlyMagnitude + 1,
            maxMonthlyMagnitude / 10,
            maxMonthlyMagnitude / 5,
            maxMonthlyMagnitude / 3,
            maxMonthlyMagnitude / 2,
            maxMonthlyMagnitude / 1.35,
            maxMonthlyMagnitude
        ])
        .range(["#FFFFFF", "#95fab9", "#77DD77", "#FFFD77", "#FFD700", "#FFB347", "#FF6961", "#fa5f49"])
        .interpolate(d3.interpolateHcl);

    var colorScaleYear = d3.scaleLinear()
        .domain([
            minMonthlyMagnitude,
            minMonthlyMagnitude + 1,
            maxMonthlyMagnitude / 10,
            maxMonthlyMagnitude / 5,
            maxMonthlyMagnitude / 3,
            maxMonthlyMagnitude / 2,
            maxMonthlyMagnitude / 1.35,
            maxMonthlyMagnitude
        ])
        .range(["#FFFFFF", "#95fab9", "#77DD77", "#FFFD77", "#FFD700", "#FFB347", "#FF6961", "#fa5f49"])
        .interpolate(d3.interpolateHcl);

    var years = nestedByYearMonth.map(d => +d.key);
    console.log("years", years);
    var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    var gYearMonth = svgYM.selectAll("g.year-group").data(nestedByYearMonth).enter().append("g").attr("class", "year-group");

    // Añadir recuadros y texto para años (horizontal)
    var yearGroups = gYearMonth.append("g")
        .attr("class", "year-rect-text");

    yearGroups.append("rect")
        .attr("x", (d, i) => 40 + i * yearWidth)
        .attr("y", 0)
        .attr("width", yearWidth)
        .attr("height", 40)
        .attr("fill", d => colorScaleYear(d3.sum(d.values, v => v.value.count)))
        .on("mouseover", function(event, d) {
            var htmlContent = `Año: ${d.key}<br>Frecuencia Total: ${d3.sum(d.values, v => v.value.count)}`;
            showTooltip(tooltip, htmlContent, event);
        })
        .on("mouseout", function() {
            hideTooltip(tooltip);
        });

    yearGroups.append("text")
        .attr("x", (d, i) => 40 + i * yearWidth + yearWidth / 2)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#000")
        .text(d => d.key);

    // Añadir recuadros y texto para meses (vertical)
    svgYM.selectAll(".month-group")
        .data(months)
        .enter()
        .append("g")
        .attr("class", "month-group")
        .each(function(month, i) {
            d3.select(this)
                .append("rect")
                .attr("x", 0)
                .attr("y", 40 + i * cellHeight)
                .attr("width", 40)
                .attr("height", cellHeight)
                .attr("fill", () => {
                    const totalMonthCount = nestedByYearMonth.reduce((acc, year) => {
                        const monthData = year.values.find(m => m.key === (i + 1));
                        return acc + (monthData ? monthData.value.count : 0);
                    }, 0);
                    return colorScaleMonth(totalMonthCount);
                })
                .on("mouseover", function(event) {
                    const totalMonthCount = nestedByYearMonth.reduce((acc, year) => {
                        const monthData = year.values.find(m => m.key === (i + 1));
                        return acc + (monthData ? monthData.value.count : 0);
                    }, 0);
                    var htmlContent = `Mes: ${months[i]}<br>Frecuencia Total: ${totalMonthCount}`;
                    showTooltip(tooltip, htmlContent, event);
                })
                .on("mouseout", function() {
                    hideTooltip(tooltip);
                });

            d3.select(this)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("x", 20)
                .attr("y", 40 + i * cellHeight + cellHeight / 2)
                .attr("font-size", "12px")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#000")
                .text(month);
        });

    var t = 0;
    gYearMonth.selectAll("g.month-rect")
        .data(d => d.values)
        .enter()
        .append("g")
        .attr("class", "month-rect")
        .append("rect")
        .attr("x", function(d, i, nodes) {
            var yearIndex = nestedByYearMonth.findIndex(year => year.key === d3.select(this.parentNode.parentNode).datum().key);
            return 40 + yearIndex * yearWidth;
        })
        .attr("y", (d, i) => 40 + i * cellHeight)
        .attr("width", yearWidth)
        .attr("height", cellHeight)
        .attr("fill", d => d.value.count > 0 ? colorScaleMonth(d.value.count) : "none")
        .on("mouseover", function(event, d) {
            var year = d3.select(this.parentNode.parentNode).datum().key;
            var htmlContent = `Año: ${year}<br>Mes: ${months[d.key - 1]}<br>Cantidad de Sismos: ${d.value.count}<br>Magnitud Mínima: ${d.value.minMag}<br>Magnitud Máxima: ${d.value.maxMag}`;
            showTooltip(tooltip, htmlContent, event);
        })
        .on("mouseout", function() {
            hideTooltip(tooltip);
        });
}
