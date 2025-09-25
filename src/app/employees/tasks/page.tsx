import EmployeeTasks from "@/app/components/employees/EmployeeTasks";

export default function EmployeeLisiting() {
  return (
    <>
      <h1 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
        Assigned Tasks
      </h1>
      <EmployeeTasks />
    </>
  );
}
