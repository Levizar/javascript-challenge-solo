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
                countryData[j - 1] = countryData[j - 1].replace(/[,]/g, '.')                                // replacing "," by "." for calculation
            }
        }
        if (i != 0) {                                                                                       // 
            data[i - 1] = tableHeaders.map((a, i) => [tableHeaders[i], countryData[i]])
        }
    }
    return data;
}

const parseToLineData = arrayOfCountry => {
    let parsedLineData = [];
    let colorArray = [
        '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
    ];
    for (let i = 0; i < arrayOfCountry.length; i++) {
        let parsedObjCountry = {
            data: []
        };
        for (let j = 0; j < arrayOfCountry[i].length; j++) {
            if (j == 0) {
                parsedObjCountry.key = arrayOfCountry[i][j][1]
                parsedObjCountry.light = colorArray[i]
            } else {
                if (arrayOfCountry[i][j][1] != ":") {
                    parsedObjCountry.data.push(arrayOfCountry[i][j])
                }
            }
        }
        for (let j = parsedObjCountry.data.length - 1; j >= 0; j--) {
            parsedObjCountry.data[j][1] = parsedObjCountry.data[j][1] / parsedObjCountry.data[0][1];

        }
        parsedLineData.push(parsedObjCountry)
    }
    console.log(parsedLineData);
}

// data from table One
let dataTableOne = getDataFromHTMLTable("#table1 > tbody:nth-child(3) > tr")
// console.log(dataTableOne);

parseToLineData(dataTableOne)




// // convert data the absolute data from table One to relative data
// for( let i = 0; i < dataTableOne[0].length; i++){
//     for(let j = 2012; j >= 2002; j--){
//         dataTableOne[0][i][`${j}`] = dataTableOne[0][i][`${j}`] / dataTableOne[0][i]["2002"]
//     }   
// }
// dataTableOne[0].forEach(elm => Object.entries(elm).forEach(x => console.log(x)));


// const getAllDataInOneArr = (dataToGather) => {
//     let bigArr = []
//     dataToGather.forEach( obj =>{
//         let valuesArr = Object.values(obj)
//         valuesArr.pop()
//         bigArr.push(...valuesArr)
//     })
//     console.log(bigArr);
// }
// getAllDataInOneArr(dataTableOne[0])







// data from tableTwo
// let dataTableTwo = getDataFromHTMLTable("#table2 tr")
// console.log(dataTableTwo);

// Note: pour le graphique, le contenu du texte indique que ce qui compte est l'évolution des données dans le temps.
// Il faut donc créer une courbe par pays en fonction du temps que l'on superposera sur un graphique
// Il est à noter que vu que c'est l'évolution qui est évaluée et non les valeurs absolues
// Il est plus pertinent de formater les données en les rendant relatives, ce qui élimine le biais des quantités d'habitants.
// donnée relative x = Donnée x / donnée initiale
