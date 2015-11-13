(function () {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    setTimeout(function () {
        execJasmine();
    }, 5000)

    function execJasmine() {
        jasmineEnv.execute();
        checkTestIsDone();
        report();
    }

    function statistics() {
        var SCL = Microsoft.UCJA.Test.SCL;
        var stats = {};

        var key, index;
        var total;

        for (key in SCL.stats) {
            total = 0;
            for (index = 0; index < SCL.stats[key].length; index++) {
                total += SCL.stats[key][index].duration;
            }
            stats[key] = Math.round(total / SCL.stats[key].length);
        }

        return stats;
    }

    function checkTestIsDone() {
        var interval = setInterval(function () {
            if ($('.symbolSummary .pending')[0] == undefined) {
                window.document.title = 'Test - done';
                clearInterval(interval);
            }
        });
    }
    // Todo: refactor this function to a seperate js file.
    function report() {
        var reportServerUrl = 'http://wewa11:18009/';
        var url = window.location.toString();
        var query_string = url.split('?');
        var query = {};
        var interval;

        // if the query string contains ?report, or ?report=true, the the runall.html will
        // send the report to the reporting service.
        if (query_string[1]) {
            var params = query_string[1].split('&');
            params.forEach(function (item) {
                var param_item = item.split('=');
                var param_key = param_item[0].toLowerCase();
                var param_value = param_item[1] ? param_item[1].toLowerCase() : true;
                query[param_key] = param_value;
            })

            if (query['report'] || query['report#']) {
                // check every one second to see if the automation is completed
                interval = setInterval(function () {
                    if ($('.symbolSummary .pending')[0] == undefined) {
                        // automation is completed, so we connect to the reporting service
                        var socket = io.connect(reportServerUrl);
                        socket.on('connect', function () {
                            // remove unnecessary iframes
                            $('iframe').remove();

                            var body = $('body').html();
                            var reportData;
                            var passingAlert = $('.passingAlert').html();
                            var totalSpecs;
                            var failingNumber;
                            var failingSpecs = [];
                            var stats = {}; //statistics();

                            if (passingAlert) {
                                reportData = { report: body, summary: { passingAlert: passingAlert }, stats: stats };
                            } else {
                                totalSpecs = parseInt($('.resultsMenu.bar a')[0].text);
                                failingNumber = parseInt($('.resultsMenu.bar a')[1].text);
                                var specs = $('.specDetail.failed a');
                                for (var i = 0; i < failingNumber; i++) {
                                    failingSpecs.push(specs[i].text);
                                }
                                reportData = { report: body, summary: { total: totalSpecs, failure: failingNumber, failingSpecs: failingSpecs }, stats: stats };
                            }
                            socket.emit('reporting', reportData);
                            socket.disconnect();
                            clearInterval(interval);
                            window.document.title = 'Testing - done';
                        });
                    }
                }, 1000);
            }
        }
    }
})();
