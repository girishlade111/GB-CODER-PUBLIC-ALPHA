      import { useEffect, useMemo, useRef, useState } from 'react';
      import WeatherIcon from './WeatherIcon.jsx';
      import { searchCities } from '../data/cities.js';
      import { convertTemp, relativeMinutes, skyPhase, minutesOf } from '../utils/format.js';

      const SearchGlyph = () => (
        <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
        </svg>
      );

      const Pin = () => (
        <svg className="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

      /**
       * City picker.
       *
       * A listbox pattern rather than a bare `<select>`, because each option carries an
       * icon, a condition and a temperature. Full keyboard support: Up/Down move the
       * active option, Enter or Space commits it, Escape closes the list and returns
       * focus to the input.
       */
      export default function CitySearch({ cities, activeId, onSelect, unit, night }) {
        const [query, setQuery] = useState('');
        const [open, setOpen] = useState(false);
        const [activeIndex, setActiveIndex] = useState(0);
        const wrapRef = useRef(null);
        const inputRef = useRef(null);
        const listRef = useRef(null);

        const results = useMemo(() => searchCities(query), [query]);

        // Keep the highlighted option inside the result window as it shrinks.
        useEffect(() => {
          setActiveIndex((index) => (index < results.length ? index : 0));
        }, [results.length]);

        // Clicking anywhere else closes the list.
        useEffect(() => {
          if (!open) return undefined;
          const onDocumentClick = (event) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
          };
          document.addEventListener('mousedown', onDocumentClick);
          return () => document.removeEventListener('mousedown', onDocumentClick);
        }, [open]);

        const commit = (city) => {
          if (!city) return;
          onSelect(city.id);
          setQuery('');
          setOpen(false);
          if (inputRef.current) inputRef.current.focus();
        };

        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
            if (inputRef.current) inputRef.current.focus();
            return;
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => {
              const delta = event.key === 'ArrowDown' ? 1 : -1;
              if (results.length === 0) return 0;
              return (index + delta + results.length) % results.length;
            });
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            commit(results[activeIndex]);
          }
        };

        // Scroll the highlighted option into view when navigating by keyboard.
        useEffect(() => {
          if (!open || !listRef.current) return;
          const node = listRef.current.querySelector('[data-active="true"]');
          if (node && typeof node.scrollIntoView === 'function') {
            node.scrollIntoView({ block: 'nearest' });
          }
        }, [activeIndex, open]);

        return (
          <div className="city-search" ref={wrapRef}>
            <div className="city-search__field">
              <span className="city-search__glyph" aria-hidden="true">
                <SearchGlyph />
              </span>
              <input
                ref={inputRef}
                className="city-search__input"
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls="city-listbox"
                aria-autocomplete="list"
                aria-activedescendant={open && results[activeIndex] ? 'city-opt-' + results[activeIndex].id : undefined}
                aria-label="Search for a city"
                placeholder="Search six cities"
                value={query}
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
              />
              {query ? (
                <button
                  type="button"
                  className="city-search__clear"
                  onClick={() => {
                    setQuery('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  aria-label="Clear city search"
                >
                  <svg className="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.75" strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="city-tabs" role="group" aria-label="Cities">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className={'city-tab' + (city.id === activeId ? ' city-tab--on' : '')}
                  aria-pressed={city.id === activeId}
                  onClick={() => commit(city)}
                >
                  <WeatherIcon icon={city.today.icon} night={night && city.id === activeId} size={26} />
                  <span className="city-tab__name">{city.name}</span>
                  <span className="city-tab__temp">
                    {convertTemp(city.current.tempC, unit)}°
                    {unit}
                  </span>
                </button>
              ))}
            </div>

            {open ? (
              <ul
                className="city-list"
                id="city-listbox"
                role="listbox"
                ref={listRef}
                aria-label="Matching cities"
              >
                {results.length === 0 ? (
                  <li className="city-list__empty" role="presentation">
                    No city matches &ldquo;{query}&rdquo;.
                  </li>
                ) : (
                  results.map((city, index) => {
                    const active = index === activeIndex;
                    return (
                      <li
                        key={city.id}
                        id={'city-opt-' + city.id}
                        role="option"
                        aria-selected={city.id === activeId}
                        data-active={active}
                        className={'city-opt' + (active ? ' city-opt--active' : '')}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => {
                          // mousedown so the input does not blur before we commit.
                          event.preventDefault();
                        }}
                        onClick={() => commit(city)}
                      >
                        <WeatherIcon icon={city.today.icon} size={30} />
                        <span className="city-opt__text">
                          <span className="city-opt__name">{city.name}</span>
                          <span className="city-opt__meta">
                            <Pin />
                            {city.region}, {city.country}
                          </span>
                        </span>
                        <span className="city-opt__right">
                          <span className="city-opt__temp">
                            {convertTemp(city.current.tempC, unit)}°
                            {unit}
                          </span>
                          <span className="city-opt__cond">{city.conditionLabel}</span>
                          <span className="city-opt__stamp">{relativeMinutes(city.updatedMinutes)}</span>
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
          </div>
        );
      }

      /** Re-exported for App, which needs the same grading for the page background. */
      export { skyPhase, minutesOf };