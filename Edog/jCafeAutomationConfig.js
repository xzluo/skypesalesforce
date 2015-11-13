'use strict'

var jCafeAutomationConfig = {
    testTopology: 'edog'
};

jCafeAutomationConfig.topologies = {
    clientsemain: {
        domainName: 'clientsemain.rtmp.selfhost.corp.microsoft.com',
        authType: 'password',
        users: [
             {
                 uri: 'wewa1@clientsemain.rtmp.selfhost.corp.microsoft.com',
                 username: 'wewa1@clientsemain.rtmp.selfhost.corp.microsoft.com',
                 password: 'wewa1',
                 displayName: 'Wei Wang1'
             }
        ]
    },
    edog: {
        //domainName: 'ucwa.ccsctp.net',
        domainName: 'devex.ccsctp.net',
        authType: 'oauth',
        clientID: 'd3590ed6-52b3-4102-aeff-aad2292ab01c',
        resourceAppIdUrl: 'https://webdir0d.tip.lync.com',
        authorityUrl: 'https://login.windows-ppe.net/common/oauth2/authorize/',
        ucwaServerFQDN: 'https://webdir0d.tip.lync.com',
        origins: [{
            origin: 'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root?originalDomain=devex.ccsctp.net',
            xframe: 'https://webdir0d.tip.lync.com/xframe'
        }],
        users: [
            {
                //uri: 'ucwaperf82@ucwa.ccsctp.net',
                //username: 'ucwaperf82@ucwa.ccsctp.net',
                uri: 'cafe1@devex.ccsctp.net',
                username: 'cafe1@devex.ccsctp.net',
                password: '07Apples',
                displayName: 'Ucja Cafe1'
            },
            {
                //uri: 'ucwaperf83@ucwa.ccsctp.net',
                //username: 'ucwaperf83@ucwa.ccsctp.net',
                uri: 'cafe2@devex.ccsctp.net',
                username: 'cafe2@devex.ccsctp.net',
                password: '07Apples',
                displayName: 'Ucja Cafe2'
            },
            {
                //uri: 'ucwaperf84@ucwa.ccsctp.net',
                //username: 'ucwaperf84@ucwa.ccsctp.net',
                uri: 'cafe3@devex.ccsctp.net',
                username: 'cafe3@devex.ccsctp.net',
                password: '07Apples',
                displayName: 'Ucja Cafe3'
            }
        ]
    }
};
