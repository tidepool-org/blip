var _paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['setDoNotTrack', true]);
_paq.push(['requireConsent']);
_paq.push(['enableHeartBeatTimer']);
_paq.push(['setSecureCookie', true]);
_paq.push(['setCookieSameSite', 'Strict']);
_paq.push(['setVisitorCookieTimeout', 6*30*24*60*60]); // ~6 months
_paq.push(['setRequestMethod', 'POST']);
(function () {
    const u = '//localhost:8091/';
    const id = 1;
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', id]);
})();
