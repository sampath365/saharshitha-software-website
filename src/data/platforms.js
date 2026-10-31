/**
 * Live platforms.
 *
 * The product surfaces that are actually reachable on the internet today, with
 * the URL, the audience that signs in and a one-line description of what the
 * screen is for. Everything the "Live platforms" section renders comes from
 * here, so adding a platform is a data change, not a markup change.
 *
 * `icon` is a key into ICONS in src/ui/shared.js. Keep `url` pointing at a host
 * that responds — a dead link is worse than a missing one.
 */
export const PLATFORMS = [
  {
    id: 'egan-app',
    name: 'EGAN',
    kind: 'Customer app',
    icon: 'globe',
    url: 'https://egan.in.net/',
    host: 'egan.in.net',
    line: 'One platform, multiple services, smarter living.',
    body:
      'The customer-facing surface. Everyday services, local businesses and digital commerce meet in one place, with ordering, bookings and delivery handled in the same flow.',
    tags: ['Services', 'Commerce', 'Delivery'],
  },
  {
    id: 'eduweb',
    name: 'EGAN Education',
    kind: 'School management',
    icon: 'cap',
    url: 'https://eduweb.egan.in.net/login',
    host: 'eduweb.egan.in.net',
    line: 'The school day, administered in one connected system.',
    body:
      'Admissions, student records, attendance, academics and fees for schools, with parent communication kept on the same record the staff work from.',
    tags: ['Students', 'Attendance', 'Fees'],
  },
  {
    id: 'myhms',
    name: 'EGAN Healthcare',
    kind: 'Hospital management',
    icon: 'cross',
    url: 'https://myhms.egan.in.net',
    host: 'myhms.egan.in.net',
    line: 'Patient information that follows the patient, not the department.',
    body:
      'Appointments, departments, patient records and billing for hospitals and clinics — one record moving through the visit instead of being rebuilt at every desk.',
    tags: ['Patients', 'Appointments', 'Billing'],
  },
  {
    id: 'payroll',
    name: 'EGAN Payroll',
    kind: 'Payroll & HR',
    icon: 'rupee',
    url: 'https://payroll.egan.in.net/',
    host: 'payroll.egan.in.net',
    line: 'The monthly payroll run, closed on time and on record.',
    body:
      'Employee masters, salary structures, attendance, statutory deductions and payslips, so a payroll cycle can be prepared, reviewed and closed without a spreadsheet rebuild.',
    tags: ['Salary', 'Statutory', 'Payslips'],
  },
];

export const APP_DOWNLOAD = {
  name: 'EGAN for Android',
  host: 'egan.in.net/downloads/EGAN.apk',
  url: 'https://egan.in.net/downloads/EGAN.apk',
  body: 'Install the EGAN Android app directly, without going through a store listing.',
};
