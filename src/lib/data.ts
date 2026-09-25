import type { Client, Order, OrderStatus, StaffMember } from "../types";

export const monthlyData = [
  { month: "Jan", orders: 45 },
  { month: "Feb", orders: 52 },
  { month: "Mar", orders: 48 },
  { month: "Apr", orders: 61 },
  { month: "May", orders: 58 },
  { month: "Jun", orders: 42 },
];

export const clientTypeDist = [
  { name: "School", value: 38, color: "#E84C1E" },
  { name: "Hospital", value: 22, color: "#3B82F6" },
  { name: "Coaching", value: 18, color: "#8B5CF6" },
  { name: "College", value: 14, color: "#10B981" },
  { name: "Other", value: 8, color: "#F59E0B" },
];

export const CLIENTS: Client[] = [
  { id: 1, name: "Rajesh Kumar", org: "St. Mary's High School", type: "School", mobile: "98765 43210", orders: 24, lastOrder: "2026-06-15", status: "Active" },
  { id: 2, name: "Dr. Priya Sharma", org: "City General Hospital", type: "Hospital", mobile: "97654 32109", orders: 18, lastOrder: "2026-06-20", status: "Active" },
  { id: 3, name: "Amit Patel", org: "Bright Future Coaching", type: "Coaching", mobile: "96543 21098", orders: 31, lastOrder: "2026-06-22", status: "Active" },
  { id: 4, name: "Prof. Kavita Rao", org: "Government Degree College", type: "College", mobile: "95432 10987", orders: 12, lastOrder: "2026-05-30", status: "Active" },
  { id: 5, name: "Sunil Mehta", org: "Sunshine Public School", type: "School", mobile: "94321 09876", orders: 19, lastOrder: "2026-06-18", status: "Active" },
  { id: 6, name: "Dr. Ramesh Joshi", org: "Apollo Diagnostic Clinic", type: "Hospital", mobile: "93210 98765", orders: 8, lastOrder: "2026-06-10", status: "Active" },
  { id: 7, name: "Neha Gupta", org: "IAS Achievers Academy", type: "Coaching", mobile: "92109 87654", orders: 44, lastOrder: "2026-06-23", status: "Active" },
  { id: 8, name: "Vikram Singh", org: "VRS Corporate Solutions", type: "Corporate", mobile: "91098 76543", orders: 7, lastOrder: "2026-06-05", status: "Inactive" },
];

export const INITIAL_ORDERS: Order[] = [
  { id: "PJE-089", clientId: 1, client: "St. Mary's High School", type: "School Books", qty: 500, dueDate: "2026-07-05", orderDate: "2026-06-10", status: "Printing", staff: "Mohan Kumar", paperType: "80 GSM Maplitho", size: "A4", colorMode: "Color", binding: "Perfect Binding", notes: "Include school logo on cover. Quality check required before binding.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-088", clientId: 2, client: "City General Hospital", type: "Hospital Forms", qty: 2000, dueDate: "2026-06-28", orderDate: "2026-06-08", status: "Printing", staff: "Mohan Kumar", paperType: "60 GSM NCR", size: "A4", colorMode: "Black & White", binding: "Staple", notes: "NCR forms — 2-ply. Hospital header on all pages.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-087", clientId: 3, client: "Bright Future Coaching", type: "Question Papers", qty: 300, dueDate: "2026-06-25", orderDate: "2026-06-12", status: "Design", staff: "Priya Doshi", paperType: "70 GSM Offset", size: "A4", colorMode: "Black & White", binding: "Staple", notes: "Confidential. Do not share soft copy outside.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-086", clientId: 7, client: "IAS Achievers Academy", type: "Answer Sheets", qty: 1000, dueDate: "2026-06-22", orderDate: "2026-05-30", status: "Delivered", staff: "Rahul Desai", paperType: "80 GSM Ruled", size: "A4", colorMode: "Black & White", binding: "Saddle Stitch", notes: "16-page booklet format.", deliveredTo: "Neha Gupta", deliveredMobile: "92109 87654", deliveredDate: "2026-06-21", deliveryNotes: "Delivered at academy reception. Signed by admin staff.", acknowledgementFile: "acknowledgement_PJE086.jpg" },
  { id: "PJE-085", clientId: 8, client: "VRS Corporate Solutions", type: "Brochures", qty: 200, dueDate: "2026-06-30", orderDate: "2026-06-14", status: "Binding", staff: "Suresh Malhotra", paperType: "130 GSM Art", size: "A4 Tri-fold", colorMode: "Color", binding: "None", notes: "Use Pantone 286 blue for brand color. Matte lamination required.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-084", clientId: 5, client: "Sunshine Public School", type: "Notebooks", qty: 800, dueDate: "2026-07-10", orderDate: "2026-06-20", status: "New", staff: "—", paperType: "60 GSM Ruled", size: "A5", colorMode: "Color", binding: "Spiral", notes: "Student name field on cover. 100-page notebooks.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-083", clientId: 6, client: "Apollo Diagnostic Clinic", type: "Prescription Pads", qty: 500, dueDate: "2026-06-20", orderDate: "2026-06-05", status: "Overdue", staff: "Mohan Kumar", paperType: "70 GSM Offset", size: "A5", colorMode: "Black & White", binding: "Glue Pad", notes: "Doctor name and registration number to be printed.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-082", clientId: 4, client: "Government Degree College", type: "Certificates", qty: 150, dueDate: "2026-07-15", orderDate: "2026-06-18", status: "Ready", staff: "—", paperType: "200 GSM Art Board", size: "A4 Landscape", colorMode: "Color", binding: "None", notes: "Gold foil border. Principal signature space at bottom right.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-081", clientId: 3, client: "Bright Future Coaching", type: "Registers", qty: 400, dueDate: "2026-06-18", orderDate: "2026-06-01", status: "Overdue", staff: "Priya Doshi", paperType: "60 GSM Ruled", size: "A4", colorMode: "Black & White", binding: "Case Binding", notes: "Attendance register format. 200 pages.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-080", clientId: 1, client: "St. Mary's High School", type: "Banners", qty: 10, dueDate: "2026-07-08", orderDate: "2026-06-22", status: "New", staff: "—", paperType: "Flex Vinyl", size: "4ft × 2ft", colorMode: "Color", binding: "None", notes: "School annual day banners. Grommets on all 4 corners.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-079", clientId: 7, client: "IAS Achievers Academy", type: "Question Papers", qty: 600, dueDate: "2026-07-20", orderDate: "2026-06-21", status: "Design", staff: "Kaveri Nair", paperType: "70 GSM Offset", size: "A4", colorMode: "Black & White", binding: "Staple", notes: "Series A and B both required. Different colored covers.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
  { id: "PJE-078", clientId: 2, client: "City General Hospital", type: "Hospital Forms", qty: 5000, dueDate: "2026-07-25", orderDate: "2026-06-19", status: "Packing", staff: "Suresh Malhotra", paperType: "60 GSM NCR", size: "A5", colorMode: "Black & White", binding: "Glue Pad", notes: "OPD forms. Pack in sets of 100.", deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "" },
];

export const STAFF_LIST: StaffMember[] = [
  { id: 1, name: "Priya Doshi", role: "Designer", active: 3, completed: 142, initials: "PD", color: "bg-purple-500" },
  { id: 2, name: "Mohan Kumar", role: "Machine Operator", active: 4, completed: 198, initials: "MK", color: "bg-blue-500" },
  { id: 3, name: "Suresh Malhotra", role: "Binder", active: 2, completed: 87, initials: "SM", color: "bg-emerald-500" },
  { id: 4, name: "Rahul Desai", role: "Delivery Person", active: 5, completed: 234, initials: "RD", color: "bg-amber-500" },
  { id: 5, name: "Kaveri Nair", role: "Designer", active: 2, completed: 89, initials: "KN", color: "bg-rose-500" },
  { id: 6, name: "Sanjay Patel", role: "Manager", active: 0, completed: 0, initials: "SP", color: "bg-slate-500" },
];

export const TASKS = [
  { id: 1, name: "Design cover & layout", order: "PJE-087", staffId: 1, priority: "High", due: "2026-06-24", status: "In Progress" },
  { id: 2, name: "Plate making & press setup", order: "PJE-089", staffId: 2, priority: "High", due: "2026-06-25", status: "In Progress" },
  { id: 3, name: "Binding & trimming", order: "PJE-085", staffId: 3, priority: "Medium", due: "2026-06-27", status: "Pending" },
  { id: 4, name: "Quality check & packing", order: "PJE-078", staffId: 3, priority: "Medium", due: "2026-06-28", status: "Pending" },
  { id: 5, name: "Artwork finalization", order: "PJE-079", staffId: 5, priority: "Low", due: "2026-06-30", status: "Pending" },
  { id: 6, name: "Delivery to IAS Academy", order: "PJE-086", staffId: 4, priority: "High", due: "2026-06-24", status: "Completed" },
  { id: 7, name: "Proof review — Hospital Forms", order: "PJE-088", staffId: 1, priority: "High", due: "2026-06-23", status: "In Progress" },
];

export const ORDER_TYPES = [
  "School Books", "Notebooks", "Registers", "Question Papers", "Answer Sheets",
  "Banners", "Certificates", "Hospital Forms", "Prescription Pads",
  "Brochures", "Visiting Cards", "Custom Print",
];

export const KANBAN_COLS: OrderStatus[] = ["New", "Design", "Printing", "Binding", "Packing", "Ready", "Delivered"];

export const WORKFLOW_STEPS: OrderStatus[] = ["New", "Design", "Printing", "Binding", "Packing", "Ready", "Delivered"];
