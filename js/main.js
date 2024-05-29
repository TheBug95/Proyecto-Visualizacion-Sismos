// main.js

import { initGraficoFrecuencia } from './graficoFrecuencia.js';
import { initMapaSismos } from './mapaSismos.js';
import { initGraficoMagnitudes } from './graficoMagnitudes.js';

new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        primerAno: null,
        segundoAno: null,
        riesgo: 'no',
        provincia: null,
        fecha: null,
        anos: [1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
        provincias: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón']
    },
    methods: {
        play() {
            // Lógica para iniciar la animación
        },
        pause() {
            // Lógica para pausar la animación
        }
    },
    mounted() {
        initGraficoFrecuencia();
        initMapaSismos();
        initGraficoMagnitudes();
    }
});
