/* 
// WRITE YOUR JAVASCRIPT BELOW THIS COMMENT 
Your name : Bartoletti Brice
Date : 12/11/2019
Contact information :  
What does this script do ? 
...
*/

// This function get datas from tables from an HTML using the D3 selector
const getDataFromHTMLTable = (stringCSSPathToTheTableRows) => {
    let data = [];
    // getting the row of the table in an object, taking out the nodes and turning them into an arrayLike Object
    let tableRows = d3.selectAll(stringCSSPathToTheTableRows);
    tableRows = [...tableRows.nodes()];
    // Collect data by putting it into arrays
    let tableHeaders = [];
    for (let i = 0; i < tableRows.length; i++) {
        const arrCellsOfCurrentRow = [...tableRows[i].cells];
        let countryData = [];
        for (let j = 1; j < arrCellsOfCurrentRow.length; j++) {
            if (i == 0) {                                                                                   // First iteration for the data Names 
                if (j == 1) {
                    tableHeaders[j - 1] = "country";
                } else {
                    tableHeaders[j - 1] = arrCellsOfCurrentRow[j].innerText;
                }
            } else {                                                                                        // Next iterations to get the datas
                countryData[j - 1] = arrCellsOfCurrentRow[j].innerText
                countryData[j - 1] = countryData[j - 1].replace(/[,]/g, '.')                                // replacing "," by "." to avoid error during calculation
            }
        }
        if (i != 0) {                                                                                       // For every iteration except first, melt the arrays into an object and push it into the data array
            data[i - 1] = Object.fromEntries(tableHeaders.map((a, i) => [tableHeaders[i], countryData[i]]))
        }
    }
    return [data, tableHeaders];
}

// data from table One
let dataTableOne = getDataFromHTMLTable("#table1 > tbody:nth-child(3) > tr")

// convert data the absolute data from table One to relative data
for( let i = 0; i < dataTableOne[0].length; i++){
    for(let j = 2012; j >= 2002; j--){
        dataTableOne[0][i][`${j}`] = dataTableOne[0][i][`${j}`] / dataTableOne[0][i]["2002"]
    }   
}

const getAllDataInOneArr = (dataToGather) => {
    let bigArr = []
    dataToGather.forEach( obj =>{
        let valuesArr = Object.values(obj)
        valuesArr.pop()
        bigArr.push(...valuesArr)
    })
    console.log(bigArr);
}
getAllDataInOneArr(dataTableOne[0])

// add SVG for datatableOne
const dates = dataTableOne[1]
dates.shift()
const dataset = dataTableOne[0]
// console.log(dataset);

const w = "100%";
const h = 300;
const padding = 5;
// const padding = 
const xDataMin = d3.min(dates, d => d)
const xDataMax = d3.max(dates, d => d)

// A MODIFIER POUR Y 
const yDataMin = d3.min(getAllDataInOneArr(dataset), d => d)
const yDataMax = d3.max(getAllDataInOneArr(dataset), d => d)


const svg = d3.select('#mw-content-text').insert("svg", "#table1")
                .attr("width", w)
                .attr("height", h)
const xScale = d3.scaleLinear().domain([xDataMin, xDataMax]).range([padding, w - padding])
const yScale = d3.scaleLinear().domain([]).range([h - padding, padding])






// data from tableTwo
// let dataTableTwo = getDataFromHTMLTable("#table2 tr")
// console.log(dataTableTwo);

// Note: pour le graphique, le contenu du texte indique que ce qui compte est l'évolution des données dans le temps.
// Il faut donc créer une courbe par pays en fonction du temps que l'on superposera sur un graphique
// Il est à noter que vu que c'est l'évolution qui est évaluée et non les valeurs absolues
// Il est plus pertinent de formater les données en les rendant relatives, ce qui élimine le biais des quantités d'habitants.
// donnée relative x = Donnée x / donnée initiale
