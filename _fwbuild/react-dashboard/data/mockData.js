      /**
       * Mock data for the admin dashboard.
       *
       * Fixed, hand-written values with real names and dates. Nothing is random at
       * runtime, so the table, the chart and the feed always agree with each other.
       */

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** Twelve months of trading figures ending in the current month. */
      const monthLabels = () => {
        const out = [];
        const now = new Date();
        for (let back = 11; back >= 0; back--) {
          const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
          out.push({
            key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
            label: MONTHS[d.getMonth()],
            short: MONTHS[d.getMonth()].slice(0, 1) + d.getMonth(),
          });
        }
        return out;
      };

      /** Gross revenue, in whole pounds, per month. */
      const REVENUE = [128400, 134900, 141250, 139800, 152600, 168300, 161900, 174500, 188200, 196400, 209700, 224800];
      const TARGET = 200000;

      export const REVENUE_SERIES = monthLabels().map((month, i) => ({
        ...month,
        revenue: REVENUE[i],
        target: TARGET,
        orders: Math.round(REVENUE[i] / 268),
      }));

      /** Daily revenue for the last fourteen days, for the KPI sparklines. */
      export const DAILY = [
        { day: 'Mon', value: 6180 }, { day: 'Tue', value: 7240 }, { day: 'Wed', value: 5910 },
        { day: 'Thu', value: 8020 }, { day: 'Fri', value: 9340 }, { day: 'Sat', value: 4120 },
        { day: 'Sun', value: 3860 }, { day: 'Mon', value: 6510 }, { day: 'Tue', value: 7690 },
        { day: 'Wed', value: 6350 }, { day: 'Thu', value: 8480 }, { day: 'Fri', value: 9970 },
        { day: 'Sat', value: 4480 }, { day: 'Sun', value: 4010 },
      ];

      /** Headline KPIs. `delta` is the change against the previous 30 days. */
      export const KPIS = [
        {
          id: 'revenue',
          label: 'Gross revenue',
          value: 224800,
          format: 'currency',
          delta: 7.2,
          deltaLabel: 'vs last month',
          series: REVENUE_SERIES.map((row) => row.revenue),
          tone: 'up',
          note: 'Best month since the series began.',
        },
        {
          id: 'orders',
          label: 'Orders',
          value: 838,
          format: 'number',
          delta: 4.8,
          deltaLabel: 'vs last month',
          series: DAILY.map((row) => row.value),
          tone: 'up',
          note: 'Average basket 268.26.',
        },
        {
          id: 'conversion',
          label: 'Conversion rate',
          value: 3.42,
          format: 'percent',
          delta: -0.6,
          deltaLabel: 'vs last month',
          series: [3.9, 3.7, 3.8, 3.6, 3.5, 3.7, 3.4, 3.3, 3.5, 3.4, 3.3, 3.42],
          tone: 'down',
          note: 'Checkout A/B test reached significance on the 14th.',
        },
        {
          id: 'active',
          label: 'Active accounts',
          value: 6421,
          format: 'number',
          delta: 11.9,
          deltaLabel: 'vs last month',
          series: [4980, 5120, 5290, 5410, 5580, 5740, 5890, 6010, 6120, 6240, 6330, 6421],
          tone: 'up',
          note: 'Two enterprise accounts onboarded in Lyon.',
        },
      ];

      /** Regions, used by the revenue chart's breakdown and the feed. */
      export const REGIONS = [
        { id: 'uk', label: 'United Kingdom', share: 38, revenue: 85424 },
        { id: 'de', label: 'Germany', share: 22, revenue: 49456 },
        { id: 'us', label: 'United States', share: 17, revenue: 38216 },
        { id: 'fr', label: 'France', share: 12, revenue: 26976 },
        { id: 'nl', label: 'Netherlands', share: 7, revenue: 15736 },
        { id: 'other', label: 'Rest of world', share: 4, revenue: 8992 },
      ];

      /** One-line summary shown under the page heading. */
      export const KPI_SUMMARY =
        'Trading day 22 of March 2026. Revenue is tracking 12% ahead of the twelve-month average.';

      /** The order table. Statuses drive the badge colours. */
      export const ORDERS = [
        { id: 'GB-48219', customer: 'Harbour Logistics Ltd', country: 'United Kingdom', email: 'ap@harbourlogistics.co.uk', total: 14820, items: 34, status: 'fulfilled', placed: '2026-03-18', channel: 'Direct' },
        { id: 'GB-48218', customer: 'Ravensworth Dental', country: 'United Kingdom', email: 'orders@ravensworthdental.co.uk', total: 6120, items: 11, status: 'processing', placed: '2026-03-18', channel: 'Partner' },
        { id: 'DE-11907', customer: 'Brenner Werkzeug GmbH', country: 'Germany', email: 'kontakt@brenner-werkzeug.de', total: 22450, items: 58, status: 'fulfilled', placed: '2026-03-17', channel: 'Direct' },
        { id: 'US-90442', customer: 'Cedarline Manufacturing', country: 'United States', email: 'purchasing@cedarline-mfg.com', total: 9875, items: 19, status: 'refunded', placed: '2026-03-17', channel: 'Marketplace' },
        { id: 'FR-03418', customer: 'Atelier Rive Gauche', country: 'France', email: 'contact@atelierrivegauche.fr', total: 3410, items: 7, status: 'fulfilled', placed: '2026-03-16', channel: 'Direct' },
        { id: 'GB-48214', customer: 'Northgate Academy Trust', country: 'United Kingdom', email: 'it@northgate-academy.org.uk', total: 19760, items: 42, status: 'on-hold', placed: '2026-03-16', channel: 'Partner' },
        { id: 'NL-07721', customer: 'Van Doorn Transport BV', country: 'Netherlands', email: 'inkoop@vandoorntransport.nl', total: 8730, items: 15, status: 'processing', placed: '2026-03-15', channel: 'Direct' },
        { id: 'GB-48211', customer: 'Saltmarsh Fisheries', country: 'United Kingdom', email: 'admin@saltmarshfisheries.co.uk', total: 1290, items: 4, status: 'fulfilled', placed: '2026-03-15', channel: 'Direct' },
        { id: 'DE-11901', customer: 'Kessler Feinmechanik AG', country: 'Germany', email: 'einkauf@kessler-feinmechanik.de', total: 31200, items: 73, status: 'processing', placed: '2026-03-14', channel: 'Partner' },
        { id: 'US-90428', customer: 'Fairhaven Clinic Group', country: 'United States', email: 'billing@fairhavenclinic.com', total: 15340, items: 26, status: 'fulfilled', placed: '2026-03-14', channel: 'Direct' },
        { id: 'FR-03410', customer: 'Compagnie du Vent', country: 'France', email: 'achats@compagnieduvent.fr', total: 5620, items: 9, status: 'refunded', placed: '2026-03-13', channel: 'Marketplace' },
        { id: 'GB-48204', customer: 'Wrenfield Care Homes', country: 'United Kingdom', email: 'procurement@wrenfieldcare.co.uk', total: 26840, items: 61, status: 'fulfilled', placed: '2026-03-13', channel: 'Partner' },
      ];

      /** Activity feed. `tone` decides the dot colour. */
      export const ACTIVITY = [
        { id: 'a1', tone: 'ok', who: 'Priya Raman', action: 'approved', subject: 'the 8,200-unit purchase order for Kessler Feinmechanik', when: '12 minutes ago', group: 'Orders' },
        { id: 'a2', tone: 'info', who: 'Deploy bot', action: 'shipped', subject: 'release 2026.03.4 to production', when: '48 minutes ago', group: 'Releases' },
        { id: 'a3', tone: 'warn', who: 'Marcus Feld', action: 'flagged', subject: 'checkout conversion down 0.6 points against last month', when: '2 hours ago', group: 'Analytics' },
        { id: 'a4', tone: 'info', who: 'Sofia Almeida', action: 'added', subject: 'Van Doorn Transport BV to the partner tier', when: '4 hours ago', group: 'Accounts' },
        { id: 'a5', tone: 'ok', who: 'Ines Okonkwo', action: 'refunded', subject: 'US-90442 to Cedarline Manufacturing, 987.50 returned', when: '6 hours ago', group: 'Orders' },
        { id: 'a6', tone: 'muted', who: 'Liam Brennan', action: 'updated', subject: 'the German VAT registration to DE347820914', when: 'Yesterday', group: 'Compliance' },
        { id: 'a7', tone: 'warn', who: 'Deploy bot', action: 'rolled back', subject: 'release 2026.03.4 after elevated 502s from the Frankfurt edge', when: 'Yesterday', group: 'Releases' },
        { id: 'a8', tone: 'info', who: 'Hana Sato', action: 'merged', subject: 'pull request #4182, chart tooltip accessibility fixes', when: '2 days ago', group: 'Engineering' },
      ];

      export const NAV_SECTIONS = [
        {
          id: 'overview',
          label: 'Overview',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: 'chart', badge: null },
            { id: 'orders', label: 'Orders', icon: 'cart', badge: '24' },
            { id: 'customers', label: 'Customers', icon: 'users', badge: null },
          ],
        },
        {
          id: 'analysis',
          label: 'Analysis',
          items: [
            { id: 'revenue', label: 'Revenue', icon: 'layers', badge: null },
            { id: 'cohorts', label: 'Cohorts', icon: 'target', badge: null },
            { id: 'funnels', label: 'Funnels', icon: 'filter', badge: null },
          ],
        },
        {
          id: 'workspace',
          label: 'Workspace',
          items: [
            { id: 'team', label: 'Team', icon: 'users', badge: '3' },
            { id: 'settings', label: 'Settings', icon: 'sliders', badge: null },
          ],
        },
      ];

      /** Icon paths, kept beside the data so the shell has one import for its glyphs. */
      export const NAV_ICONS = {
        chart: 'M3 3v18h18M7 15v-4M12 15V8M17 15v-6',
        cart: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6M10 21h.01M17 21h.01',
        users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
        layers: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
        target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
        filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
        sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2',
        bell: 'M18 15V10a6 6 0 1 0-12 0v5l-2 3h16l-2-3ZM10 21h4',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
        logout: 'M15 17l5-5-5-5M20 12H9M11 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5',
        menu: 'M4 7h16M4 12h16M4 17h16',
        close: 'M6 6l12 12M18 6 6 18',
        arrowUp: 'm18 15-6-6-6 6',
        arrowDown: 'm6 9 6 6 6-6',
        check: 'm20 6-11 11-5-5',
        clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
        chevronLeft: 'm15 18-6-6 6-6',
        chevronRight: 'm9 18 6-6-6-6',
        shield: 'M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z',
        sparkles: 'm12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z',
        database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
        mail: 'M4 5h16v14H4zM4 7l8 6 8-6',
        sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
        trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
        external: 'M7 17 17 7M8 7h9v9',
      };