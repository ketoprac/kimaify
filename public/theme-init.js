// Theme bootstrap — must stay a plain (non-module) script in <head> so it runs
// before first paint and avoids a dark-mode flash. Kept external so the site
// CSP can be `script-src 'self'` with no inline-script exceptions.
(function() {
  var stored = localStorage.getItem('theme');
  var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
})();
