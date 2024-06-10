// main.js

import { initGraficoFrecuencia, updateGraficoFrecuencia } from './graficoFrecuencia.js';
import { initMapaSismos, updateMapaSismos } from './mapaSismos.js';
import { initGraficoMagnitudes, updateGraficoMagnitudes, pauseAnimation, resumeAnimation } from './graficoMagnitudes.js';

new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        primerAno: null,
        segundoAno: null,
        riesgo: 'no',
        provincia: null,
        fecha: null,
        dia: '',
        mes: '',
        ano: '',
        sliderValue: 0,
        isPlaying: false,
        timer: null,
        totalDays: 365,
        anos: [1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
        provincias: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'],
        sismos: [], // Aquí cargaremos los datos de sismos
        filteredSismos: [] // Datos filtrados
    },
    watch: {
        fecha(newFecha) {
            if (newFecha) {
                const fechaObj = new Date(newFecha);
                this.dia = this.sismos[dia];
                this.mes = this.sismos[mes];
                this.ano = this.sismos[ano];
            } else {
                this.dia = '';
                this.mes = '';
                this.ano = '';
            }
        },
        sliderValue(newValue) {
            const startDate = new Date(this.ano, 0, 1);
            const newDate = new Date(startDate.setDate(newValue));
            this.fecha = newDate.toISOString().substring(0, 10);
        },
        primerAno() {
            this.filterData();
        },
        segundoAno() {
            this.filterData();
        }
    },
    methods: {
        playPause() {
            if (this.isPlaying) {
                clearInterval(this.timer);
                this.isPlaying = false;
            } else {
                this.timer = setInterval(() => {
                    if (this.sliderValue < this.totalDays) {
                        this.sliderValue += 1;
                    } else {
                        clearInterval(this.timer);
                        this.isPlaying = false;
                    }
                }, 1000); // Intervalo de 1 segundo
                this.isPlaying = true;
            }
        },
        onSliderChange(value) {
            this.sliderValue = value;
        },
        loadData() {
            // Aquí cargaríamos los datos de los sismos desde el CSV
            d3.csv("data/sismos102original.csv").then(data => {
                this.sismos = data.map(d => {
                    const year = +d.year;
                    const month = +d.month; // Los meses en JavaScript son 0-11
                    const day = +d.day;
                    const hour = +d.hour;
                    const minute = +d.minute;
                    const second = +d.second;
                    const fecha = new Date(year, month, day, hour, minute, second);
        
                    return {
                        dia: day,
                        mes: month, // Los meses en JavaScript son 0-11
                        ano: year,
                        fecha: fecha,
                        magnitud: +d.magnitude,
                        longitud: +d.longitude,
                        latitud: +d.latitude,
                        profundidad: +d.depth,
                        rms: +d.RMS
                    };
                });
        
                // Calcular totalDays basado en el rango de fechas en los datos
                const fechas = this.sismos.map(d => d.fecha);
                const minFecha = new Date(Math.min.apply(null, fechas));
                const maxFecha = new Date(Math.max.apply(null, fechas));
                this.totalDays = (maxFecha - minFecha) / (1000 * 60 * 60 * 24);
        
                console.log("Datos originales:", data);
                console.log("Datos transformados:", this.sismos);

                // Inicializar visualizaciones
                this.filterData();
            });
        },
        filterData() {
            if (this.primerAno && this.segundoAno) {
                this.filteredSismos = this.sismos.filter(d => d.ano >= this.primerAno && d.ano <= this.segundoAno);

                // Inicializar visualizaciones con los datos filtrados
                updateGraficoFrecuencia(this.filteredSismos);
                updateMapaSismos(this.filteredSismos,  pauseAnimation, resumeAnimation);
                updateGraficoMagnitudes(this.filteredSismos, updateMapaSismos,  pauseAnimation, resumeAnimation);
            }
        },
        clearFilters() {
            this.primerAno = null;
            this.segundoAno = null;
            this.dia = '';
            this.mes = '';
            this.ano = '';
            this.sliderValue = 0;
            this.isPlaying = false;
            if (this.timer) {
                clearInterval(this.timer);
            }
            // Reiniciar las visualizaciones
            updateGraficoFrecuencia([]);
            updateMapaSismos([], pauseAnimation, resumeAnimation);
            updateGraficoMagnitudes([], updateMapaSismos, pauseAnimation, resumeAnimation);
        }
    },
    mounted() {
        this.loadData();
    }
});
