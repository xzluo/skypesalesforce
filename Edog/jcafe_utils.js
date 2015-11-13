/**
 * @dependencies Q, SCL2, JCafe, Skypeweb,
 */

window.jCafe = window.jCafe || {};
window.jCafe.utils = window.jCafe.utils || {};

// @param {promise[]} - promise array
window.jCafe.utils.allSettled = function (promises) {
    var length = promises.length;
    var i = 0;

    for (i = 0; i < length; i++) {
        if (promises[i].inspect().state === 'pending') {
            return false;
        }
    }

    return true;
}

window.jCafe.utils.allFulfilled = function (promises) {
    var length = promises.length;
    var i = 0;

    for (i = 0; i < length; i++) {
        if (promises[i].inspect().state !== 'fulfilled') {
            return false;
        }
    }

    return true;
}

window.jCafe.utils.anyRejected = function (promises) {
    var length = promises.length;
    var i = 0;

    for (i = 0; i < length; i++) {
        if (promises[i].inspect().state === 'rejected') {
            return true;
        }
    }

    return false;
}

window.jCafe.utils.initApp = function (app) {
    var newApp
      , p
      , dfd = Q.defer();

    if (app && app.application().signInManager.state() != 'SignedOut') {
        p = SCL2.signOut(app);
    }

    if (p) {
        p.then(function () {
            newApp = new JCafe();
            newApp.init(new Application());
            dfd.resolve(newApp);
        })
    } else {
        newApp = new JCafe();
        newApp.init(new Application());
        dfd.resolve(newApp);
    }
    return dfd.promise;
}

