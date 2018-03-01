const { url, URLSearchParams } = require('url');

module.exports = {

    // get apple id from url
    getAppleAppId(appUrl) {
        const path = url.parse(appUrl, true);
         names = path.pathname.split('/');
         return names[3];
    },
    getDomain(href) {
        const d = url.parse(href);
        return d.hostname;
    },
    getParam(key) {
        const d = url.parse(href);
      return  d.searchParams.get(key);
    }
}