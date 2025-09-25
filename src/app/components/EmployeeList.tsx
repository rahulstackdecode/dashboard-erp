"use client";

import { useEffect, useState } from "react";
import { Search, Edit, Eye } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const departmentsList = ["All Departments", "HR", "Web Designer", "SEO", "Web Developer", "Sales"];

interface EmployeeRow {
  id: number;
  auth_id: string | null;
  name: string;
  email: string;
  role: string;
  mobile?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: string | null;
  profile_image?: string | null;
  empType?: string | null;
  department?: string | null;
  designation?: string | null;
  joining_date?: string | null;
  total_experience?: string | null;
  empId?: string | null;
}

export default function EmployeeList({ title = "Employee List" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [data, setData] = useState<EmployeeRow[]>([]);
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect "view" mode from URL
  const isView = searchParams?.get("view") === "true";

  // Extract employee id from URL
  const urlParts = pathname.split("/");
  const employeeIdFromUrl = urlParts.length > 2 ? Number(urlParts[2]) : null;

  // Restrict edit button on CEO and Teamleader routes
  const isRestrictedPage = ["/ceo/employees", "/teamleader/employees"].some(path =>
    pathname.includes(path)
  );

  // Fetch single employee by id
  const fetchEmployeeById = async (id: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single<EmployeeRow>();
      if (error) throw error;
      setEmployee(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data: employees, error } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      const employeeList = (employees ?? []).filter(emp => emp.role.toLowerCase() !== "ceo");
      setData(employeeList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeIdFromUrl) {
      fetchEmployeeById(employeeIdFromUrl);
    } else {
      fetchEmployees();
    }
  }, [employeeIdFromUrl]);

  if (loading) {
    return <p className="text-center text-[#567D8E]">Loading...</p>;
  }

  // ---------------- SINGLE EMPLOYEE VIEW ----------------
  if (employee) {
    const fields = [
      { label: "Full Name", value: employee.name, key: "name" },
      { label: "Email", value: employee.email, key: "email", type: "email" },
      { label: "Designation", value: employee.designation, key: "designation" },
      { label: "Department", value: employee.department, key: "department" },
      { label: "Employee Type", value: employee.empType, key: "empType" },
      { label: "Mobile", value: employee.mobile, key: "mobile" },
      { label: "Date of Birth", value: employee.dob || "", key: "dob", type: "date" },
      { label: "Gender", value: employee.gender, key: "gender" },
      { label: "City", value: employee.city, key: "city" },
      { label: "State", value: employee.state, key: "state" },
      { label: "Pin Code", value: employee.pin_code, key: "pin_code" }
    ];

    return (
      <form className="space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block mb-2 text-[#567D8E]">{field.label}</label>
            <input
              type={field.type || "text"}
              value={field.value || ""}
              onChange={() => {}} // 🚫 block manual changes
              disabled={isView} // ✅ disables in view mode
              className={`w-full border rounded px-3 py-2 ${
                isView ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        ))}

        {!isView && !isRestrictedPage && (
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </form>
    );
  }

  // ---------------- EMPLOYEE LIST ----------------
  const filteredData = data.filter(emp => {
    const search = searchQuery.toLowerCase();
    return (
      (emp.name?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search) ||
        emp.designation?.toLowerCase().includes(search) ||
        emp.empType?.toLowerCase().includes(search)) &&
      (selectedDepartment === "All Departments" ||
        emp.department?.toLowerCase() === selectedDepartment.toLowerCase())
    );
  });

  const paginatedData = filteredData.slice(0, 10);

  return (
    <div>
      <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
        {title}
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-12 mt-10">
        <div className="flex items-center w-full sm:w-1/2 md:w-1/4 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white">
          <Search className="text-gray-400 mr-2 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, designation...."
            className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-[200px]">
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="appearance-none w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] px-4 py-2 pr-10 bg-white outline-none"
          >
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-6 overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
          <thead>
            <tr className="text-gray-600 border-b border-gray-300">
              <th className="px-4 py-4 text-black font-medium text-[15px]">Name</th>
              <th className="px-4 py-4 text-black font-medium text-[15px]">Email</th>
              <th className="px-4 py-4 text-black font-medium text-[15px]">Designation</th>
              <th className="px-4 py-4 text-black font-medium text-[15px]">Employee Type</th>
              <th className="px-4 py-4 text-black font-medium text-[15px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 text-[#2C2C2C]">{row.name}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{row.email}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{row.designation || "-"}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{row.empType || "-"}</td>
                  <td className="px-4 py-4 flex gap-4">
                    <button onClick={() => router.push(`/employee/${row.id}?view=true`)}>
                      <Eye className="cursor-pointer w-5 h-5 text-green-500 hover:text-green-700" />
                    </button>
                    {!isRestrictedPage && (
                      <button onClick={() => router.push(`/employee/${row.id}`)}>
                        <Edit className="cursor-pointer w-5 h-5 text-blue-500 hover:text-blue-700" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-4 py-6 text-[#567D8E]">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
