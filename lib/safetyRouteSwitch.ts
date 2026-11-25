// The Safety from harm route's switch (James Cross's review of #69, 24 November
// 2026). Off unless VA_SAFETY_ROUTE is "on", so the stack can reach staging for
// the trial without the route going live before its release conditions are met
// (Safeguarding Contract 3.3 ratified by the trustees; the general exit where
// gender isn't given). While it is off, the first question does not offer
// "Staying safe from abuse, exploitation or harm". The crisis question is not
// affected: it is hard-coded and always asked first.

export function isSafetyRouteEnabled(): boolean {
  return process.env.VA_SAFETY_ROUTE === 'on';
}
