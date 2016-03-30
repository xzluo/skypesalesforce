/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
"use strict";
requirejs.config({
    config: {},
    paths: {
        "jquery": "libs/jquery",
        "knockout": "libs/knockout",
        "komapping": "libs/knockout.mapping",
        "bootstrap": "libs/bootstrap",
        "moment": "libs/moment-with-locales.min",
        "adal": "libs/adal"
    },
    shim: {
        jquery: {
            exports: "$"
        },
        knockout: {
            exports: "ko"
        },
        komapping: {
            deps: ["knockout"],
            exports: "komapping"
        },
        bootstrap: {
            deps: ["jquery"],
            exports: "bootstrap"
        },
        adal: {
            exports: "adal"
        }
    }
});
require(["jquery", "bootstrap", "app"]);
//# sourceMappingURL=app.config.js.map