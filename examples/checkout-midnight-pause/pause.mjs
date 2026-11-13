/**
 * Checkout pause before midnight.
 *
 * A policy that starts «today» cannot be issued once «today» is over: a payment
 * made just after midnight for an application from the evening before leaves
 * the customer paid and without a policy.
 *
 * Rule: in the last N minutes before midnight (in the insurer's time zone) we
 * accept no new applications and open no payments. Saving a draft, checking a
 * payment and issuing an already paid policy keep working.
 *
 * The time zone is explicit: servers run in UTC, customers and insurers live in
 * Kyiv time, and the offset changes twice a year.
 */

/** Minute of the day (0…1439) in `timeZone`. */
export function minuteOfDay(at, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  return hour * 60 + minute;
}

export function inMidnightPause(at = new Date(), { minutes = 7, timeZone = 'Europe/Kyiv' } = {}) {
  return minuteOfDay(at, timeZone) >= 24 * 60 - minutes;
}

/** What a checkout endpoint returns during the pause: a code the site can show as is. */
export function midnightPauseRefusal() {
  return {
    status: 409,
    code: 'CHECKOUT_MIDNIGHT_PAUSE',
    message: 'Checkout is paused for a few minutes before midnight while insurers roll the contract date. Your data is saved — continue after 00:00.',
  };
}
