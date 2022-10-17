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
const data = fs.readFileSync('ibtracs.ALL.list.v04r00.csv', { encoding: 'utf8' })

//var json = csvToJson(data);
//console.log(json)
//fs.writeFileSync('out.json', JSON.stringify(json));

var rows = data.split('\n');
var header = rows[0].split(',');

function findName(row) {
    var name;
    var year;
    var basin;
    var SID;
    for (var n in row) {
        if (header[n] == 'NAME') {
            name = row[n];
        } else if (header[n] == 'SEASON') {
            year = row[n];
        } else if (header[n] == 'SID') {
            SID = row[n];
        }/* else if (header[n] == 'BASIN') {
            basin = row[n];
        }*/
    }
    return {
        'name': `${SID}-${name}-${year}`,
        'id': SID
    }
}

var start = Date.now();
var obj = {};
var curName;
var curID;
var wantedRows = ['SID', 'SEASON', 'BASIN', 'SUBBASIN', 'USA_ATCF_ID', 'NAME', 'ISO_TIME', 'LAT', 'LON', 'NATURE', 'WMO_WIND', 'WMO_PRES', 'USA_WIND', 'USA_PRES', 'WMO_AGENCY']
for (var i = 0; i <= rows.length; i++) {
    if (i % 100 == 0) {
        process.stdout.write(`Parsing row ${i}\r`);
    }
    try {
        // 609283
        var curRow = rows[i].split(',');
        var findRowResults = findName(curRow);
        curName = findRowResults.name;
        curID = findRowResults.id

        if (!obj.hasOwnProperty(curID)) {
            obj[curID] = [];
        }
        var newObj = {};
        for (var n in curRow) {
            if (!(curRow[n].replace(/ /g, '') == '')) {
                newObj[header[n]] = curRow[n];
            }
        }
        obj[curID].push(newObj)
        //fs.writeFileSync(`./storms/${curID}.json`, JSON.stringify(obj[curID]));
    } catch (e) {
        //uugh
    }
}

function findStorm(name, year, basin, sid) {
    var keys = Object.keys(obj);
    for (var i in keys) {
        if (keys[i] == `${sid}-${name}-${year}-${basin}`) {
            return obj[keys[i]];
        }
    }
}

var newerObj = {};
var keys = Object.keys(obj);
for (var i in keys) {
    var split = keys[i].split('-');
    newerObj[i] = [split[0], split[1], split[2], split[3]]
}
//fs.writeFileSync('stormList.json', JSON.stringify(newerObj));

var end = Date.now();
//console.log(findStorm('IDA', '2021', 'NA', '2021239N17281'))
//console.log(obj['IDA_2021'])
//fs.writeFileSync('ibtracsArchive.json', JSON.stringify(obj));

console.log(`Finished in ${(end - start) / 1000} s`)