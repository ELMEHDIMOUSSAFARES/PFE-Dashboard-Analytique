import {
  Users,
  DollarSign,
  ClipboardList,
  UserX,
  CheckCircle,
} from "lucide-react";

import revIcon from "@/assets/revenueIcon.svg";
import abdsIcon from "@/assets/absenceIcon.svg";

import { useEffect, useState } from "react";

import StatCard from "./StatCard";

export default function DashStats() {
  const [stats, setStats] = useState({
    students: 0,
    revenue: 0,
    enrollments: 0,
    attendance: 0,
    absences: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        studentsRes,
        revenueRes,
        enrollmentsRes,
        attendanceRes,
        absencesRes,
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/kpi/students-count", { headers }),
        fetch("http://127.0.0.1:8000/kpi/revenue", { headers }),
        fetch("http://127.0.0.1:8000/kpi/enrollments-count", { headers }),
        fetch("http://127.0.0.1:8000/kpi/attendance-rate", { headers }),
        fetch("http://127.0.0.1:8000/kpi/absences", { headers }),
      ]);

      const students = await studentsRes.json();
      const revenue = await revenueRes.json();
      const enrollments = await enrollmentsRes.json();
      const attendance = await attendanceRes.json();
      const absences = await absencesRes.json();

      setStats({
        students: students.students,
        revenue: revenue.revenue,
        enrollments: enrollments.enrollments,
        attendance: attendance.attendance_rate,
        absences: absences.absences,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
      <StatCard
        label="Total Students"
        value={stats.students}
        icon={Users}
        color="bg-indigo-500"
      />

      <StatCard
        label="Revenue"
        value={`${stats.revenue} MAD`}
        icon={revIcon}
        color="bg-green-500"
      />

      <StatCard
        label="Enrollments"
        value={stats.enrollments}
        icon={ClipboardList}
        color="bg-blue-500"
      />

      <StatCard
        label="Attendance Rate"
        value={`${stats.attendance}%`}
        icon={CheckCircle}
        color="bg-emerald-500"
      />

      <StatCard
        label="Absences"
        value={stats.absences}
        icon={abdsIcon}
        color="bg-red-500"
      />
    </div>
  );
}
