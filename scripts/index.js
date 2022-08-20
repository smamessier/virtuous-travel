const climatiqApiKey = "6WWYMQ0NYY4GZJJ7E8Y6TTB7WXHY";
const axios = require("axios");
const csvParser = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const dfd = require("danfojs-node");

console.log(axios);

const COUNTRIES = ['France', 'United Kingdom', 'Germany', 'Spain', 'Italy', 'Netherlands',
                   'Belgium', 'Austria', 'Switzerland'];

const CLIMATIQ_HOST = "https://beta3.api.climatiq.io/travel/flights";

axios.interceptors.request.use(function (config) {
        config.headers.Authorization = `Bearer ${climatiqApiKey}`;
        return config;
});


function getCityList(){
    filteredList = [];

    fs.createReadStream('./airports.csv')
        .pipe(csvParser(['city', 'country', 'airport']))
        .on('data', (row) => {
            if (COUNTRIES.includes(row.country)){
                //console.log(row);
                filteredList.push(row);
            }
        })
        .on('end', () => {
            console.log('CSV file processed successfully');
            console.log(filteredList);
            console.log(`${filteredList.length} airports added to the list.`);
        });
}


function prepareRequest(fromCode, toCode){
    return {
        legs: [
            {
                from: fromCode,
                'to': toCode,
                passengers: 1,
                "class": "economy"
            }
        ]
    }
}

async function fetchData(fromCity, toCity){
    const payload = prepareRequest(fromCity.airport, toCity.airport);
    console.log(payload);
    try {
        const response = await axios.post(CLIMATIQ_HOST, payload);
        console.log(JSON.stringify(response.data, null, 4));
        const co2_kg = response.data.co2e;
        
    }
    catch (e){
        console.log(e);
    }
}

async function genDB(){
    // Prioritizing fetching data for a few countries
    const dfCities = await dfd.readCSV('./airports.csv');
    const selectedRows = dfCities.index.filter(
        idx => COUNTRIES.includes(dfCities['country'].values[idx]));
    const dfCitiesP = dfCities.loc({rows: selectedRows});

    // Retrieving current state of local emission database
    const dfEmissions = await dfd.readCSV('./emissions.csv');
    dfEmissions.head().print();
}


genDB();
//getCityList();
//fetchData({ airport: 'TLS'}, { airport: 'HAM'});
