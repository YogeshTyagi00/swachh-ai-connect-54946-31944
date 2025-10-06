export const mockComplaints = [
  {
    id: "C001",
    location: "MG Road, Sector 15",
    status: "Pending",
    reportedBy: "Rajesh Kumar",
    latitude: 28.6139,
    longitude: 77.2090,
    description: "Overflowing garbage bin",
    timestamp: "2025-01-15 10:30 AM"
  },
  {
    id: "C002",
    location: "Gandhi Chowk, Sector 8",
    status: "In Progress",
    reportedBy: "Priya Sharma",
    latitude: 28.6129,
    longitude: 77.2295,
    description: "Illegal waste dumping",
    timestamp: "2025-01-14 02:15 PM"
  },
  {
    id: "C003",
    location: "Station Road",
    status: "Pending",
    reportedBy: "Amit Singh",
    latitude: 28.6149,
    longitude: 77.1990,
    description: "Unsegregated waste",
    timestamp: "2025-01-15 09:00 AM"
  },
  {
    id: "C004",
    location: "Park Street, Sector 22",
    status: "Resolved",
    reportedBy: "Sneha Patel",
    latitude: 28.6159,
    longitude: 77.2190,
    description: "Broken waste bin",
    timestamp: "2025-01-13 04:45 PM"
  },
  {
    id: "C005",
    location: "Market Area, Old Town",
    status: "Pending",
    reportedBy: "Vikram Mehta",
    latitude: 28.6119,
    longitude: 77.2390,
    description: "Plastic waste accumulation",
    timestamp: "2025-01-15 11:20 AM"
  },
];

export const mockLeaderboard = [
  { rank: 1, name: "Rajesh Kumar", greenCoins: 450, actions: 45 },
  { rank: 2, name: "Priya Sharma", greenCoins: 380, actions: 38 },
  { rank: 3, name: "Amit Singh", greenCoins: 320, actions: 32 },
  { rank: 4, name: "Sneha Patel", greenCoins: 290, actions: 29 },
  { rank: 5, name: "Vikram Mehta", greenCoins: 250, actions: 25 },
];

export const mockCollectionCenters = [
  {
    id: 1,
    name: "Green Waste Center - Sector 15",
    latitude: 28.6139,
    longitude: 77.2090,
    type: "Recyclable"
  },
  {
    id: 2,
    name: "Bio Waste Facility - Gandhi Chowk",
    latitude: 28.6129,
    longitude: 77.2295,
    type: "Biodegradable"
  },
  {
    id: 3,
    name: "Hazardous Waste Unit - Industrial Area",
    latitude: 28.6149,
    longitude: 77.1990,
    type: "Hazardous"
  },
];

export const wasteCategories = [
  {
    name: "Biodegradable",
    tips: "Dispose in green bins. Can be used for composting. Examples: Food waste, paper, leaves.",
    color: "text-green-600"
  },
  {
    name: "Recyclable",
    tips: "Dispose in blue bins. Can be recycled into new products. Examples: Plastic bottles, glass, metal.",
    color: "text-blue-600"
  },
  {
    name: "Hazardous",
    tips: "Requires special disposal. Take to hazardous waste centers. Examples: Batteries, chemicals, electronic waste.",
    color: "text-red-600"
  },
];
