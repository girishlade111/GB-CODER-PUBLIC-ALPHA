      import { useEffect, useRef, useState } from 'react';
      import { NAV_ICONS } from '../data/mockData.js';

      const Glyph = ({ name, size = 17 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name] || NAV_ICONS.chart} />
        </svg>
      );

      const NOTIFICATIONS = [
        { id: 'n1', tone: 'warn', title: 'Checkout conversion down 0.6 points', meta: 'Analytics · 2 hours ago' },
        { id: 'n2', tone: 'danger', title: 'Frankfurt edge returning 502s', meta: 'Infrastructure · 34 minutes ago' },
        { id: 'n3', tone: 'info', title: 'Release 2026.03.4 deployed', meta: 'Deploy bot · 48 minutes ago' },
        { id: 'n4', tone: 'ok', title: 'Kessler order awaiting approval', meta: 'Orders · 12 minutes ago' },
      ];

      const USER_MENU = [
        { id: 'profile', label: 'Profile', icon: 'sliders' },
        { id: 'billing', label: 'Billing', icon: 'database' },
        { id: 'docs', label: 'Documentation', icon: 'external' },
        { id: 'signout', label: 'Sign out', icon: 'logout' },
      ];

      /**
       * A dropdown primitive, written once and used twice.
       *
       * Both dropdowns close on Escape and on outside click, return focus to their
       * trigger, and expose `aria-expanded` / `aria-controls` correctly. That is the
       * behaviour a menu button owes its user, and hand-rolling it once avoids two
       * subtly different copies.
       */
      function Dropdown({ id, label, button, children, align = 'right' }) {
        const [open, setOpen] = useState(false);
        const wrapRef = useRef(null);
        const triggerRef = useRef(null);

        useEffect(() => {
          if (!open) return undefined;

          const onDocumentClick = (event) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
          };
          const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            setOpen(false);
            if (triggerRef.current) triggerRef.current.focus();
          };

          document.addEventListener('mousedown', onDocumentClick);
          document.addEventListener('keydown', onKeyDown);
          return () => {
            document.removeEventListener('mousedown', onDocumentClick);
            document.removeEventListener('keydown', onKeyDown);
          };
        }, [open]);

        return (
          <div className={'dropdown dropdown--' + align} ref={wrapRef}>
            <button
              ref={triggerRef}
              type="button"
              className={'topbar__trigger' + (open ? ' topbar__trigger--on' : '')}
              aria-expanded={open}
              aria-controls={id}
              aria-haspopup="true"
              onClick={() => setOpen((value) => !value)}
            >
              {button}
            </button>

            {open ? (
              <div className="dropdown__panel" id={id} role="menu" aria-label={label}>
                {children}
              </div>
            ) : null}
          </div>
        );
      }

      export default function Topbar({ activeLabel, onOpenMenu, isCompact }) {
        const [term, setTerm] = useState('');

        return (
          <header className="topbar">
            <div className="topbar__left">
              <button
                type="button"
                className="topbar__icon-btn topbar__burger"
                onClick={onOpenMenu}
                aria-label="Open navigation"
                aria-controls="sidebar"
                aria-expanded={undefined}
              >
                <Glyph name="menu" size={19} />
              </button>

              <div className="topbar__titles">
                <p className="topbar__crumb">Meridian Commerce</p>
                <h1 className="topbar__title">{activeLabel}</h1>
              </div>
            </div>

            <div className="topbar__search">
              <label className="sr-only" htmlFor="global-search">
                Search orders, customers and invoices
              </label>
              <svg className="topbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
              </svg>
              <input
                id="global-search"
                className="input"
                type="search"
                value={term}
                placeholder={isCompact ? 'Search' : 'Search orders, customers, invoices'}
                autoComplete="off"
                onChange={(event) => setTerm(event.target.value)}
              />
              {term ? (
                <button type="button" className="topbar__search-clear" onClick={() => setTerm('')} aria-label="Clear search">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="topbar__actions">
              <Dropdown
                id="notif-menu"
                label="Notifications"
                button={
                  <>
                    <Glyph name="bell" />
                    <span className="topbar__action-label">Alerts</span>
                    <span className="dot-badge" aria-hidden="true">4</span>
                    <span className="sr-only">, 4 unread notifications</span>
                  </>
                }
              >
                <p className="dropdown__head">
                  Notifications
                  <span className="dropdown__count">4 new</span>
                </p>
                <ul className="notif-list">
                  {NOTIFICATIONS.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="notif" role="menuitem">
                        <span className={'notif__dot notif__dot--' + item.tone} aria-hidden="true" />
                        <span className="notif__text">
                          <span className="notif__title">{item.title}</span>
                          <span className="notif__meta">{item.meta}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>

              <Dropdown
                id="user-menu"
                label="Account"
                button={
                  <>
                    <span className="avatar avatar--sm" aria-hidden="true">FO</span>
                    <span className="topbar__user-name">Frances</span>
                    <svg className="topbar__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true" focusable="false">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </>
                }
              >
                <p className="dropdown__head">Signed in as Frances Okoye</p>
                <ul className="menu-list">
                  {USER_MENU.map((item) => (
                    <li key={item.id}>
                      <button type="button" className={'menu-item' + (item.id === 'signout' ? ' menu-item--warn' : '')} role="menuitem">
                        <Glyph name={item.icon} size={16} />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
          </header>
        );
      }