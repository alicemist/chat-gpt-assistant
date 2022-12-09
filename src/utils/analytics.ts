import { GA_ID } from "../consts";

export function initializeGoogleAnalytics() {
  const script = document.createElement("script");
  script.async = true;
  script.src = "../static/scripts/ga.js";

  document.body.appendChild(script);

  // @ts-ignore
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    // @ts-ignore
    window.dataLayer.push(arguments);
  }

  gtag("js", new Date());
  gtag("config", GA_ID, {
    send_page_view: false,
  });

  return gtag;
}
