export type StatusClass = 1 | 2 | 3 | 4 | 5;
export type StatusVariant = 'processing' | 'success' | 'direction' | 'lost' | 'signal';
export type AccentTone = 'muted' | 'positive' | 'ink' | 'faint' | 'secondary';
export interface StatusCta { label: string; href: string; action?: 'back' | 'retry' | 'login' }
export interface StatusConfig {
  code: number;
  class: StatusClass;
  reason: string;
  title: string;
  message: string;
  hint: string;
  primaryCta: StatusCta;
  secondaryCta: StatusCta;
  variant: StatusVariant;
  accentTone: AccentTone;
}

const home: StatusCta = { label: 'Go to Home', href: '/' };
const back: StatusCta = { label: 'Go back', href: '/', action: 'back' };
const retry: StatusCta = { label: 'Retry', href: '/', action: 'retry' };
export const STATUS_CLASSES = {
  1: { name: 'Informational', variant: 'processing', accentTone: 'muted', title: 'A moment in the making.', message: 'Things are moving along. Hang tight.', hint: 'You can head home whenever you’re ready.' },
  2: { name: 'Success', variant: 'success', accentTone: 'positive', title: 'All set.', message: 'That worked. You’re ready for your next step.', hint: 'Keep going whenever you’re ready.' },
  3: { name: 'Redirection', variant: 'direction', accentTone: 'ink', title: 'A new direction.', message: 'Your next stop is somewhere else.', hint: 'Check the destination before you continue.' },
  4: { name: 'Client error', variant: 'lost', accentTone: 'faint', title: 'A little off the path.', message: 'We couldn’t open this page. Let’s find your next step.', hint: 'Check the address, go back, or head home.' },
  5: { name: 'Server error', variant: 'signal', accentTone: 'secondary', title: 'A pause on our side.', message: 'Something went wrong on our side. It’s not your fault.', hint: 'Try again in a moment, or contact us if it keeps happening.' },
} as const satisfies Record<StatusClass, { name: string; variant: StatusVariant; accentTone: AccentTone; title: string; message: string; hint: string }>;

export function statusClass(code: number): StatusClass {
  const group = Math.floor(code / 100);
  return Number.isInteger(code) && group >= 1 && group <= 5 ? group as StatusClass : 5;
}

function entry(code: number, reason: string, title: string, message: string, hint: string, cta?: StatusCta): StatusConfig {
  const group = statusClass(code);
  return { code, class: group, reason, title, message, hint, primaryCta: cta ?? (group === 5 || code === 408 || code === 429 ? retry : home), secondaryCta: back, variant: STATUS_CLASSES[group].variant, accentTone: STATUS_CLASSES[group].accentTone };
}

/** Add one entry here; the gallery and generated server documents follow it. */
export const STATUS_CONFIG = {
  100: entry(100, 'Continue', 'So far, so good.', 'We’re ready for the next part.', 'You can continue with what you were doing.'),
  101: entry(101, 'Switching Protocols', 'Making the connection.', 'We’re switching to a new way of staying connected.', 'Give the connection a moment to settle.'),
  102: entry(102, 'Processing', 'A little work in progress.', 'Your request is still being worked on.', 'Hang tight. There’s nothing you need to do yet.'),
  103: entry(103, 'Early Hints', 'Getting a head start.', 'We’re getting a few things ready for you.', 'Your next page is still on its way.'),
  200: entry(200, 'OK', 'You’re all set.', 'Everything went through as expected.', 'Ready for whatever you make next.'),
  201: entry(201, 'Created', 'Something new, ready for you.', 'Your new item has been created.', 'You can carry on from here.'),
  202: entry(202, 'Accepted', 'You’re in the queue.', 'Your request is in. We’ll take it from here.', 'It may take a little time to finish.'),
  204: entry(204, 'No Content', 'Done and dusted.', 'That’s taken care of. There’s nothing else to show.', 'You can head back to what you were doing.'),
  206: entry(206, 'Partial Content', 'One piece at a time.', 'Part of what you asked for is ready.', 'There may be more to come.'),
  300: entry(300, 'Multiple Choices', 'A few ways forward.', 'There’s more than one place to go from here.', 'Choose the destination that’s right for you.'),
  301: entry(301, 'Moved Permanently', 'We’ve found a new home.', 'This page has moved to a new address.', 'Update your bookmark once you get there.'),
  302: entry(302, 'Found', 'A small change of direction.', 'This page is somewhere else for now.', 'Follow the new address to keep going.'),
  304: entry(304, 'Not Modified', 'Still the latest.', 'The version you already have is up to date.', 'You can keep using it as it is.'),
  307: entry(307, 'Temporary Redirect', 'A quick detour.', 'We’re sending you to a temporary destination.', 'You can check where you’re going before continuing.'),
  308: entry(308, 'Permanent Redirect', 'A new address from here on.', 'This page has moved for good.', 'Save the new address for next time.'),
  400: entry(400, 'Bad Request', 'Something didn’t come through.', 'We couldn’t understand that request.', 'Check what you entered, then give it another try.'),
  401: entry(401, 'Unauthorized', 'Let’s get you signed in.', 'You’ll need to sign in before you can continue.', 'Need a hand signing in? Get in touch with us.', { label: 'Get sign-in help', href: '/contact', action: 'login' }),
  403: entry(403, 'Forbidden', 'This door isn’t open.', 'You don’t have access to this page.', 'Go back, or contact us if you think you should have access.', { label: 'Go back', href: '/', action: 'back' }),
  404: entry(404, 'Not Found', 'A little off the path.', 'We couldn’t find this page. Let’s get you back to building.', 'Check the address, or try one of the places below.'),
  405: entry(405, 'Method Not Allowed', 'Let’s try another way.', 'This page can’t handle that action.', 'Go back and use the controls on the page to continue.'),
  408: entry(408, 'Request Timeout', 'That took a little too long.', 'We didn’t receive everything in time.', 'Check your connection, then try again.'),
  409: entry(409, 'Conflict', 'Something changed along the way.', 'Your update doesn’t match the latest version.', 'Go back and check for changes before trying again.'),
  410: entry(410, 'Gone', 'This page has moved on.', 'This page is no longer available.', 'Try the docs or head home to find something current.'),
  413: entry(413, 'Content Too Large', 'A little less, please.', 'That upload is too large to bring through.', 'Try a smaller file or split it into a few parts.'),
  414: entry(414, 'URI Too Long', 'That address is a bit of a stretch.', 'The link is longer than we can open.', 'Try starting from the home page instead.'),
  415: entry(415, 'Unsupported Media Type', 'A different format should do it.', 'We can’t open that kind of file here.', 'Check which file formats are supported, then try again.'),
  418: entry(418, "I'm a Teapot", 'A short tea break.', 'This little teapot can’t make that request happen.', 'Let’s head back to something we can help with.'),
  422: entry(422, 'Unprocessable Content', 'One detail needs another look.', 'We received your request, but couldn’t use part of it.', 'Go back and check the details you entered.'),
  429: entry(429, 'Too Many Requests', 'Let’s take a small breather.', 'A few too many requests arrived at once.', 'Give it a moment before trying again.'),
  451: entry(451, 'Unavailable For Legal Reasons', 'This page isn’t available here.', 'We can’t show this page because of a legal restriction.', 'Contact us if you need more information.'),
  500: entry(500, 'Internal Server Error', 'A pause on our side.', 'Something went wrong on our side. It’s not your fault.', 'Try again in a moment, or let us know if it keeps happening.'),
  501: entry(501, 'Not Implemented', 'We can’t do that just yet.', 'This service doesn’t support that action.', 'Try a different path, or contact us for help.'),
  502: entry(502, 'Bad Gateway', 'A connection missed its cue.', 'One of the services we rely on didn’t respond as expected.', 'It’s not your fault. Give it a moment and try again.'),
  503: entry(503, 'Service Unavailable', 'A moment to catch our breath.', 'We’re temporarily unable to help with this request.', 'It’s not your fault. Please try again shortly.'),
  504: entry(504, 'Gateway Timeout', 'We waited, too.', 'Another service took too long to respond.', 'It’s not your fault. Try again in a moment.'),
} satisfies Record<number, StatusConfig>;

export const STATUS_CODES = Object.keys(STATUS_CONFIG).map(Number).sort((a, b) => a - b);
export function getStatusConfig(input: number): StatusConfig {
  const code = Number.isInteger(input) && input >= 100 && input < 600 ? input : 500;
  const known = (STATUS_CONFIG as Readonly<Record<number, StatusConfig>>)[code];
  if (known) return known;
  const group = statusClass(code), fallback = STATUS_CLASSES[group];
  return entry(code, fallback.name, fallback.title, fallback.message, fallback.hint);
}

/** Disallow script URLs, protocol-relative URLs and external redirects. */
export function safeStatusHref(href: string | undefined, fallback = '/'): string {
  return href && /^\/(?!\/)/.test(href) && ![...href].some(char => char === '\\' || char.charCodeAt(0) < 32) ? href : fallback;
}
