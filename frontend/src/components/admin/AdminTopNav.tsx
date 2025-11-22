import { Link, useLocation } from "react-router-dom";

const mainTabs = [
  { name: "User Management", path: "/admin/user-management" },
  {
    name: "Job",
    dropdown: [
      { name: "Job Titles", path: "/admin/job/job-titles" },
      { name: "Pay Grades", path: "/admin/job/pay-grades" },
      { name: "Employment Status", path: "/admin/job/employment-status" },
      { name: "Job Categories", path: "/admin/job/job-categories" },
      { name: "Work Shifts", path: "/admin/job/work-shifts" },
    ],
  },
  {
    name: "Organization",
    dropdown: [
      { name: "General Information", path: "/admin/org/general-info" },
      { name: "Locations", path: "/admin/org/locations" },
      { name: "Structure", path: "/admin/org/structure" },
    ],
  },
  {
    name: "Qualifications",
    dropdown: [
      { name: "Skills", path: "/admin/qualifications/skills" },
      { name: "Education", path: "/admin/qualifications/education" },
      { name: "Languages", path: "/admin/qualifications/languages" },
      { name: "Licenses", path: "/admin/qualifications/licenses" },
    ],
  },
  { name: "Nationalities", path: "/admin/nationalities" },
  { name: "Corporate Branding", path: "/admin/branding" },
  {
    name: "Configuration",
    dropdown: [
      {
        name: "Email Configuration ",
        path: "/admin/configuration/email-config",
      },
    ],
  },
];

export default function AdminTopNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="w-full bg-white border-b border-gray-200 flex items-center px-4 py-2 gap-2 text-sm select-none">
      {mainTabs.map((tab) => {
        if (!tab.dropdown) {
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`px-4 py-2 rounded-sm border 
                ${
                  isActive(tab.path)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 hover:bg-orange-100 hover:text-orange-500 border-gray-300"
                }`}
            >
              {tab.name}
            </Link>
          );
        }

        // dropdown tab
        return (
          <div key={tab.name} className="relative group">
            <button
              className={`px-4 py-2 rounded-sm border 
                ${
                  tab.dropdown.some((item) => isActive(item.path))
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 hover:bg-orange-100 hover:text-orange-500 border-gray-300"
                }`}
            >
              {tab.name}
            </button>

            <div className="absolute hidden group-hover:block bg-white shadow-md border rounded-sm z-20 w-48">
              {tab.dropdown.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-4 py-2 hover:bg-orange-100 hover:text-orange-500 text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
