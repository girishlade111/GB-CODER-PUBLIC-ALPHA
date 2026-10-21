/** Small, framework-independent controller: shared by static Astro and React. */
export function mountStatusPage(root: HTMLElement): () => void {
  if (root.dataset.statusMounted) return () => {};
  root.dataset.statusMounted = 'true';
  const cleanup: Array<() => void> = [];
  const code = Number(root.dataset.statusCode);
  const oldTitle = document.title;
  document.title = `${code} ${root.querySelector('.status-reason span')?.textContent?.split(' · ')[1] ?? ''} — GB Coder`;
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const oldRobots = robots?.content;
  if (code >= 400) {
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
    robots.content = 'noindex';
  }
  cleanup.push(() => { document.title = oldTitle; if (oldRobots !== undefined && robots) robots.content = oldRobots; else if (code >= 400) robots?.remove(); });
  const path = root.querySelector<HTMLElement>('[data-status-path]');
  if (path) path.textContent = location.pathname;
  const retry = root.querySelector<HTMLAnchorElement>('[data-status-action="retry"]');
  const countdown = root.querySelector<HTMLElement>('[data-status-countdown]');
  const cancel = root.querySelector<HTMLButtonElement>('[data-status-action="cancel"]');
  const key = `gbcoder:status-retry:${location.pathname}`;
  let stopped = false;
  let deadline = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const wait = Number(root.dataset.retryWait || 0);
  const target = root.dataset.redirectHref;
  const redirect = target && /^\/(?!\/)/.test(target) && !/[\\\u0000-\u001f]/.test(target) ? target : undefined;
  let attempts = 0;
  try { attempts = Number(sessionStorage.getItem(key) || 0) || 0; } catch { /* Storage may be disabled. */ }
  const automaticRetry = Number(root.dataset.autoRetrySeconds || 0);
  const limit = Number(root.dataset.autoRetryMax || 3);
  const automatic = Boolean(redirect || (automaticRetry && attempts < limit));
  const seconds = wait || (redirect ? Number(root.dataset.redirectSeconds) : automaticRetry * 2 ** attempts);
  const stop = () => { stopped = true; if (timer) clearInterval(timer); if (cancel) cancel.hidden = true; };
  if (seconds > 0 && countdown) {
    deadline = Date.now() + seconds * 1000;
    if (cancel && automatic) cancel.hidden = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (wait && retry) {
        retry.setAttribute('aria-disabled', String(remaining > 0));
        countdown.textContent = remaining ? `You can try again in ${remaining} ${remaining === 1 ? 'second' : 'seconds'}.` : 'Ready when you are. You can try again now.';
      } else countdown.textContent = redirect ? `Continuing in ${remaining} ${remaining === 1 ? 'second' : 'seconds'}.` : `Trying again in ${remaining} ${remaining === 1 ? 'second' : 'seconds'} (attempt ${attempts + 1} of ${limit}).`;
      if (!remaining) {
        stop();
        if (redirect) location.assign(redirect);
        else if (!wait && automaticRetry) {
          // Never auto-reload when persistence is unavailable: otherwise a reload
          // would reset the limit and could create an unbounded retry loop.
          try { sessionStorage.setItem(key, String(attempts + 1)); location.reload(); } catch { countdown.textContent = 'Automatic retry stopped. Use Retry when you’re ready.'; }
        }
      }
    };
    if (!automaticRetry || automatic) { tick(); timer = setInterval(tick, 1000); }
    else countdown.textContent = 'Automatic retries are paused. Use Retry when you’re ready.';
  }
  const onClick = (event: MouseEvent) => {
    const control = (event.target as Element).closest<HTMLElement>('[data-status-action]');
    if (!control || !root.contains(control) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    switch (control.dataset.statusAction) {
      case 'back': {
        let sameSite = false;
        try { sameSite = Boolean(document.referrer && new URL(document.referrer).origin === location.origin); } catch { /* Fall back to home. */ }
        if (history.length > 1 && sameSite) { event.preventDefault(); history.back(); }
        break;
      }
      case 'retry':
        event.preventDefault();
        if (wait && Date.now() < deadline && !stopped) return;
        try { sessionStorage.removeItem(key); } catch { /* A manual retry still works. */ }
        location.reload();
        break;
      case 'cancel':
        stop();
        if (countdown) countdown.textContent = redirect ? 'Redirect cancelled. Continue with Go now whenever you’re ready.' : 'Automatic retry cancelled. You can still use Retry.';
        // Keep keyboard focus on the nearby manual action after hiding Cancel.
        root.querySelector<HTMLElement>(redirect ? '[data-status-action="go-now"]' : '[data-status-action="retry"]')?.focus();
        break;
    }
  };
  root.addEventListener('click', onClick);
  return () => { stop(); root.removeEventListener('click', onClick); delete root.dataset.statusMounted; cleanup.forEach(fn => fn()); };
}
