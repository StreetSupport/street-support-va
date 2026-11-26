// The suites test the Safety from harm route as built, so they run with its
// switch on. In a deployment it is off unless VA_SAFETY_ROUTE is "on"
// (lib/safetyRouteSwitch.ts); __tests__/safetyRouteSwitch.test.ts covers off.
process.env.VA_SAFETY_ROUTE = 'on';
