(function () {
    'use strict'
    var webTicketServerUrl = 'http://wewa11:8080';
    var currentWindowOnLoad = window.onload;
    var dfdCache = {};
    var dfdCount = 0;

    window.webTicketReady = window.webTicketReady || function () { };

    window.onload = function () {
        if (currentWindowOnLoad) {
            currentWindowOnLoad();
        }
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.title = new Date().toString();
        iframe.src = webTicketServerUrl + '/index.html';
        iframe.id = 'webticketframe';
        iframe.onload = function () {
            // Signal to the consumer that this iframe is ready.
            if (window.webTicketReady) {
                window.webTicketReady();
            }
        }

        document.body.appendChild(iframe);

        window.addEventListener('message', function (msg) {
            var data;
            if (msg.origin == webTicketServerUrl) {
                // We are only interested in messages from the webticketframe
                data = JSON.parse(msg.data);
                if (dfdCache[data.reqId]) {
                    dfdCache[data.reqId].resolve(data.ticket);
                    delete dfdCache[data.reqId];
                }
            }
        });

        window.jCafe = window.jCafe || {};
        window.jCafe.utils = window.jCafe.utils || {};

        window.getWebTicket = function (topoParams, userParams) {
            var dfd = Q.defer();
            var reqId = dfdCount + '';

            dfdCache[reqId] = dfd;
            dfdCount += 1;

            iframe.contentWindow.postMessage(JSON.stringify({
                username: userParams.username,
                password: userParams.password,
                domainName: topoParams.domainName, //'devex.ccsctp.net',
                clientID: topoParams.clientID, //'d3590ed6-52b3-4102-aeff-aad2292ab01c',
                resourceAppIdUrl: topoParams.resourceAppIdUrl, //'https://webdir0d.tip.lync.com',
                authorityUrl: topoParams.authorityUrl, // 'https://login.windows-ppe.net/common/oauth2/authorize/',
                reqId: reqId
            }), '*');

            return dfd.promise;
        }

        window.getWebTicket.ready = null;

        window.jCafe.utils.getWebTicket = window.getWebTicket;
    }
}());
