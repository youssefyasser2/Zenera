export interface DashboardStats {
  availablePositions: number;
  jobOpen: number;
  newEmployees: number;
  totalEmployees: number;
  totalEmployeesTrend: number;
  talentRequest: number;
  talentRequestTrend: number;
  totalEmployeesBreakdown: {
    men: number;
    women: number;
  };
  talentRequestBreakdown: {
    men: number;
    women: number;
  };
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  age: number;
  discipline: string;
  status: "Permanent" | "Contract";
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: "Priority" | "Other";
}

export interface EmployeeTable {
  id: string;
  name: string;
  avatar: string;
  department: string;
  age: number;
  discipline: string;
  status: "Permanent" | "Contract";
}