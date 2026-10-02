/**
 * Product catalogue.
 *
 * The five products are presented on one detail page (product.html) that
 * switches content by ?p=<id>. Copy here describes each product's purpose; it
 * makes no claims about specific features, certifications or customers.
 */

export const PRODUCTS = [
  {
    id: 'egan',
    name: 'EGAN',
    tag: 'Platform',
    accent: 'cyan',
    line: 'A digital platform built to create connected experiences.',
    summary:
      'EGAN brings layered product surfaces, structured data and real-time interfaces into one coherent platform — designed to be extended as the needs behind it grow.',
    overview:
      'EGAN is our platform foundation: a shared core that our industry products are built on. It handles the parts every product needs — accounts, permissions, records, notifications and reporting — so each product team can focus on the work that is specific to its field.',
    capabilities: [
      { title: 'Layered interfaces', body: 'Product surfaces that stay clear as functionality is added.' },
      { title: 'Structured data', body: 'A consistent model for records, relationships and history.' },
      { title: 'Real-time updates', body: 'Changes reflected across connected users as they happen.' },
      { title: 'Roles and permissions', body: 'Access scoped to what each person actually needs.' },
      { title: 'Reporting', body: 'Operational views built from the same source of truth.' },
      { title: 'Built to extend', body: 'New modules added without reworking what already works.' },
    ],
    who: [
      'Organisations that need one system instead of several disconnected tools',
      'Teams that expect to grow and add capability over time',
      'Operations where accuracy and traceability matter',
    ],
  },
  {
    id: 'service',
    name: 'EGAN Service',
    tag: 'Marketplace',
    accent: 'violet',
    line: 'Everything you need, connected in one place.',
    summary:
      'EGAN Service is an all-in-one digital platform that connects customers with everyday services, products, businesses, professionals and local opportunities in one place.',
    overview:
      'From home services, agriculture, plants and gardening, food and grocery, cakes and bakery, healthcare, education, transportation, accommodation, jobs, real estate, events and local businesses to on-demand delivery and bookings — EGAN makes it easier to discover, order, book and manage services near you.',
    vision:
      'EGAN aims to create a connected local digital ecosystem where people can find the services and products they need, while local businesses and service providers can reach and serve their customers more effectively.',
    categories: [
      { icon: '🏠', name: 'Home & Maintenance Services' },
      { icon: '🌱', name: 'Agriculture, Plants & Gardening' },
      { icon: '🍱', name: 'Food, Grocery & Quick Delivery' },
      { icon: '🎂', name: 'Cakes & Bakery' },
      { icon: '🏥', name: 'Healthcare, Clinics & Medical Services' },
      { icon: '🎓', name: 'Schools, Colleges & Education Services' },
      { icon: '🚕', name: 'Cab & Transportation' },
      { icon: '🏨', name: 'Rooms, PG & Accommodation' },
      { icon: '🏢', name: 'Real Estate' },
      { icon: '💼', name: 'Jobs & Professional Services' },
      { icon: '🛍️', name: 'Local Shops, Products & Businesses' },
      { icon: '🛕', name: 'Temples, Events & Donations' },
      { icon: '🚨', name: 'Emergency & Essential Services' },
      { icon: '📦', name: 'Delivery & Local Logistics' },
      { icon: '💻', name: 'Digital & Business Services' },
    ],
    audience: [
      {
        title: 'For customers',
        body: 'Discover nearby services and products, compare providers, place orders, make bookings, track deliveries, manage addresses, receive notifications and share reviews — all from one platform.',
      },
      {
        title: 'For businesses & service providers',
        body: 'Digital tools to manage services, products, locations, pricing, availability, orders, bookings, customers, employees and business operations.',
      },
    ],
    capabilities: [
      { title: 'Discover nearby', body: 'Find services, products and professionals around you.' },
      { title: 'Compare providers', body: 'Weigh options before committing to a booking.' },
      { title: 'Orders & bookings', body: 'Place orders and reserve services in one flow.' },
      { title: 'Delivery tracking', body: 'Follow an order from placement through to handover.' },
      { title: 'Business tools', body: 'Pricing, availability, staff and operations for providers.' },
      { title: 'Reviews', body: 'Feedback that helps the next customer choose well.' },
    ],
    who: [
      'Customers looking for local services and products in one place',
      'Vendors and professionals who need digital tools to run their work',
      'Local businesses wanting to reach customers nearby',
    ],
  },
  {
    id: 'school',
    name: 'EGAN School Management',
    tag: 'Education',
    accent: 'cyan',
    line: 'Administration, academics and communication for schools in one connected system.',
    summary:
      'EGAN School Management brings the day-to-day running of a school into a single system — students, staff, attendance, academics and parent communication.',
    overview:
      'Schools run on information that is usually spread across registers, spreadsheets and messaging groups. EGAN School Management consolidates that into one place, so staff spend their time on students rather than on reconciling records.',
    capabilities: [
      { title: 'Student records', body: 'Admissions, profiles and history in one record per student.' },
      { title: 'Attendance', body: 'Daily marking with a clear picture of absence patterns.' },
      { title: 'Academics', body: 'Classes, subjects and assessment results organised together.' },
      { title: 'Staff management', body: 'Roles, timetables and responsibilities kept current.' },
      { title: 'Fees and billing', body: 'Dues, payments and receipts tracked without manual ledgers.' },
      { title: 'Parent communication', body: 'Notices and updates reaching the right people.' },
    ],
    who: [
      'Schools moving off registers and spreadsheets',
      'Administrators who need one accurate record per student',
      'Institutions that want parents kept properly informed',
    ],
  },
  {
    id: 'hospital',
    name: 'EGAN Hospital Management',
    tag: 'Healthcare',
    accent: 'violet',
    line: 'Patient records, appointments, departments and billing in a single workflow.',
    summary:
      'EGAN Hospital Management connects the clinical and administrative sides of a hospital so patient information follows the patient, not the department.',
    overview:
      'In a hospital, the same patient is seen by several departments in one visit. EGAN Hospital Management keeps one record moving with them — reducing repeated questions, duplicated entries and information that never reaches the next desk.',
    capabilities: [
      { title: 'Patient records', body: 'One history per patient, updated as care progresses.' },
      { title: 'Appointments', body: 'Scheduling across departments and practitioners.' },
      { title: 'Departments', body: 'Coordination between the teams involved in a visit.' },
      { title: 'Billing', body: 'Charges and payments assembled from the care actually given.' },
      { title: 'Pharmacy and stores', body: 'Stock and dispensing recorded against the patient record.' },
      { title: 'Reporting', body: 'Operational and administrative views for management.' },
    ],
    who: [
      'Hospitals coordinating multiple departments per patient',
      'Administrators reconciling clinical activity with billing',
      'Facilities that need one dependable patient record',
    ],
  },
  {
    id: 'clinic',
    name: 'EGAN Small Clinic',
    tag: 'Mobile',
    accent: 'cyan',
    line: 'Mobile-first software for small clinics — appointments, patient history and daily operations.',
    summary:
      'EGAN Small Clinic is designed for practices that run lean. It works from a phone, needs no server room, and covers the essentials of a clinic day.',
    overview:
      'Small clinics rarely have an IT team, and usually do not need the weight of a hospital system. EGAN Small Clinic covers what a single practice actually uses — patients, appointments, notes and payments — in software that runs on the device already in the room.',
    capabilities: [
      { title: 'Appointments', body: 'A day view that reflects how the clinic actually runs.' },
      { title: 'Patient history', body: 'Previous visits available before the consultation starts.' },
      { title: 'Consultation notes', body: 'Recorded against the patient, not on paper.' },
      { title: 'Prescriptions', body: 'Issued and retained with the visit record.' },
      { title: 'Payments', body: 'Consultation fees and receipts kept together.' },
      { title: 'Works on mobile', body: 'Built phone-first, with no infrastructure to maintain.' },
    ],
    who: [
      'Single-practitioner and small multi-doctor clinics',
      'Practices with no dedicated IT support',
      'Clinics that want records searchable rather than on paper',
    ],
  },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;