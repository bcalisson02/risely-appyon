import { router, Href } from 'expo-router';

/**
 * Back with a fallback. A screen opened directly (page refresh, shared link) has no history,
 * so a plain router.back() would do nothing; this lands on the screen it naturally sits on.
 */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

/** Close every modal and sheet, then show a tab (N5 → N7, N6 → N7, W7 → W1). */
export function closeTo(tab: Href) {
  if (router.canDismiss()) {
    router.dismissAll();
    router.navigate(tab);
  } else {
    // opened directly (refresh): nothing underneath, so the finished flow is replaced, not stacked on
    router.replace(tab);
  }
}
