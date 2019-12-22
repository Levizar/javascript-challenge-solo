/* 
// WRITE YOUR JAVASCRIPT BELOW THIS COMMENT 
Your name : Bartoletti Brice
Starting Date : 12/11/2019
Contact information : bartolettibrice@gmail.com
What does this script do ?

This script inject 3 charts in the html document
The data for the first chart are fetched and those for the 2 last charts are directly taken from the HTML
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
            if (i == 0) { // First iteration for the data Names 
                if (j == 1) {
                    tableHeaders[j - 1] = "country";
                } else {
                    tableHeaders[j - 1] = arrCellsOfCurrentRow[j].innerText;
                }
            } else { // Next iterations to get the datas
                countryData[j - 1] = arrCellsOfCurrentRow[j].innerText;
                countryData[j - 1] = countryData[j - 1].replace(/[,]/g, '.'); // replacing "," by "." for calculation
            }
        }
        if (i != 0) { // 
            data[i - 1] = tableHeaders.map((a, i) => [tableHeaders[i], countryData[i]]);
        }
    }
    return data;
}

// This function parse the data for the line charts and transform it to % data using the data from the initial value as reference
const parseToLineData = (arrayOfCountry, pFloat = false, percentage = false) => {
    let parsedLineData = [];
    // Adding an array of color to give a color property
    // That part could be improved by using the d3 scale color ! 
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
    // Create an empty data array to be ready to get the "data-couple"
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
                    let currentDataCoupleToPush = Object.fromEntries(keys.map((a, index) => [keys[index], (pFloat ? parseFloat(arrayOfCountry[i][j][index]) : arrayOfCountry[i][j][index])]));
                    parsedObjCountry.data.push(currentDataCoupleToPush);
                }
            }
        }
        if (percentage) {
            for (let j = parsedObjCountry.data.length - 1; j >= 0; j--) {
                parsedObjCountry.data[j].value = parsedObjCountry.data[j].value / parsedObjCountry.data[0].value;
            }
        }
        parsedLineData.push(parsedObjCountry);
    }
    return parsedLineData;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////                                                                                                  //////////////
//////////////                                  LINE CHART FUNCTION                                             //////////////
//////////////                                    (Second Graph)                                                //////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// !!! There is one and only one line in this chart so there isn't any .enter() method called !!!
// The .enter() method is necessary to call several data

const lineChart = (dataSet) => {
    // Defining the chart default param

    const parentMaxWidth = d3.select("#mw-content-text").nodes(); // making the chart ready for responsiv
    const width = parentMaxWidth[0].offsetWidth;
    const height = width / 2;
    const margin = {
        left: 25,
        bottom: 20,
        right: 60,
        top: 20,
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
        .text(d => d.key) // text showed in the menu
        .attr("value", d => d.key) // corresponding value returned by the button

    // filter the data to initialize the chart with the first option of the select button
    let choosenCountry = d3.select("#selectButton").property("value")
    let lineData = dataSet.filter(d => d.key == choosenCountry)

    // Defining the chart scale. The value will be given in the update function
    let xScale = d3.scaleLinear()
    let yScale = d3.scaleLinear()

    // initialiazing the scaling for the scale, .tickvalue will be added in update function
    let xAxisGenerator = d3.axisBottom(xScale)
    let yAxisGenerator = d3.axisLeft(yScale)

    // Creating a line generator function
    let lineGenerator = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

    // Function to get the last index of an array to get his position (see valueLabel)
    const last = array => array[array.length - 1]

    // Defining the scale and drawing area inside the svg
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initialiazing the axes, they would be redefined in the update function
    let xAxis = g.append("g")
        .call(xAxisGenerator)
        .attr("transform", `translate(0, ${chartHeight})`);
    let yAxis = g.append("g")
        .call(yAxisGenerator);

    // Defining one line, its data will be updated at the end of the function
    let line = g
        .append("path")
        .attr("id", "theLine")
        .style("stroke-linejoin", "round")
        .style("stroke-width", 3);

    // Creating a g group at the position of the last point of the chart
    const valueLabel = g
        .append("g")
        .data(lineData)
        .attr("transform", d => `translate(${xScale(last(d.data).date)}, ${yScale(last(d.data).value)})`);

    const circle = valueLabel.append("circle")
        .attr("r", 3)
        .style("stroke", "white")
        .style("fill", d => d.light);

    const countryName = valueLabel.append("text")
        .text(d => d.key)
        .attr("dy", -15)
        .attr("dx", -40)
        .style("font-family", "monospace")
        .style("fill", d => d.light);

    const update = () => {
        choosenCountry = d3.select("#selectButton").property("value")
        lineData = dataSet.filter(d => d.key == choosenCountry)

        let data = lineData[0].data
        let valueArray = []
        data.forEach(datacouple => valueArray.push(datacouple.value));
        let maxYaxis = Math.ceil(d3.max(valueArray) * 10) / 10

        xScale = d3.scaleLinear()
            .domain([data[0].date, last(data).date])
            .range([0, chartWidth]);

        yScale = d3.scaleLinear()
            .domain([0, maxYaxis]) //
            .range([chartHeight, 0]);

        xAxisGenerator = d3.axisBottom(xScale)
            .tickValues(d3.range(data[0].date, last(data).date + 1, 1));

        yAxisGenerator = d3.axisLeft(yScale)
            .tickValues(d3.range(0, maxYaxis + 0.1, 0.1))

        xAxis.call(xAxisGenerator)

        yAxis.call(yAxisGenerator);

        line
            .data(lineData)
            .transition()
            .duration(1000)
            .attr("d", d => {
                return lineGenerator(d.data)
            }) // lineGenerator: d3.line().attr(X).attr(Y)
            .style("fill", "none")
            .style("stroke", d => d.light)


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


    //     group for Mouse tracker      //
    let mouseG = g.append("g")
        .attr("class", "mouse-over-effects");

    // this is the black vertical line to follow mouse
    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    let mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(lineData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    let bullet = mousePerLine.append("g");
    let textbullet = bullet.append("text")
        .attr("class", "mouse-per-line");

    const mouseTracker = () => {
        mouseG.append('svg:rect') // append a rect to catch mouse movements on SVG
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', () => { // mouse out : hide line, circles and text
                d3.select(".mouse-line")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");
            })
            .on('mouseover', () => { // mouse in : show line, circles and text
                d3.select(".mouse-line")
                    .style("opacity", "1");
                d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "1");
                d3.selectAll(".mouse-per-line text")
                    .style("opacity", "1");
            })
            .on('mousemove', function () { // mouse moving over SVG
                let mouse = d3.mouse(this);
                d3.select(".mouse-line")
                    .attr("d", () => {
                        let d = `M${mouse[0]},${height} ${mouse[0]},0`;
                        return d;
                    });

                d3.selectAll(".mouse-per-line")
                    .attr("transform", function (d, i) {
                        //return the X of the mouse
                        let xDate = xScale.invert(mouse[0]);
                        if (xDate > last(lineData[0].data).date) {
                            xDate = last(lineData[0].data).date;
                        }
                        //Function in Vanilla JS to get the Y of the line
                        const getapproximativeYwithX = () => {
                            let floorDate = Math.floor(xDate)
                            let indexOfFloorDateY = -1
                            for (let i = 0; i < lineData[0].data.length; i++) {
                                if (lineData[0].data[i].date == floorDate) {
                                    indexOfFloorDateY = i
                                }
                            }
                            let y
                            if (floorDate == last(lineData[0].data).date) {
                                y = last(lineData[0].data).value

                            } else {
                                let y0 = lineData[0].data[indexOfFloorDateY].value;
                                let y1 = lineData[0].data[indexOfFloorDateY + 1].value;
                                let deltaY = y1 - y0; // This is equal to the dy/dx because dx = 1
                                let deltaX = xDate - floorDate;
                                let diffY = deltaX * (deltaY);
                                y = lineData[0].data[indexOfFloorDateY].value + diffY;
                            }
                            return y
                        }
                        let y = getapproximativeYwithX()

                        d3.selectAll(".mouse-per-line circle")
                            .attr("cx", xScale(xDate))
                            .attr("cy", yScale(y));
                        bullet.attr("transform", `translate(${xScale(xDate) - 10},${yScale(y) - 15})`);
                        textbullet.text(y.toFixed(4))
                            .style("color", "rebeccapurple"); // colot not working
                    });
            });
    }
    // Use Update once to initialize the chart with the good data
    update();
    // Call update when the button is used
    d3.select("#selectButton").on("change", update);
    mouseTracker();
}



// Calling the line chart function for the first table data
let dataTableOne = getDataFromHTMLTable("#table1 > tbody:nth-child(3) > tr");
dataTableOne = parseToLineData(dataTableOne, true, true); // double true for parsefloating the data AND transform it in relative data
lineChart(dataTableOne)



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////                                                                                                  //////////////
//////////////                                  SIMPLE CHART FUNCTION                                           //////////////
//////////////                                      (third chart)                                               //////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const barChart = (dataSet) => {
    // Defining the chart default param

    const parentMaxWidth = d3.select("#mw-content-text").nodes(); // making the chart ready for responsiv
    const width = parentMaxWidth[0].offsetWidth;
    const height = width / 2;
    const margin = {
        left: 25,
        bottom: 20,
        right: 60,
        top: 20,
    }
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Inserting the SVG Canvas in the html
    const svg = d3.select("#mw-content-text").insert(`svg`, "#table2").attr("id", "SVGTable2").attr("width", `${width}`).attr("height", `${height}`);

    // Inserting a button for data filter
    d3.select("#mw-content-text")
        .insert("select", "#SVGTable2")
        .attr("id", "selectButton2")
        .style("margin-top", "15px")
        .style("margin-bottom", "15px")
        .selectAll('myOptions')
        .data(dataSet)
        .enter()
        .append('option')
        .text(d => d.key) // text showed in the menu
        .attr("value", d => d.key) // corresponding value returned by the button


    const createGraph = () => {
        // filter the data to initialize the chart with the first option of the select button
        let choosenCountry = d3.select("#selectButton2").property("value");
        let rectData = dataSet.filter(d => d.key == choosenCountry);
        let color = rectData[0].light;

        // Defining the scale and drawing area inside the svg
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const dateDomain = rectData[0].data.map(obj => obj.date);

        //Taking the data that will be used
        rectData = rectData[0].data;

        const xScale = d3.scaleBand()
            .domain(dateDomain)
            .range([0, chartWidth])
            // .round(true)
            .padding(0.3);

        let maxY = d3.max(rectData.map(obj => obj.value))
        maxY = Math.ceil(maxY / 100) * 100
        const yScale = d3.scaleLinear()
            .domain([0, maxY])
            .range([chartHeight, 0]);

        // Calling the  Axis
        g.append("g").call(d3.axisBottom(xScale)).attr("transform", `translate(0, ${chartHeight})`);
        g.append("g").call(d3.axisLeft(yScale));

        function hover() {
            d3.select(this)
                .style("opacity", "0.8");

            g.append("g")
                .attr("id", "textHover")
                .selectAll("text")
                .data(rectData)
                .enter()
                .append("text")
                .attr("x", d => xScale(d.date) + xScale.bandwidth() / 2 - 10)
                .attr("y", d => yScale(d.value) - 10)
                .text(d => d.value)
                .style('font-weight', 'bold')
                .style('font-size', '1.7rem')
                .style("fill", color)
        }

        function unHover() {
            d3.select(this)
                .style("opacity", "1");
            d3.select("#textHover").remove();
        }

        let gRect = g.selectAll("rect")
            .data(rectData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.date))
            .attr("y", d => yScale(d.value))
            .attr("width", d => xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(d.value))
            .attr('fill', `${color}`)
            .on("mouseover", hover)
            .on("mouseleave", unHover)

        d3.select("#selectButton2").on("change", () => {
            g.remove();
            createGraph();
        })
    }
    createGraph()
}

// The table 2 is about prisonner ==> Moving tableTwo from the bad place to the right place
let table2 = document.getElementById("table2").cloneNode(true);
let table2Copy = document.importNode(table2, true);
document.getElementById('mw-content-text').removeChild(document.getElementById("table2"))
let target = document.querySelector("#mw-content-text > p:nth-child(34)")
document.getElementById('mw-content-text').insertBefore(table2, target);



// data from tableTwo
let dataTableTwo = getDataFromHTMLTable("#table2 tr")
dataTableTwo = parseToLineData(dataTableTwo)
barChart(dataTableTwo)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////                                                                                                  //////////////
//////////////                                  ONLINE DATA CHART FUNCTION                                      //////////////
//////////////                                        (first chart)                                             //////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const getData = async (arrDataset, count) => {
    try {
        let dataRequest = await fetch("https://inside.becode.org/api/v1/data/random.json");
        const arrData = [];
        let data = await dataRequest.json();
        arrData.push(...data)
        let keys = ["x", "y"]
        arrData.forEach(arr => arrDataset.push(Object.fromEntries(keys.map((a, index) => {
            dataXY = [keys[index], keys[index] == "x" ? count : arr[index]];
            count++;
            return dataXY
        }))))
        return [arrDataset, count]
    } catch (e) {
        console.error(e);
    }
}

const createRealTimeGraphData = async () => {
    let dataSet = [];
    let count = 0;
    [dataSet, count] = await getData(dataSet, count);
    // Defining the chart default param
    const parentMaxWidth = d3.select("#mw-content-text").nodes(); // making the chart ready for responsiv
    const width = parentMaxWidth[0].offsetWidth;
    const height = width / 2;
    const margin = {
        left: 25,
        bottom: 20,
        right: 60,
        top: 20,
    }
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Inserting the SVG Canvas in the html
    const svg = d3.select("#content").insert(`svg`, "#bodyContent").attr("id", "SVGOnlineData").attr("width", `${width}`).attr("height", `${height}`);
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Append axis
    const xAxe = g.append("g");
    const yAxe = g.append("g");

    let line = g
        .append("path")
        .attr("id", "onlineLine")
        .style("stroke-linejoin", "round")
        .style("stroke-width", 3);

    const reset = () => {
        const minX = d3.min(dataSet.map(d => d.x))
        const maxX = d3.max(dataSet.map(d => d.x))
        // Defining the chart scale
        const xScale = d3.scaleLinear()
            .domain([minX, maxX])
            .range([0, chartWidth])
        const yScale = d3.scaleLinear()
            .domain([-30, 30])
            .range([chartHeight, 0])

        // initialiazing the scaling for the scale
        const xAxisGenerator = d3.axisBottom(xScale)
        const yAxisGenerator = d3.axisLeft(yScale)

        const lineGenerator = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        // (re-)Calling the  Axis
        xAxe.call(xAxisGenerator).attr("transform", `translate(0, ${chartHeight})`);
        yAxe.call(yAxisGenerator);


        line.data([dataSet])
            .transition()
            .duration(400)
            .attr("d", d => {
                return lineGenerator(d)
            })
            .attr("fill", "none")
            .attr("stroke", "black");
    }
    reset();

    setInterval(async () => {
        [dataSet, count] = await getData(dataSet, count);
        while (dataSet.length > 100) {
            dataSet.shift();
        }
        reset()
    }, 1000)
}

// The graph works but has bug that needs to be fixed
createRealTimeGraphData();