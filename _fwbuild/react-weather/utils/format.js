      /** Unit conversion, time formatting and the day/night grading used for theming. */

      /** Celsius to Fahrenheit. */
      export const toFahrenheit = (c) => c * 1.8 + 32;

      /** Converts according to the active unit and rounds for display. */
      export const convertTemp = (celsius, unit) =>
        unit === 'F' ? Math.round(toFahrenheit(celsius)) : Math.round(celsius);

      /** Rounds to one decimal, for values shown with more precision than the headline. */
      export const convertTempPrecise = (celsius, unit) => {
        const value = unit === 'F' ? toFahrenheit(celsius) : celsius;
        return Math.round(value * 10) / 10;
      };

      /** Appends the degree sign. The unit letter is rendered separately in the markup. */
      export const degrees = (value) => String(value) + '°';

      /** 24h "07:05" -> "7:05 am", so the time column fits on a phone. */
      export function formatClock(hhmm) {
        const [h, m] = String(hhmm || '0:00').split(':').map(Number);
        const hour = Number.isFinite(h) ? h : 0;
        const suffix = hour >= 12 ? 'pm' : 'am';
        const twelve = hour % 12 === 0 ? 12 : hour % 12;
        return twelve + (m ? ':' + String(m).padStart(2, '0') : '') + suffix;
      }

      /** Minutes since midnight, for a "07:05" string. */
      export const minutesOf = (hhmm) => {
        const [h, m] = String(hhmm || '0:00').split(':').map(Number);
        return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
      };

      /**
       * Where the sun is, as a 0..1 fraction between sunrise and sunset.
       * Clamped at both ends, so before dawn reads 0 and after dusk reads 1.
       */
      export function sunProgress(sunrise, sunset, nowMinutes) {
        const start = minutesOf(sunrise);
        const end = minutesOf(sunset);
        const span = end - start;
        if (span <= 0) return 1;
        const ratio = (nowMinutes - start) / span;
        return Math.max(0, Math.min(1, ratio));
      }

      /**
       * Sky grading from the sun's position: `night` -> `dawn` -> `day` -> `dusk` -> `night`.
       * Used to pick the page gradient, so the theme follows the data rather than the OS.
       */
      export function skyPhase(sunrise, sunset, nowMinutes) {
        const start = minutesOf(sunrise);
        const end = minutesOf(sunset);
        if (nowMinutes < start - 70) return 'night';
        if (nowMinutes < start + 55) return 'dawn';
        if (nowMinutes < end - 60) return 'day';
        if (nowMinutes < end + 40) return 'dusk';
        return 'night';
      }

      /** "just now" / "6 min ago" / "2 h ago", from a minutes-old stamp. */
      export function relativeMinutes(minutes) {
        const n = Math.max(0, Math.round(minutes));
        if (n < 1) return 'just now';
        if (n === 1) return '1 min ago';
        if (n < 60) return n + ' min ago';
        const hours = Math.round(n / 60);
        if (hours === 1) return '1 hour ago';
        return hours + ' hours ago';
      }

      /** Wind direction to a compass point, from degrees. */
      export function compassPoint(degreesCycling) {
        const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round((((degreesCycling % 360) + 360) % 360) / 22.5) % 16;
        return points[index];
      }

      /** UV index band, used for both the label and the meter colour class. */
      export function uvBand(uv) {
        if (uv <= 2) return { label: 'Low', tone: 'low' };
        if (uv <= 5) return { label: 'Moderate', tone: 'moderate' };
        if (uv <= 7) return { label: 'High', tone: 'high' };
        if (uv <= 10) return { label: 'Very high', tone: 'veryhigh' };
        return { label: 'Extreme', tone: 'extreme' };
      }

      /** Humidity band for the same purpose. */
      export function humidityBand(humidity) {
        if (humidity < 30) return { label: 'Dry', tone: 'low' };
        if (humidity < 60) return { label: 'Comfortable', tone: 'moderate' };
        if (humidity < 80) return { label: 'Humid', tone: 'high' };
        return { label: 'Very humid', tone: 'veryhigh' };
      }

      /** Visibility band, in kilometres. */
      export function visibilityBand(km) {
        if (km >= 20) return { label: 'Excellent', tone: 'low' };
        if (km >= 10) return { label: 'Good', tone: 'moderate' };
        if (km >= 5) return { label: 'Moderate', tone: 'high' };
        return { label: 'Poor', tone: 'veryhigh' };
      }

      /** Beaufort-ish description from km/h. */
      export function windBand(kph) {
        if (kph < 2) return 'Calm';
        if (kph < 12) return 'Light breeze';
        if (kph < 29) return 'Moderate breeze';
        if (kph < 50) return 'Fresh wind';
        if (kph < 75) return 'Strong wind';
        return 'Gale force';
      }

      /** Wind speed in the active unit, with a gusts clause when asked for one. */
      export function formatWind(kph, unit, withGusts) {
        const speed = unit === 'F' ? Math.round(kph * 0.621371) : Math.round(kph);
        const label = unit === 'F' ? speed + ' mph' : speed + ' km/h';
        return withGusts ? ', gusts ' + (unit === 'F' ? Math.round(kph * 1.5 * 0.621371) : Math.round(kph * 1.5)) + ' ' + (unit === 'F' ? 'mph' : 'km/h') : label;
      }