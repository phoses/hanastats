import { watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { chromeForRoute } from '../routeChrome';

function setSvgFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link#app-favicon');
  if (!link) {
    link = document.createElement('link');
    link.id = 'app-favicon';
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function useRouteChrome() {
  const route = useRoute();

  watchEffect(() => {
    const chrome = chromeForRoute(route.name);
    document.title = `${chrome.title} · hanastats`;
    setSvgFavicon(chrome.favicon);
  });
}
