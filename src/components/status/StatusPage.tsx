import { useEffect, useRef, type ReactNode } from 'react';
import { ICON_PATHS, type IconName } from '../../../apps/marketing/src/components/ui/icons';
import { getStatusConfig, safeStatusHref } from './status-config';
import { mountStatusPage } from './status-client';
import './status-page.css';

export interface StatusPageProps {
  code: number;
  theme?: 'auto' | 'light' | 'dark';
  /** The app has no account login route yet; supply the real URL when available. */
  loginHref?: string;
  retryAfterSeconds?: number;
  redirect?: { href: string; seconds?: number };
  /** Opt-in only. Attempts persist across reloads and stop after maxAttempts. */
  autoRetry?: { seconds?: number; maxAttempts?: number };
  devDetails?: string;
  recoveryActions?: ReactNode;
}

function Icon({ name }: { name: IconName }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }} />;
}

const places = [
  { href: '/app/projects', title: 'Open the studio', text: 'Get back to building.' },
  { href: '/docs', title: 'Read the docs', text: 'Find your next step.' },
  { href: '/features', title: 'Explore features', text: 'See what you can make.' },
  { href: '/contact', title: 'Get in touch', text: 'We’re here to help.' },
];
const variantIcons: Record<string, IconName> = { processing: 'clock', success: 'check', direction: 'arrow-right', lost: 'arrow-right', signal: 'zap' };

/** SSR in Astro (no React hydration); also mounts directly in the React boundary. */
export default function StatusPage({ code, theme = 'auto', loginHref, retryAfterSeconds = 30, redirect, autoRetry, devDetails, recoveryActions }: StatusPageProps) {
  const status = getStatusConfig(code);
  const root = useRef<HTMLDivElement>(null);
  const redirectHref = status.class === 3 && redirect ? safeStatusHref(redirect.href, '') : '';
  const canAutoRetry = (status.code === 503 || status.code === 504) && autoRetry;
  const retryWait = status.code === 429 ? Math.max(0, Math.min(86400, retryAfterSeconds)) : 0;
  useEffect(() => root.current ? mountStatusPage(root.current) : undefined, [code, retryAfterSeconds, redirectHref, autoRetry]);
  const primary = status.primaryCta.action === 'login' && loginHref
    ? { ...status.primaryCta, label: 'Sign in', href: safeStatusHref(loginHref, '/contact') }
    : status.primaryCta;
  return <div ref={root} className="status-page" data-status-code={status.code} data-status-class={status.class} data-status-variant={status.variant} data-status-tone={status.accentTone} data-status-theme={theme}
    data-retry-wait={retryWait} data-redirect-href={redirectHref || undefined} data-redirect-seconds={redirectHref ? Math.max(1, Math.min(300, redirect?.seconds ?? 8)) : undefined}
    data-auto-retry-seconds={canAutoRetry ? Math.max(1, autoRetry.seconds ?? 10) : undefined} data-auto-retry-max={canAutoRetry ? Math.max(1, Math.min(5, autoRetry.maxAttempts ?? 3)) : undefined}>
    <a className="status-skip" href="#status-main">Skip to main content</a>
    <header className="status-header">
      <a className="status-brand" href="/" aria-label="GB Coder — home"><span className="status-brand-mark" aria-hidden="true">GB</span><span><strong>GB Coder</strong><small>LadeStack</small></span></a>
      <a className="status-text-link" href="/app/projects">Open studio <Icon name="arrow-up-right" /></a>
    </header>
    <main className="status-main" id="status-main" tabIndex={-1}>
      <section className="status-hero" aria-labelledby="status-title">
        <div className="status-art status-reveal" aria-hidden="true">
          <div className="status-code">{String(status.code).split('').map((digit, index) => <span key={index} className={index === 1 ? 'status-center-digit' : undefined}>{digit}</span>)}</div>
          <div className="status-motif"><span /><Icon name={variantIcons[status.variant]} /><span /></div>
        </div>
        <h1 className="status-title status-reveal" id="status-title">{status.title}</h1>
        <p className="status-message status-reveal">{status.message}</p>
        <div className="status-actions status-reveal">
          <a className="status-button" href={safeStatusHref(primary.href)} data-status-action={primary.action}><Icon name={primary.action === 'retry' ? 'clock' : primary.action === 'login' ? 'lock' : 'arrow-left'} /><span>{primary.label}</span></a>
          <a className="status-button status-button-outline" href={safeStatusHref(status.secondaryCta.href)} data-status-action={status.secondaryCta.action}>{status.secondaryCta.label}</a>
          {(primary.href !== '/' || primary.action === 'retry' || primary.action === 'back') && <a className="status-text-link" href="/">Go to Home</a>}
        </div>
        <p className="status-hint status-reveal">{status.hint}</p>
        <p className="status-reason status-reveal"><span>{status.code} · {status.reason}</span>{status.class >= 4 && <code className="status-path" data-status-path />}</p>
        {(retryWait > 0 || redirectHref || canAutoRetry) && <div className="status-timer-region">
          <p className="status-timer" role="status" aria-live="polite" aria-atomic="true" data-status-countdown>{retryWait ? `You can try again in ${retryWait} seconds.` : 'Automatic navigation is off until the page is ready.'}</p>
          {redirectHref && <a className="status-button status-button-outline" href={redirectHref} data-status-action="go-now">Go now</a>}
          {(redirectHref || canAutoRetry) && <button className="status-text-link" type="button" data-status-action="cancel" hidden>Cancel {redirectHref ? 'redirect' : 'auto-retry'}</button>}
        </div>}
        {status.class >= 5 && <p className="status-support"><a className="status-text-link" href="/contact">Contact us <Icon name="arrow-up-right" /></a></p>}
        {recoveryActions && <div className="status-recovery">{recoveryActions}</div>}
        {import.meta.env.DEV && devDetails && <details className="status-details"><summary>Developer details</summary><pre>{devDetails}</pre></details>}
      </section>
      {status.class === 4 && <nav className="status-destinations status-reveal" aria-labelledby="status-destinations-title">
        <h2 id="status-destinations-title">A few familiar places</h2><ul>{places.map(place => <li key={place.href}><a href={place.href}><span><strong>{place.title}</strong><span>{place.text}</span></span><Icon name="arrow-up-right" /></a></li>)}</ul>
      </nav>}
    </main>
    <footer className="status-footer"><span>GB Coder by LadeStack</span><nav aria-label="Footer"><a className="status-text-link" href="/sitemap">All pages</a><a className="status-text-link" href="/contact">Contact</a></nav></footer>
  </div>;
}
