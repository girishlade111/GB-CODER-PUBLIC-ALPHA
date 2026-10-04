      /**
       * Static weather dataset for six cities.
       *
       * There is no network call anywhere in this template. Everything below is a
       * literal value or a deterministic function of literal values, so the dashboard
       * renders identically on every load and in every sandbox.
       *
       * Hourly series are built from a sine curve anchored to each city's real
       * climatology (daily low, daily high, and the hour the minimum falls at). That
       * gives a believable diurnal curve for ~30 lines of data instead of 144 hand
       * typed numbers per city, and it stays static.
       */

      export const CONDITIONS = {
        clear: { label: 'Clear', icon: 'clear', sky: 'sky-clear' },
        partly: { label: 'Partly cloudy', icon: 'partly', sky: 'sky-partly' },
        cloudy: { label: 'Cloudy', icon: 'cloudy', sky: 'sky-cloudy' },
        overcast: { label: 'Overcast', icon: 'overcast', sky: 'sky-overcast' },
        rain: { label: 'Light rain', icon: 'rain', sky: 'sky-rain' },
        heavyrain: { label: 'Heavy rain', icon: 'heavyrain', sky: 'sky-rain' },
        drizzle: { label: 'Drizzle', icon: 'drizzle', sky: 'sky-drizzle' },
        thunder: { label: 'Thunderstorms', icon: 'thunder', sky: 'sky-thunder' },
        snow: { label: 'Snow showers', icon: 'snow', sky: 'sky-snow' },
        fog: { label: 'Fog', icon: 'fog', sky: 'sky-fog' },
        wind: { label: 'Blustery', icon: 'wind', sky: 'sky-wind' },
      };

      const HOUR_LABELS = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
      ];

      /**
       * Builds a 24-hour temperature curve.
       *
       * `low` and `high` are the extremes for the local day; `troughHour` is when the
       * minimum lands (just before dawn, in most of the world). A single cosine gives
       * the shape; the `spread` term adds a little asymmetry so dawn feels colder than
       * the mirror of dusk.
       */
      const hourlyTemps = (low, high, troughHour) => {
        const mid = (low + high) / 2;
        const amp = (high - low) / 2;
        return HOUR_LABELS.map((label, hour) => {
          const phase = ((hour - troughHour + 24) % 24) / 24;
          const shaped = Math.cos(phase * Math.PI * 2);
          const drift = hour < 12 ? -0.6 : 0.6;
          const value = mid + amp * shaped + drift * (amp / 12);
          return {
            time: label,
            tempC: Math.round(value * 10) / 10,
            precip: precipCurve(hour, hour < 6 || hour > 19 ? 8 : 2),
          };
        });
      };

      /** Probability of precipitation, peaked in the small hours for most climates. */
      const precipCurve = (hour, base) => {
        const afternoonLift = hour >= 13 && hour <= 18 ? 14 : 0;
        const wave = Math.sin((hour / 24) * Math.PI * 2);
        return Math.max(0, Math.min(96, Math.round(base + afternoonLift + wave * 18)));
      };

      /** Precipitation chance for the seven-day strip, deterministic per city. */
      const dailyPrecip = (seed, lows) =>
        lows.map((_, i) => Math.max(0, Math.min(95, Math.round((seed * (i + 3)) % 78 + ((seed + i * 5) % 17)))));

      /**
       * The dataset. `phaseSeed` nudges the sky's day/night grading; `updatedMinutes`
       * drives the "updated n minutes ago" stamp so the relative time is real.
       */
      export const CITIES = [
        {
          id: 'lisbon',
          name: 'Lisbon',
          region: 'Lisbon District',
          country: 'Portugal',
          timezone: 'WET (UTC+0)',
          lat: '38.7223 N',
          accent: '#f5a524',
          updatedMinutes: 4,
          current: {
            tempC: 24.6, feelsLikeC: 25.1, condition: 'clear', humidity: 41, windKph: 11,
            windDir: 'NW', uv: 7, visibilityKm: 24, pressure: 1018, dewC: 10.2, gustKph: 19,
          },
          daily: {
            lowC: 17.1, highC: 27.3, troughHour: 6,
            sunrise: '06:44', sunset: '20:36',
            conditions: ['clear', 'clear', 'partly', 'clear', 'wind', 'partly', 'clear'],
          },
        },
        {
          id: 'reykjavik',
          name: 'Reykjavik',
          region: 'Capital Region',
          country: 'Iceland',
          timezone: 'GMT (UTC+0)',
          lat: '64.1466 N',
          accent: '#5b8def',
          updatedMinutes: 11,
          current: {
            tempC: 3.8, feelsLikeC: -1.2, condition: 'snow', humidity: 78, windKph: 34,
            windDir: 'ENE', uv: 1, visibilityKm: 6, pressure: 1002, dewC: 0.4, gustKph: 58,
          },
          daily: {
            lowC: 0.4, highC: 6.2, troughHour: 4,
            sunrise: '09:12', sunset: '17:04',
            conditions: ['snow', 'snow', 'cloudy', 'overcast', 'drizzle', 'wind', 'partly'],
          },
        },
        {
          id: 'singapore',
          name: 'Singapore',
          region: 'Central Singapore',
          country: 'Singapore',
          timezone: 'SGT (UTC+8)',
          lat: '1.3521 N',
          accent: '#2fb87a',
          updatedMinutes: 2,
          current: {
            tempC: 30.2, feelsLikeC: 34.8, condition: 'thunder', humidity: 88, windKph: 7,
            windDir: 'S', uv: 8, visibilityKm: 9, pressure: 1009, dewC: 27.9, gustKph: 21,
          },
          daily: {
            lowC: 25.9, highC: 32.4, troughHour: 5,
            sunrise: '07:04', sunset: '19:18',
            conditions: ['thunder', 'rain', 'heavyrain', 'partly', 'thunder', 'cloudy', 'rain'],
          },
        },
        {
          id: 'vancouver',
          name: 'Vancouver',
          region: 'British Columbia',
          country: 'Canada',
          timezone: 'PST (UTC-8)',
          lat: '49.2827 N',
          accent: '#8b5cf6',
          updatedMinutes: 7,
          current: {
            tempC: 13.1, feelsLikeC: 12.4, condition: 'drizzle', humidity: 86, windKph: 14,
            windDir: 'SW', uv: 2, visibilityKm: 11, pressure: 1011, dewC: 10.9, gustKph: 27,
          },
          daily: {
            lowC: 9.8, highC: 16.7, troughHour: 5,
            sunrise: '06:32', sunset: '20:14',
            conditions: ['drizzle', 'overcast', 'rain', 'partly', 'cloudy', 'rain', 'partly'],
          },
        },
        {
          id: 'nairobi',
          name: 'Nairobi',
          region: 'Nairobi County',
          country: 'Kenya',
          timezone: 'EAT (UTC+3)',
          lat: '1.2921 S',
          accent: '#e5484d',
          updatedMinutes: 1,
          current: {
            tempC: 22.4, feelsLikeC: 22.1, condition: 'partly', humidity: 58, windKph: 16,
            windDir: 'ESE', uv: 9, visibilityKm: 19, pressure: 1015, dewC: 13.6, gustKph: 24,
          },
          daily: {
            lowC: 13.8, highC: 24.9, troughHour: 6,
            sunrise: '06:38', sunset: '18:42',
            conditions: ['clear', 'partly', 'partly', 'cloudy', 'partly', 'clear', 'wind'],
          },
        },
        {
          id: 'tokyo',
          name: 'Tokyo',
          region: 'Kanto',
          country: 'Japan',
          timezone: 'JST (UTC+9)',
          lat: '35.6762 N',
          accent: '#ec4899',
          updatedMinutes: 5,
          current: {
            tempC: 19.7, feelsLikeC: 19.2, condition: 'overcast', humidity: 72, windKph: 9,
            windDir: 'NE', uv: 3, visibilityKm: 14, pressure: 1014, dewC: 14.3, gustKph: 15,
          },
          daily: {
            lowC: 15.2, highC: 21.8, troughHour: 5,
            sunrise: '05:42', sunset: '18:08',
            conditions: ['overcast', 'cloudy', 'rain', 'overcast', 'partly', 'cloudy', 'partly'],
          },
        },
      ];

      const SEEDS = { lisbon: 4, reykjavik: 6, singapore: 2, vancouver: 5, nairobi: 7, tokyo: 3 };
      const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** `YYYY-MM-DD` for `offset` days from today, without touching UTC parsing. */
      const isoDay = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return (
          d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
        );
      };

      /** Expands the compact literals above into the shape the components consume. */
      const buildCity = (city) => {
        const hourly = hourlyTemps(city.daily.lowC, city.daily.highC, city.daily.troughHour);
        const lows = city.daily.conditions.map((_, i) => city.daily.lowC + i);
        const precip = dailyPrecip(SEEDS[city.id], lows);

        const forecast = city.daily.conditions.map((condition, i) => {
          const raw = isoDay(i);
          const [y, m, d] = raw.split('-').map(Number);
          const date = new Date(y, m - 1, d);

          return {
            id: city.id + '-' + i,
            iso: raw,
            weekday: i === 0 ? 'Today' : WEEKDAY_NAMES[date.getDay()],
            dateLabel: MONTH_NAMES[m - 1] + ' ' + d,
            fullDate: WEEKDAY_NAMES[date.getDay()] + ', ' + MONTH_NAMES[m - 1] + ' ' + d,
            condition,
            conditionLabel: CONDITIONS[condition].label,
            icon: CONDITIONS[condition].icon,
            sky: CONDITIONS[condition].sky,
            highC: Math.round(city.daily.highC - i * 0.6 + ((SEEDS[city.id] * (i + 1)) % 4) * 0.4),
            lowC: Math.round(city.daily.lowC + i * 0.3 - ((SEEDS[city.id] * (i + 2)) % 3) * 0.3),
            precipChance: precip[i],
            windKph: Math.round(city.current.windKph * (0.8 + ((SEEDS[city.id] + i) % 5) / 8)),
            sunrise: city.daily.sunrise,
            sunset: city.daily.sunset,
          };
        });

        return {
          ...city,
          conditionLabel: CONDITIONS[city.current.condition].label,
          icon: CONDITIONS[city.current.condition].icon,
          sky: CONDITIONS[city.current.condition].sky,
          today: forecast[0],
          hourly,
          forecast,
        };
      };

      /** Fully expanded dataset. This is the only source the components read. */
      export const WEATHER_DATA = CITIES.map(buildCity);

      /** Case-insensitive match over name, region and country. */
      export function searchCities(query) {
        const needle = String(query || '').trim().toLowerCase();
        if (!needle) return WEATHER_DATA;
        return WEATHER_DATA.filter((city) =>
          (city.name + ' ' + city.region + ' ' + city.country).toLowerCase().indexOf(needle) !== -1,
        );
      }

      /** Every tag in the forecast, de-duplicated, for the "conditions in this week" row. */
      export function conditionSpread(city) {
        const counts = new Map();
        for (const day of city.forecast) counts.set(day.condition, (counts.get(day.condition) || 0) + 1);
        return Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([id, count]) => ({ id, label: CONDITIONS[id].label, icon: CONDITIONS[id].icon, count }));
      }