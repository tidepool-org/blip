var _paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['setDoNotTrack', true]);
_paq.push(['requireConsent']);
_paq.push(['trackPageView']);
(function () {
    const u = '//localhost:8091/';
    const id = 1;
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', id]);
})();
