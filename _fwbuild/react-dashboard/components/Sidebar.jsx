      /** Sidebar: brand, collapsible nav sections, and the signed-in account block. */

      import { NAV_SECTIONS, NAV_ICONS } from '../data/mockData.js';

      const Glyph = ({ name, size = 17 }) => (
        <svg className="nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name] || NAV_ICONS.chart} />
        </svg>
      );

      /**
       * @param {object} props
       * @param {string} props.active     currently selected nav id
       * @param {boolean} props.collapsed desktop icon-rail mode
       * @param {boolean} props.mobileOpen phone drawer mode
       */
      export default function Sidebar({ active, onSelect, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
        return (
          <>
            {/*
              Scrim behind the phone drawer. It is a real button so that tapping the
              scrim is reachable by keyboard as well as by touch, and it carries the
              accessible name rather than relying on the icon.
            */}
            {mobileOpen ? (
              <button type="button" className="scrim" aria-label="Close navigation" onClick={onCloseMobile} />
            ) : null}

            <aside
              className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '') + (mobileOpen ? ' sidebar--open' : '')}
              aria-label="Primary"
              id="sidebar"
            >
              <div className="sidebar__brand">
                <span className="sidebar__mark" aria-hidden="true">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
                  </svg>
                </span>
                <span className="sidebar__name">
                  <strong>Meridian</strong>
                  <small>Commerce ops</small>
                </span>
              </div>

              <nav className="sidebar__nav" aria-label="Sections">
                {NAV_SECTIONS.map((section) => (
                  <div className="nav-section" key={section.id}>
                    <h2 className="nav-section__title">{section.label}</h2>
                    <ul className="nav-list">
                      {section.items.map((item) => {
                        const on = item.id === active;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className={'nav-item' + (on ? ' nav-item--on' : '')}
                              aria-current={on ? 'page' : undefined}
                              onClick={() => {
                                onSelect(item.id);
                                onCloseMobile();
                              }}
                              title={collapsed ? item.label : undefined}
                            >
                              <Glyph name={item.icon} />
                              <span className="nav-item__label">{item.label}</span>
                              {item.badge ? <span className="nav-item__badge">{item.badge}</span> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="sidebar__foot">
                <div className="sidebar__user">
                  <span className="avatar" aria-hidden="true">FO</span>
                  <span className="sidebar__user-text">
                    <strong>Frances Okoye</strong>
                    <small>Operations lead</small>
                  </span>
                </div>

                <button
                  type="button"
                  className="sidebar__collapse"
                  onClick={onToggleCollapse}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-expanded={!collapsed}
                  aria-controls="sidebar"
                >
                  <svg className={'nav-icon' + (collapsed ? ' is-flipped' : '')} width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true" focusable="false">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sidebar__collapse-text">Collapse</span>
                </button>
              </div>
            </aside>
          </>
        );
      }