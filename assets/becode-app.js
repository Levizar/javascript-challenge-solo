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
                countryData[j - 1] = arrCellsOfCurrentRow[j].innerText;
                countryData[j - 1] = countryData[j - 1].replace(/[,]/g, '.')     ;                           // replacing "," by "." for calculation
            }
        }
        if (i != 0) {                                                                                       // 
            data[i - 1] = tableHeaders.map((a, i) => [tableHeaders[i], countryData[i]]);
        }
    }
    return data;
}

// This function parse the data for the line charts and transform it to % data using the data from the initial value as reference
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
        let keys = ["date", "value"]
        for (let j = 0; j < arrayOfCountry[i].length; j++) {
            if (j == 0) {
                parsedObjCountry.key = arrayOfCountry[i][j][1];
                parsedObjCountry.light = colorArray[i];
            } else {
                if (arrayOfCountry[i][j][1] != ":") {
                    let currentDataCoupleToPush = Object.fromEntries(keys.map((a, index) => [keys[index], parseFloat(arrayOfCountry[i][j][index])]));
                    parsedObjCountry.data.push(currentDataCoupleToPush);
                }
            }
        }

        for (let j = parsedObjCountry.data.length - 1; j >= 0; j--) {
            parsedObjCountry.data[j].value = parsedObjCountry.data[j].value / parsedObjCountry.data[0].value;           
        }
        parsedLineData.push(parsedObjCountry);
    }
    return parsedLineData;
}

// data from table One
let dataTableOne = getDataFromHTMLTable("#table1 > tbody:nth-child(3) > tr");
dataTableOne = parseToLineData(dataTableOne);


// Line charts
//Make a line chart
const lineChart = (dataSet)=>{
    // Defining the chart default param
    const width = 800;
    const height = width/2;
    const margin = {
        left : 25,
        bottom : 20,
        right : 60,
        top : 20,
      }
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Inserting the SVG Canvas in the html
    const svg = d3.select("#mw-content-text").insert(`svg`, "#table1").attr("id", "SVGTable1").attr("width", `${width}`).attr("height", `${height}`);
    
    // Inserting a button for data filter
    d3.select("#mw-content-text")
    .insert("select", "#SVGTable1")
    .attr("id", "selectButton")
    .style("margin-top", "15px")
    .style("margin-bottom", "15px")
    .selectAll('myOptions')
    .data(dataSet)
    .enter()
    .append('option')
    .text( d => d.key ) // text showed in the menu
    .attr("value", d => d.key ) // corresponding value returned by the button
    
    // filter the data to initialize the chart with the first option of the select button
    let choosenCountry = d3.select("#selectButton").property("value")
    let lineData = dataSet.filter( d => d.key == choosenCountry)

    // Defining the chart scale with default "wrong" value. It is updated at the end of the function with right value
    let xScale = d3.scaleLinear()
    // .domain([2002, 2012])                                                           
    // .range([0, chartWidth]);
    
    let yScale = d3.scaleLinear()                                                 
    // .domain([0, 4])
    // .range([chartHeight, 0]);

    // Define the scaling for the scale
    let xAxisGenerator = d3.axisBottom(xScale)                                    
    // .tickValues(d3.range(2002, 2013, 1));

    let yAxisGenerator = d3.axisLeft(yScale)                                      
    // .tickValues(d3.range(0, 4.1, 0.1));

    // Creating a line generator function
    let lineGenerator = d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.value));

    // Function to get the last index of an array to get his position (see valueLabel)
    const last = array => array[array.length - 1]



    // Defining the scale and drawing area
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Getting the X Axis and putting it at the bottom (the max Y position from top to down)
    let xAxis = g.append("g")
        .call(xAxisGenerator)
        .attr("transform", `translate(0, ${chartHeight})`);

    // Getting the Y axis at the 0 from g group
    let yAxis = g.append("g")
        .call(yAxisGenerator);

    // Defining one line, its data will be updated at the end of the function
    let line = g
        .append("path")

    // Creating a g group at the position of the last point of the chart
    const valueLabel = g
        .append("g")
        .data(lineData)
        // .attr("transform", d => `translate(${xScale(last(d.data).date)}, ${yScale(last(d.data).value)})`);
        
    const circle = valueLabel.append("circle")
    .attr("r", 3)
    .style("stroke", "white")
    .style("fill", d => d.light);

    const countryName = valueLabel.append("text")
    .text(d => d.key)
    .attr("dy", -15)
    .attr("dx", -20)
    .style("font-family", "monospace")
    .style("fill", d => d.light);

    const update = () => {
        choosenCountry = d3.select("#selectButton").property("value")
        lineData = dataSet.filter( d => d.key == choosenCountry)

        let data = lineData[0].data
        let valueArray = []
        data.forEach(datacouple => valueArray.push(datacouple.value));
        let maxYaxis = Math.ceil(d3.max(valueArray)*10)/10
            
        xScale = d3.scaleLinear()
        .domain([data[0].date, last(data).date])                                                           
        .range([0, chartWidth]);
        
        yScale = d3.scaleLinear()                                                 
        .domain([0, maxYaxis]) //
        .range([chartHeight, 0]);
        
        let formatter = d3.format(".0%")                             // make percentage in tick formater

        xAxisGenerator = d3.axisBottom(xScale)                                    
        .tickValues(d3.range(data[0].date, last(data).date +1, 1));
    
        yAxisGenerator = d3.axisLeft(yScale)                                      
        .tickValues(d3.range(0, maxYaxis +0.1, 0.1))
        // .tickFormat(formatter);                                   // need to modify

        xAxis.call(xAxisGenerator)

        yAxis.call(yAxisGenerator);

        line 
        .data(lineData)
        .transition()
        .duration(1000)
        .attr("d", d => lineGenerator(d.data))                                      // lineGenerator: d3.line().attr(X).attr(Y)
        .style("fill", "none")
        .style("stroke", d => d.light)
        .style("stroke-width", 2)
        .style("stroke-linejoin", "round");

        valueLabel
        .data(lineData)
        .transition()
        .duration(1000)
        .attr("transform", d => `translate(${xScale(last(d.data).date)}, ${yScale(last(d.data).value)})`);

        circle
        .data(lineData)
        .transition()
        .duration(1000)
        .style("fill", d => d.light);

        countryName
        .data(lineData)
        .transition()
        .duration(1000)
        .text(d => d.key)
        .style("fill", d => d.light)
    }
    update()

    d3.select("#selectButton").on("change", update)

}

lineChart(dataTableOne)




















////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// data from tableTwo
// let dataTableTwo = getDataFromHTMLTable("#table2 tr")
// console.log(dataTableTwo);

// Note: pour le graphique, le contenu du texte indique que ce qui compte est l'évolution des données dans le temps.
// Il faut donc créer une courbe par pays en fonction du temps que l'on superposera sur un graphique
// Il est à noter que vu que c'est l'évolution qui est évaluée et non les valeurs absolues
// Il est plus pertinent de formater les données en les rendant relatives, ce qui élimine le biais des quantités d'habitants.
// donnée relative x = Donnée x / donnée initiale
