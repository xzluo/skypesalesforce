/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
define(["require", "exports", './Logger', "../utils/Constants"], function (require, exports, Logger_1, Constants_1) {
    "use strict";
    var AuthModule = (function () {
        function AuthModule() {
            this.authContext = null;
            if (AuthModule.instance) {
                throw new Error("Error: Instantiation failed: Use AuthModule.getInstance() instead of new.");
            }
            AuthModule.instance = this;
        }
        AuthModule.prototype.initialize = function () {
            Logger_1.default.log('Initializing ADAL');
            // Set up logginf for Adal.js
            // Disabled until we get back to a version that supports it (1.0.6 or greater)
            //Logger.setupAdalLogger();
            Logger_1.default.log('Creating the authentication context');
            this.authContext = new AuthenticationContext({
                instance: Constants_1.default.AzureADInstanceUrl,
                tenant: Constants_1.default.AzureADTenant,
                clientId: Constants_1.default.AzureClientId,
                cacheLocation: 'localStorage',
                redirectUri: window.location.origin
            });
            Logger_1.default.log('Handling callback after login');
            this.authContext.handleWindowCallback();
            // Trigger a login if the user is not authenticated.
            if (!this.authContext.getCachedUser()) {
                this.authContext.login();
            }
        };
        /**
        * Gets the AAD token. It returns a cached token if there's one and it hasn't expired. Otherwise, it aquires a new token
        * from AAD using a hidden iframe.
        */
        AuthModule.prototype.refreshToken = function (tokenResponseFunction) {
            var _this = this;
            Logger_1.default.log('Check auth token');
            if (!this.authContext) {
                Logger_1.default.log('ADAL has not been set up. Doing it now.');
                this.initialize();
            }
            this.authContext.acquireToken(Constants_1.default.AzureClientId, function (error, token) {
                Logger_1.default.log('Callback after acquiring token');
                if (error || !token) {
                    Logger_1.default.error("Error acquiring token: " + error);
                }
                else {
                    // Only log the token if it changed to reduce noise in the logs.
                    if (_this.currentToken !== token) {
                        _this.currentToken = token;
                        Logger_1.default.info("New AAD token: " + token);
                    }
                }
                tokenResponseFunction(error, token);
            });
        };
        AuthModule.prototype.isUserSignedIn = function () {
            var signedIn = this.authContext !== null && this.authContext.getCachedUser() !== null;
            Logger_1.default.log("isUserSignedIn: " + signedIn);
            return signedIn;
        };
        AuthModule.prototype.isUserInDogfood = function () {
            //var userDomain = this.getUserUpn().split('@')[1].toLowerCase();
            //return constants.DogfoodDomains.indexOf(userDomain) !== -1;
            return true;
        };
        AuthModule.prototype.getUser = function () {
            var user = {
                upn: this.getUserUpn(),
                name: this.getUserDisplayName()
            };
            return user;
        };
        AuthModule.prototype.logout = function () {
            this.authContext.logOut();
        };
        AuthModule.prototype.getUserUpn = function () {
            // user.profile contains a list of key-value pairs of user properties.
            // However for different Azure AD tenants, the key is vary. Below code handles different key in different environment.
            Logger_1.default.log('Getting the UPN of the user');
            if (this.isUserSignedIn()) {
                var user = this.authContext.getCachedUser();
                if (user.profile['upn']) {
                    return user.profile['upn'];
                }
                else if (user.profile['email']) {
                    return user.profile['email'];
                }
            }
            return "";
        };
        AuthModule.prototype.getUserDisplayName = function () {
            // user.profile contains a list of key-value pairs of user properties.
            // However for different Azure AD tenants, the key is vary. Below code handles different key in different environment.
            Logger_1.default.log('Getting the display name of the user');
            if (this.isUserSignedIn()) {
                var user = this.authContext.getCachedUser();
                if (user.profile['given_name'] && user.profile['family_name']) {
                    return user.profile['given_name'] + ' ' + user.profile['family_name'];
                }
                else if (user.profile['name']) {
                    return user.profile['name'];
                }
            }
            return "";
        };
        AuthModule.instance = new AuthModule();
        return AuthModule;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AuthModule;
});
//# sourceMappingURL=AuthModule.js.map