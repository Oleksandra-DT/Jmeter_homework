/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 29.610129666695673, "KoPercent": 70.38987033330433};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2961012966669567, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.44033998038574695, 500, 1500, "Delete hero"], "isController": false}, {"data": [0.2788939725482395, 500, 1500, "Get hero by id"], "isController": false}, {"data": [0.41944531006544095, 500, 1500, "Edit hero"], "isController": false}, {"data": [0.16681332495285983, 500, 1500, "Get all heroes"], "isController": false}, {"data": [0.37057877813504825, 500, 1500, "Create hero"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 22982, 16177, 70.38987033330433, 16106.850274127595, 2, 96618, 478.0, 74101.6, 80405.9, 91705.61000000006, 210.2537829579346, 159.59597690485884, 32.55085636881782], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete hero", 3059, 1712, 55.966001961425306, 535.3664596273278, 12, 4719, 149.0, 1582.0, 2916.0, 3949.0, 53.751537515375155, 13.070442227859779, 11.285723208794588], "isController": false}, {"data": ["Get hero by id", 5027, 3625, 72.11060274517605, 10599.096280087531, 2, 68014, 720.0, 42085.6, 47133.0, 66188.80000000002, 48.55222237246228, 21.56313156160057, 5.309757951187004], "isController": false}, {"data": ["Edit hero", 3209, 1863, 58.055468993455904, 765.4540355250865, 13, 79601, 164.0, 1357.0, 1856.0, 4219.8, 38.663116423089434, 5.530081217092977, 8.791886329202763], "isController": false}, {"data": ["Get all heroes", 7955, 6628, 83.31866750471401, 35871.38466373352, 12, 96618, 30653.0, 81464.4, 83582.4, 94499.31999999999, 78.40296462749968, 128.83314953788573, 7.7827112007579125], "isController": false}, {"data": ["Create hero", 3732, 2349, 62.942122186495176, 7351.308413719187, 12, 82168, 232.5, 29287.7, 68848.94999999995, 77136.02, 41.288666637164226, 10.37268670896579, 9.366250826298845], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 22982, 16177, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1476, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 820, "The operation lasted too long: It took 134 milliseconds, but should not have lasted longer than 120 milliseconds.", 59, "The operation lasted too long: It took 128 milliseconds, but should not have lasted longer than 120 milliseconds.", 54, "The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 120 milliseconds.", 50], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete hero", 3059, 1712, "The operation lasted too long: It took 129 milliseconds, but should not have lasted longer than 120 milliseconds.", 12, "The operation lasted too long: It took 126 milliseconds, but should not have lasted longer than 120 milliseconds.", 12, "The operation lasted too long: It took 125 milliseconds, but should not have lasted longer than 120 milliseconds.", 12, "The operation lasted too long: It took 149 milliseconds, but should not have lasted longer than 120 milliseconds.", 11, "The operation lasted too long: It took 134 milliseconds, but should not have lasted longer than 120 milliseconds.", 10], "isController": false}, {"data": ["Get hero by id", 5027, 3625, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 510, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 153, "The operation lasted too long: It took 144 milliseconds, but should not have lasted longer than 120 milliseconds.", 14, "The operation lasted too long: It took 492 milliseconds, but should not have lasted longer than 120 milliseconds.", 12, "The operation lasted too long: It took 136 milliseconds, but should not have lasted longer than 120 milliseconds.", 11], "isController": false}, {"data": ["Edit hero", 3209, 1863, "The operation lasted too long: It took 128 milliseconds, but should not have lasted longer than 120 milliseconds.", 16, "The operation lasted too long: It took 134 milliseconds, but should not have lasted longer than 120 milliseconds.", 16, "The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 120 milliseconds.", 14, "The operation lasted too long: It took 1,740 milliseconds, but should not have lasted longer than 120 milliseconds.", 13, "The operation lasted too long: It took 490 milliseconds, but should not have lasted longer than 120 milliseconds.", 12], "isController": false}, {"data": ["Get all heroes", 7955, 6628, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 931, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 657, "The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 120 milliseconds.", 15, "The operation lasted too long: It took 134 milliseconds, but should not have lasted longer than 120 milliseconds.", 14, "The operation lasted too long: It took 136 milliseconds, but should not have lasted longer than 120 milliseconds.", 10], "isController": false}, {"data": ["Create hero", 3732, 2349, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 35, "The operation lasted too long: It took 128 milliseconds, but should not have lasted longer than 120 milliseconds.", 17, "The operation lasted too long: It took 129 milliseconds, but should not have lasted longer than 120 milliseconds.", 13, "The operation lasted too long: It took 138 milliseconds, but should not have lasted longer than 120 milliseconds.", 12, "The operation lasted too long: It took 126 milliseconds, but should not have lasted longer than 120 milliseconds.", 12], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});