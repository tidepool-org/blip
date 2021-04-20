/* Stonly widget */
const STONLY_WID = "__STONLY_WID__";
function loadStonlyWidget() {
  !(function (s, t, o, n, l, y, w, g) {
    s.StonlyWidget ||
      (((w = s.StonlyWidget = function () {
        w._api ? w._api.apply(w, arguments) : w.queue.push(arguments);
      }).queue = []),
      ((y = t.createElement(o)).async = !0),
      (g = new XMLHttpRequest()).open("GET", n + "version?v=" + Date.now(), !0),
      (g.onreadystatechange = function () {
        4 === g.readyState &&
          ((y.src = n + "stonly-widget.js?v=" + (200 === g.status ? g.responseText : Date.now())),
          (l = t.getElementsByTagName(o)[0]).parentNode.insertBefore(y, l));
      }),
      g.send());
  })(window, document, "script", "https://stonly.com/js/widget/v2/");
}
