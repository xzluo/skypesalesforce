'use strict';

var fqdn = 'devex.ccsctp.net';
var origins = [{
    origin: 'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root?originalDomain=' + fqdn,
    xframe: 'https://webdir.tip.lync.com/xframe'
}];

var app;
var url = window.location.toString();
var query_string = url.split('?');
var query = {};
var params = {};
var bid;
var sclProxy;
var sclProxy2;
var sclProxy3;
var jCafeDriverUrl = 'http://localhost/';
var proxySocket;

function initLocalApp() {
    if (app && app.application().signInManager.state() != 'SignedOut') {
        app.application().signInManager.signOut().then(function () {
            initLocalAppInternal();
        })
    } else {
        initLocalAppInternal();
    }
}

// Telemetry Logger using Aria Library
function TelemetryManager() {
    var logger;
    
    function init(tenantId) {
        microsoft.applications.telemetry.LogManager.initialize(tenantId);
        logger = new microsoft.applications.telemetry.Logger();
    }
    
    function sendEvent(tenantId, eventName, options) {
        if (!logger) {
            init(tenantId);
        }
        logger.logEvent(eventName, [options]);
    }
    
    return {
        sendEvent: sendEvent
    }
}


function initLocalAppInternal() {
    app = new JCafe(new Application());
    app = new JCafe(new Application({telemetryManager: new TelemetryManager()}));
    app.on('event', function (data) {
       // console.log('[app] ', data);
    })

    app.init();
}

function initRemoteApp(id) {
    SCL2Remote(jCafeDriverUrl, id);
}

function initTest(id) {
    proxySocket = io.connect('http://localhost/');
    proxySocket.on('connect', function () {
        sclProxy = SCL2Proxy(proxySocket, 'e2', id);
        sclProxy.register();
        sclProxy3 = SCL2Proxy(proxySocket, 'e3', id);
        //sclProxy3.register();
    });

}

initLocalApp();
