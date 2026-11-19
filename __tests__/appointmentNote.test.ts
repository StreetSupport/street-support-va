/**
 * The access note on a service card.
 *
 * Before this fix, every service whose appointment box was not ticked was
 * described as "No appointment needed", and shown with a "Drop-in" badge.
 * An unticked box is the default, so a service that must be booked, such as
 * one taking appointments for showers, told people to just turn up.
 *
 * Now only a ticked box says anything (VA #34, A9).
 */
import { appointmentNote } from '../lib/serviceMatcher';

describe('appointment note on a service card', () => {
  it('tells someone an appointment is needed when the service says so', () => {
    expect(appointmentNote({ appointmentOnly: true })).toBe(' Appointment required.');
  });

  it('does not tell someone they can just turn up when the service has not said so', () => {
    expect(appointmentNote({ appointmentOnly: false })).toBe('');
  });
});
