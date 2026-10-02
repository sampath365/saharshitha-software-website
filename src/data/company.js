/**
 * Single source of truth for company details.
 *
 * PLACEHOLDERS — replace every value marked TODO before going live.
 * These are deliberately fake stand-ins so the site structure is complete and
 * the real values are easy to find. Nothing here is real company data.
 */
export const COMPANY = {
  name: 'Saharshitha Software',
  tagline: 'Technology • Innovation • Digital Products',
  // TODO: replace with the real company email address
  email: 'hello@saharshitha.example',
  // TODO: replace with the real careers inbox
  careersEmail: 'careers@saharshitha.example',
  // TODO: replace with the real phone number, including country code
  phone: '+91 00000 00000',
  // TODO: replace with the real registered address
  address: {
    line1: 'Registered office address',
    line2: 'City, State, PIN',
    country: 'India',
  },
  // TODO: replace with the real office hours
  hours: 'Mon – Fri, 9:30 – 18:30 IST',
};

export const contactLines = () => [
  { label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/[^\d+]/g, '')}` },
  {
    label: 'Address',
    value: [COMPANY.address.line1, COMPANY.address.line2, COMPANY.address.country].join(', '),
    href: null,
  },
  { label: 'Hours', value: COMPANY.hours, href: null },
];