const fs = require('fs')

var data = fs.readFileSync('ibtracsArchive.json', { encoding: 'utf8' })
data = JSON.parse(data);

var newerObj = {};
var keys = Object.keys(data);
for (var i in keys) {
    var split = keys[i].split('-');

    var biggestCat = data[keys[i]][0].USA_SSHS;
    for (var n in data[keys[i]]) {
        var sshsVal = data[keys[i]][n].USA_SSHS;
        if (sshsVal > biggestCat) {
            biggestCat = sshsVal;
        }
    }
    newerObj[i] = [split[0], split[1], split[2], split[3], biggestCat]
}
//console.log(newerObj)
fs.writeFileSync('stormList.json', JSON.stringify(newerObj));