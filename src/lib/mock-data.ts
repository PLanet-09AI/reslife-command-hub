export const RESIDENCES = [
  "Steve Biko",
  "Campbell",
  "Corlo Court",
  "Winterton",
  "Student Village",
  "Stratford",
] as const;

export const ROLES = [
  "Admin",
  "Manager",
  "Coordinator",
  "Budget Officer",
  "Finance Officer",
  "Senior Admin",
  "Res Life Officer",
] as const;

export const TEAM = [
  { id: "u1", name: "Alvin Smith", email: "alvin.smith@dut.ac.za", role: "Admin", residence: "—", initials: "AS", active: true },
  { id: "u2", name: "Phumlani Mnyango", email: "phumlanim@dut.ac.za", role: "Manager", residence: "All", initials: "PM", active: true },
  { id: "u3", name: "Sihle Zulu", email: "sihlez@dut.ac.za", role: "Coordinator", residence: "Steve Biko", initials: "SZ", active: true },
  { id: "u4", name: "Nonhlanhla Mbatha", email: "nonhlanhlam@dut.ac.za", role: "Budget Officer", residence: "All", initials: "NM", active: true },
  { id: "u5", name: "Sifiso Mvubu", email: "sifisom@dut.ac.za", role: "Finance Officer", residence: "All", initials: "SM", active: true },
  { id: "u6", name: "Indira Sing", email: "indiras@dut.ac.za", role: "Senior Admin", residence: "All", initials: "IS", active: true },
];

export const STAT_CARDS = [
  { label: "Total Capex Budget", value: "R 6,644,289", delta: "+12.4%", tone: "primary" as const },
  { label: "Active Projects", value: "23", delta: "+3", tone: "info" as const },
  { label: "Completed Projects", value: "11", delta: "+2 this month", tone: "success" as const },
  { label: "Pending Approvals", value: "7", delta: "2 urgent", tone: "warning" as const },
];

export const BUDGET_BY_RESIDENCE = [
  { residence: "Steve Biko", budget: 1450000, actual: 1280000 },
  { residence: "Campbell", budget: 1200000, actual: 1110000 },
  { residence: "Corlo Court", budget: 980000, actual: 720000 },
  { residence: "Winterton", budget: 1100000, actual: 980000 },
  { residence: "Student Village", budget: 1300000, actual: 1180000 },
  { residence: "Stratford", budget: 614289, actual: 480000 },
];

export const SPEND_TREND = [
  { month: "Jan", spend: 320000 },
  { month: "Feb", spend: 410000 },
  { month: "Mar", spend: 520000 },
  { month: "Apr", spend: 480000 },
  { month: "May", spend: 610000 },
  { month: "Jun", spend: 720000 },
  { month: "Jul", spend: 680000 },
  { month: "Aug", spend: 590000 },
  { month: "Sep", spend: 530000 },
];

export const CATEGORY_SPLIT = [
  { name: "Furniture", value: 1820000 },
  { name: "Equipment", value: 3960000 },
  { name: "Computers", value: 410000 },
  { name: "Maintenance", value: 454289 },
];

export const DOCUMENTS = [
  { id: "d1", name: "Steve Biko Procurement Plan 2025.pdf", residence: "Steve Biko", type: "Procurement Plan", status: "Approved", owner: "Sihle Zulu", updated: "2 hours ago", size: "2.4 MB" },
  { id: "d2", name: "Heat Pumps Strategy.docx", residence: "Campbell", type: "Heat Pumps", status: "Pending", owner: "Nonhlanhla Mbatha", updated: "5 hours ago", size: "1.1 MB" },
  { id: "d3", name: "Capex Detailed Report 2025.xlsx", residence: "All", type: "Capex", status: "Under Review", owner: "Sifiso Mvubu", updated: "Yesterday", size: "840 KB" },
  { id: "d4", name: "Laundry Maintenance SLA.pdf", residence: "Winterton", type: "Laundry", status: "Approved", owner: "Sihle Zulu", updated: "2 days ago", size: "1.8 MB" },
  { id: "d5", name: "Beds Replacement Schedule.xlsx", residence: "Student Village", type: "Beds", status: "Pending", owner: "Sihle Zulu", updated: "3 days ago", size: "320 KB" },
  { id: "d6", name: "Garden Refurbishment Quote.pdf", residence: "Stratford", type: "Gardens", status: "Rejected", owner: "Phumlani Mnyango", updated: "4 days ago", size: "920 KB" },
];

export const ACTIVITY = [
  { id: "a1", user: "Alvin Smith", action: "Approved", target: "Steve Biko Procurement Plan 2025.pdf", time: "2 min ago" },
  { id: "a2", user: "Sihle Zulu", action: "Uploaded", target: "Beds Replacement Schedule.xlsx", time: "1 hour ago" },
  { id: "a3", user: "Phumlani Mnyango", action: "Commented on", target: "Heat Pumps Strategy.docx", time: "3 hours ago" },
  { id: "a4", user: "Sifiso Mvubu", action: "Edited", target: "Capex Detailed Report 2025.xlsx", time: "5 hours ago" },
  { id: "a5", user: "Nonhlanhla Mbatha", action: "Submitted", target: "Q3 Budget Variance.xlsx", time: "Yesterday" },
  { id: "a6", user: "Indira Sing", action: "Viewed", target: "Laundry Maintenance SLA.pdf", time: "Yesterday" },
];

export const WORKFLOW_STEPS = [
  "Submission",
  "Finance Processing",
  "Requisition Approval",
  "Senior Approval",
  "Purchase Order",
  "Delivery",
  "Invoice & Payment",
];

export const WORKFLOW_ASSIGNEES = [
  "Sihle Zulu",
  "Sifiso Mvubu",
  "Nonhlanhla Mbatha",
  "Phumlani Mnyango",
  "Procurement Office",
  "Logistics",
  "Finance Office",
];

type WfStatus = "completed" | "in_progress" | "delayed" | "not_started";

export const WORKFLOWS: {
  id: string;
  name: string;
  residence: string;
  budget: string;
  steps: { name: string; assignee: string; status: WfStatus; updated: string; action: string }[];
}[] = [
  {
    id: "w1",
    name: "Heat Pumps Installation – Campbell",
    residence: "Campbell",
    budget: "R 480,000",
    steps: [
      { name: "Submission", assignee: "Sihle Zulu", status: "completed", updated: "10 Apr, 09:12", action: "Submitted DUT 5 form" },
      { name: "Finance Processing", assignee: "Sifiso Mvubu", status: "in_progress", updated: "14 Apr, 14:32", action: "Upload DUT 6 Form" },
      { name: "Requisition Approval", assignee: "Nonhlanhla Mbatha", status: "not_started", updated: "—", action: "Awaiting requisition" },
      { name: "Senior Approval", assignee: "Phumlani Mnyango", status: "not_started", updated: "—", action: "Awaiting approval" },
      { name: "Purchase Order", assignee: "Procurement Office", status: "not_started", updated: "—", action: "Issue PO" },
      { name: "Delivery", assignee: "Logistics", status: "not_started", updated: "—", action: "Receive goods" },
      { name: "Invoice & Payment", assignee: "Finance Office", status: "not_started", updated: "—", action: "Process payment" },
    ],
  },
  {
    id: "w2",
    name: "Bed Replacement – Student Village",
    residence: "Student Village",
    budget: "R 320,000",
    steps: [
      { name: "Submission", assignee: "Sihle Zulu", status: "completed", updated: "02 Apr, 10:00", action: "Submitted" },
      { name: "Finance Processing", assignee: "Sifiso Mvubu", status: "delayed", updated: "06 Apr, 11:20", action: "DUT 6 outstanding for 8 days" },
      { name: "Requisition Approval", assignee: "Nonhlanhla Mbatha", status: "not_started", updated: "—", action: "—" },
      { name: "Senior Approval", assignee: "Phumlani Mnyango", status: "not_started", updated: "—", action: "—" },
      { name: "Purchase Order", assignee: "Procurement Office", status: "not_started", updated: "—", action: "—" },
      { name: "Delivery", assignee: "Logistics", status: "not_started", updated: "—", action: "—" },
      { name: "Invoice & Payment", assignee: "Finance Office", status: "not_started", updated: "—", action: "—" },
    ],
  },
  {
    id: "w3",
    name: "Laundry Equipment – Winterton",
    residence: "Winterton",
    budget: "R 210,000",
    steps: [
      { name: "Submission", assignee: "Sihle Zulu", status: "completed", updated: "12 Mar", action: "Submitted" },
      { name: "Finance Processing", assignee: "Sifiso Mvubu", status: "completed", updated: "15 Mar", action: "DUT 6 uploaded" },
      { name: "Requisition Approval", assignee: "Nonhlanhla Mbatha", status: "completed", updated: "18 Mar", action: "Approved" },
      { name: "Senior Approval", assignee: "Phumlani Mnyango", status: "completed", updated: "20 Mar", action: "Approved" },
      { name: "Purchase Order", assignee: "Procurement Office", status: "completed", updated: "22 Mar", action: "PO #4421 issued" },
      { name: "Delivery", assignee: "Logistics", status: "completed", updated: "01 Apr", action: "Delivered" },
      { name: "Invoice & Payment", assignee: "Finance Office", status: "completed", updated: "10 Apr", action: "Paid in full" },
    ],
  },
];

export const CAPEX_LINE_ITEMS = [
  { item: "3-Seater Couches", category: "Furniture", qty: 24, unit: 8500, residence: "Steve Biko", type: "Replacement" },
  { item: "Single Mattresses", category: "Furniture", qty: 180, unit: 2200, residence: "Student Village", type: "Replacement" },
  { item: "Single Beds", category: "Furniture", qty: 120, unit: 3400, residence: "Campbell", type: "New" },
  { item: "Bar Fridges (90L)", category: "Equipment", qty: 60, unit: 4200, residence: "Winterton", type: "Replacement" },
  { item: "Double-Door Fridges (300L)", category: "Equipment", qty: 12, unit: 12500, residence: "Stratford", type: "New" },
  { item: "Microwaves", category: "Equipment", qty: 80, unit: 1800, residence: "Corlo Court", type: "Replacement" },
  { item: "Washing Machines (10kg)", category: "Equipment", qty: 14, unit: 18500, residence: "Steve Biko", type: "New" },
  { item: "Tumble Dryers (10kg)", category: "Equipment", qty: 14, unit: 17200, residence: "Steve Biko", type: "New" },
  { item: "Air Conditioners", category: "Equipment", qty: 22, unit: 14200, residence: "Campbell", type: "New" },
  { item: "Stove Ovens", category: "Equipment", qty: 18, unit: 9800, residence: "Student Village", type: "Replacement" },
  { item: "Desktop Computers", category: "Computers", qty: 30, unit: 13500, residence: "All", type: "New" },
];

export const FLOORS = [
  { id: "f1", residence: "Steve Biko", floor: "Ground Floor", rooms: 24, occupied: 21, vacant: 2, maintenance: 1 },
  { id: "f2", residence: "Steve Biko", floor: "1st Floor", rooms: 28, occupied: 25, vacant: 1, maintenance: 2 },
  { id: "f3", residence: "Campbell", floor: "Ground Floor", rooms: 20, occupied: 18, vacant: 2, maintenance: 0 },
  { id: "f4", residence: "Campbell", floor: "1st Floor", rooms: 22, occupied: 20, vacant: 1, maintenance: 1 },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "New comment on Heat Pumps Strategy", time: "2m ago", type: "comment" },
  { id: "n2", title: "Approval required: Beds Replacement Schedule", time: "1h ago", type: "approval" },
  { id: "n3", title: "Workflow delayed: Bed Replacement – Student Village", time: "3h ago", type: "alert" },
  { id: "n4", title: "Sihle Zulu uploaded a new document", time: "Yesterday", type: "upload" },
];
