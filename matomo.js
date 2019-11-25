var _paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["setDoNotTrack", true]);
_paq.push(['requireConsent']);
_paq.push(['trackPageView']);
(function () {
    const u = '//localhost:8091/';
    const id = 1;
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', id]);
    const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'matomo.js';
    s.parentNode.insertBefore(g, s);
})();
