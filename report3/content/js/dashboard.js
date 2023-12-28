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

    var data = {"OkPercent": 45.302, "KoPercent": 54.698};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.367395, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4252, 500, 1500, "Delete hero"], "isController": false}, {"data": [0.316725, 500, 1500, "Get hero by id"], "isController": false}, {"data": [0.404, 500, 1500, "Edit hero"], "isController": false}, {"data": [0.3067, 500, 1500, "Get all heroes"], "isController": false}, {"data": [0.38435, 500, 1500, "Create hero"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 54698, 54.698, 9520.757420000002, 0, 277045, 253.0, 2635.800000000003, 58557.70000000002, 271828.92000000004, 298.0190672599233, 433.85439735981186, 25.33550893461164], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete hero", 20000, 10642, 53.21, 1866.4955999999981, 1, 112146, 150.0, 2353.9000000000015, 6402.0, 30762.840000000026, 66.73918991971276, 98.53333917127446, 6.556506247205297], "isController": false}, {"data": ["Get hero by id", 20000, 11286, 56.43, 5772.447400000004, 0, 151680, 358.0, 17578.0, 30757.0, 110923.98000000001, 61.22180353311028, 91.24520616538, 3.360341634882347], "isController": false}, {"data": ["Edit hero", 20000, 10788, 53.94, 2062.953750000019, 0, 274729, 189.0, 4284.9000000000015, 6685.9000000000015, 30289.090000000306, 63.226911902782305, 91.340761367606, 6.6264643945548976], "isController": false}, {"data": ["Get all heroes", 20000, 10997, 54.985, 30889.998049999955, 1, 276869, 502.0, 153452.0, 191216.85, 271064.16000000015, 59.613407055246725, 82.15870858731128, 3.734436476326026], "isController": false}, {"data": ["Create hero", 20000, 10985, 54.925, 7011.892300000043, 0, 277045, 231.0, 6275.0, 30919.95, 225599.87000000002, 61.87697619592726, 92.15529013340677, 6.46538867829232], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["408/Request Timeout", 1190, 2.1755822882006655, 1.19], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 49, 0.08958280010238034, 0.049], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 32285, 59.02409594500713, 32.285], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 18752, 34.28278913305788, 18.752], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2421, 4.42612161322169, 2.421], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 1, 0.0018282204102526602, 0.001], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 54698, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 32285, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 18752, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2421, "408/Request Timeout", 1190, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 49], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete hero", 20000, 10642, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6545, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 4091, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 1, "", ""], "isController": false}, {"data": ["Get hero by id", 20000, 11286, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6303, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3644, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1298, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 41, "", ""], "isController": false}, {"data": ["Edit hero", 20000, 10788, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6753, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 4030, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 5, "", "", "", ""], "isController": false}, {"data": ["Get all heroes", 20000, 10997, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5814, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3156, "408/Request Timeout", 1099, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 928, "", ""], "isController": false}, {"data": ["Create hero", 20000, 10985, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6870, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3831, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 185, "408/Request Timeout", 91, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 8], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
