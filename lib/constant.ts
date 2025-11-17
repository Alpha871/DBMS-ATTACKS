export const INITIAL_LOG = [
  {
    ts: "2023-10-27 10:32:05",
    message: "Employee attempted to Delete record #102.",
    status: "Denied",
  },
  {
    ts: "2023-10-27 10:31:59",
    message: "Employee attempted to Edit record #101.",
    status: "Allowed",
  },
  {
    ts: "2023-10-27 10:31:45",
    message: "Admin attempted to Export all data.",
    status: "Allowed",
  },
  {
    ts: "2023-10-27 10:30:12",
    message: "User attempted to Edit record #103.",
    status: "Denied",
  },
  {
    ts: "2023-10-27 10:29:50",
    message: "Employee attempted to View record #103.",
    status: "Allowed",
  },
];

export const INITIAL_RECORDS = [
  {
    id: 101,
    name: "Alice Johnson",
    email: "alice.j@example.com",
    salary: "$95,000",
    notes: "Q3 Performance Review Pending",
  },
  {
    id: 102,
    name: "Bob Williams",
    email: "bob.w@example.com",
    salary: "$82,000",
    notes: "Onboarding complete",
  },
  {
    id: 103,
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    salary: "$110,000",
    notes: "Project Lead for 'Phoenix'",
  },
];

export const DEMO_ROWS = [
  {
    id: 1,
    username: "admin",
    email: "admin@vulndb.dev",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
  },
  {
    id: 2,
    username: "alice",
    email: "alice@example.com",
    passwordHash: "e10adc3949ba59abbe56e057f20f883e",
  },
  {
    id: 3,
    username: "bob",
    email: "bob@example.com",
    passwordHash: "900150983cd24fb0d6963f7d28e17f72",
  },
];
