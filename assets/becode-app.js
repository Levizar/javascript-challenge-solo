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
    // getting the row of the table in an object an taking out the nodes, turning them into an arrayLike
    let tableRows = d3.selectAll(stringCSSPathToTheTableRows);
    tableRows = [...tableRows.nodes()];
    let tableHeaders = [];
    for( let i = 0; i < tableRows.length; i++){
        const arrCellsOfCurrentRow = [...tableRows[i].cells];
        let countryData = [];
        for( let j = 1; j < arrCellsOfCurrentRow.length; j++){
            if( i == 0){
                if(j == 1){
                    tableHeaders[j-1] = "country";
                }else{
                    tableHeaders[j-1] = arrCellsOfCurrentRow[j].innerText;
                }
            } else {
                countryData[j-1] = arrCellsOfCurrentRow[j].innerText
            }
        }
        if( i != 0){
            data[i-1] = Object.fromEntries(tableHeaders.map((a,i) => [tableHeaders[i], countryData[i]]))
        }
        // console.log(countryData);
    }
    return data;
}

let dataTableOne = getDataFromHTMLTable("#table1 > tbody:nth-child(3) > tr")
console.log(dataTableOne);




let dataTableTwo = getDataFromHTMLTable("#table2 tr")
console.log(dataTableTwo);
