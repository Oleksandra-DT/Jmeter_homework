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

    var data = {"OkPercent": 6.115269835447892, "KoPercent": 93.88473016455211};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06115269835447892, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.09258007838897148, 500, 1500, "Delete hero"], "isController": false}, {"data": [0.0514577455327153, 500, 1500, "Get hero by id"], "isController": false}, {"data": [0.08287535722136734, 500, 1500, "Edit hero"], "isController": false}, {"data": [0.040339828897338406, 500, 1500, "Get all heroes"], "isController": false}, {"data": [0.06663267040625531, 500, 1500, "Create hero"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 59981, 56313, 93.88473016455211, 35977.896633933946, 1, 256443, 1109.0, 11107.800000000003, 44325.8, 151818.91, 121.72654804039354, 214.19522198476616, 16.25466076558289], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete hero", 7399, 6714, 90.74199216110286, 7531.272604406009, 8, 225823, 1010.0, 7926.0, 42117.0, 131869.0, 15.656641535066095, 4.894237921067165, 3.1753226874501403], "isController": false}, {"data": ["Get hero by id", 14886, 14120, 94.85422544672846, 38984.10640870656, 1, 225828, 5077.0, 126549.5, 152459.3, 192748.49999999997, 31.272386562495402, 26.35606807471361, 2.6555033982933165], "isController": false}, {"data": ["Edit hero", 9098, 8344, 91.71246427786326, 19727.0010991427, 8, 222173, 1245.0, 78692.60000000002, 130418.59999999999, 172251.0, 19.13157214083091, 7.459398653582491, 3.854607385358817], "isController": false}, {"data": ["Get all heroes", 16832, 16153, 95.96601711026616, 57234.40797290871, 1, 256443, 36594.0, 162855.9, 217826.35, 238161.02999999997, 36.1498828436247, 169.43031663832613, 2.8881809143834953], "isController": false}, {"data": ["Create hero", 11766, 10982, 93.33673295937447, 32220.220380758314, 1, 225628, 1836.5, 125736.0, 153328.54999999993, 203850.98, 26.03869288682928, 18.256488268922645, 4.574444930161818], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 59981, 56313, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 8281, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6577, "The operation lasted too long: It took 766 milliseconds, but should not have lasted longer than 500 milliseconds.", 80, "The operation lasted too long: It took 783 milliseconds, but should not have lasted longer than 500 milliseconds.", 80, "The operation lasted too long: It took 732 milliseconds, but should not have lasted longer than 500 milliseconds.", 74], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete hero", 7399, 6714, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 151, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 100, "The operation lasted too long: It took 611 milliseconds, but should not have lasted longer than 500 milliseconds.", 18, "The operation lasted too long: It took 753 milliseconds, but should not have lasted longer than 500 milliseconds.", 17, "The operation lasted too long: It took 781 milliseconds, but should not have lasted longer than 500 milliseconds.", 16], "isController": false}, {"data": ["Get hero by id", 14886, 14120, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2945, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1899, "The operation lasted too long: It took 766 milliseconds, but should not have lasted longer than 500 milliseconds.", 22, "The operation lasted too long: It took 783 milliseconds, but should not have lasted longer than 500 milliseconds.", 20, "The operation lasted too long: It took 765 milliseconds, but should not have lasted longer than 500 milliseconds.", 18], "isController": false}, {"data": ["Edit hero", 9098, 8344, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 693, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 342, "The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 20, "The operation lasted too long: It took 766 milliseconds, but should not have lasted longer than 500 milliseconds.", 18, "The operation lasted too long: It took 740 milliseconds, but should not have lasted longer than 500 milliseconds.", 17], "isController": false}, {"data": ["Get all heroes", 16832, 16153, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 3518, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2456, "The operation lasted too long: It took 783 milliseconds, but should not have lasted longer than 500 milliseconds.", 18, "The operation lasted too long: It took 733 milliseconds, but should not have lasted longer than 500 milliseconds.", 18, "The operation lasted too long: It took 765 milliseconds, but should not have lasted longer than 500 milliseconds.", 17], "isController": false}, {"data": ["Create hero", 11766, 10982, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1378, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1376, "The operation lasted too long: It took 732 milliseconds, but should not have lasted longer than 500 milliseconds.", 19, "The operation lasted too long: It took 830 milliseconds, but should not have lasted longer than 500 milliseconds.", 18, "The operation lasted too long: It took 756 milliseconds, but should not have lasted longer than 500 milliseconds.", 17], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});