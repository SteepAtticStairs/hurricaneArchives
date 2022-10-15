const fs = require('fs')

function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
}

function arrayFromNtoN(first, last) {
    var foo = [];
    for (var i = first; i <= last; i++) {
        foo.push(i);
    }
    return foo;
}
String.prototype.charsFromSlice = function(first, last) {
    var allCharValues = arrayFromNtoN(first, last);
    var outStr = new String;
    for (var i in allCharValues) {
        outStr += this.charAt(allCharValues[i] - 1)
    }
    return outStr;
}
function removeSpacesObj(obj) {
    var keys = Object.keys(obj);
    for (var i in keys) {
        obj[keys[i]] = obj[keys[i]].replace(/ /g, '')
    }
    return obj;
}

// https://www.nhc.noaa.gov/data/#hurdat
const data = fs.readFileSync('hurdat2-1851-2021-100522.txt', { encoding: 'utf8' })

//var json = csvToJson(data);
//console.log(json)
//fs.writeFileSync('out.json', JSON.stringify(json));

var rows = data.split('\n');

function parseDataRow(curRow) {
    var obj = {};
    // https://www.nhc.noaa.gov/data/hurdat/hurdat2-format-atl-1851-2021.pdf
    obj.year = curRow.charsFromSlice(1, 4);
    obj.month = curRow.charsFromSlice(5, 6);
    obj.day = curRow.charsFromSlice(7, 8);
    obj.hours = curRow.charsFromSlice(11, 12);
    obj.minutes = curRow.charsFromSlice(13, 14);
    obj.fullMMDDYY = curRow.charsFromSlice(1, 8);
    obj.fullHHMM = curRow.charsFromSlice(11, 14);
    obj.stormStatus = curRow.charsFromSlice(20, 21);
    obj.latitude = curRow.charsFromSlice(24, 27);
    obj.NorS = curRow.charsFromSlice(28, 28);
    obj.longitude = curRow.charsFromSlice(31, 35);
    obj.wind = curRow.charsFromSlice(39, 41); // knots
    obj.pressure = curRow.charsFromSlice(44, 47); // millibars

    obj = removeSpacesObj(obj);
    return obj;
}
function parseHeaderRow(curRow) {
    var obj = {};

    // https://www.nhc.noaa.gov/data/hurdat/hurdat2-format-atl-1851-2021.pdf
    obj.atcfID = curRow.charsFromSlice(1, 8);
    obj.name = curRow.charsFromSlice(19, 28);
    obj.numOfRows = curRow.charsFromSlice(34, 36);

    obj = removeSpacesObj(obj);
    return obj;
}

function getRowType(rowNum) {
    var curRow = rows[rowNum];

    if (!isLetter(curRow.charAt(0))) {
        // standard track row
        return 'track';
    } else {
        // header row
        return 'header';
    }
}

var stormToSearchFor = 'AL092021';

var curATCF;
var o = {};
for (var i = 0; i <= rows.length - 1; i++) {
    if (getRowType(i) == 'header') {
        var parsedRow = parseHeaderRow(rows[i]);
        curATCF = parsedRow.atcfID;
        o[curATCF] = {};
        o[curATCF]['meta'] = parsedRow;
    } else {
        var parsedRow = parseDataRow(rows[i]);
        o[curATCF][`${parsedRow.fullMMDDYY}-${parsedRow.fullHHMM}`] = parsedRow;
    }
}
fs.writeFileSync('out.json', JSON.stringify(o));

// 18452 - header
// 18453 - data
//console.log(parseRow(18453))