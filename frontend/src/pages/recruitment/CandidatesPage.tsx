import { FormEvent, useState } from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import {
  useGetVacanciesQuery,
  useCreateCandidateMutation,
} from "../../features/recruitment/recruitmentApi";

/** Local top tabs for Recruitment (Candidates / Vacancies) */
const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-white text-green-600 shadow-sm`
      : `${pill} text-slate-600 hover:bg-white/70`;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <NavLink to={`${base}/candidates`} className={getClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/vacancies`} className={getClass}>
        Vacancies
      </NavLink>
    </div>
  );
};

export default function CandidatesPage() {
  const { data: vacancies } = useGetVacanciesQuery();
  const [createCandidate, { isLoading }] = useCreateCandidateMutation();

  // form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vacancyId, setVacancyId] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [keywords, setKeywords] = useState("");
  const [dateOfApplication, setDateOfApplication] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("middleName", middleName);
      formData.append("lastName", lastName);
      if (vacancyId) formData.append("vacancyId", vacancyId);
      formData.append("email", email);
      if (contactNumber) formData.append("contactNumber", contactNumber);
      if (keywords) formData.append("keywords", keywords);
      if (dateOfApplication)
        formData.append("dateOfApplication", dateOfApplication);
      if (notes) formData.append("notes", notes);
      formData.append("consentToKeepData", String(consent));
      if (resumeFile) formData.append("resume", resumeFile);

      await createCandidate(formData).unwrap();
      setSuccess("Candidate added successfully.");

      // reset a bit (keep date)
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setVacancyId("");
      setEmail("");
      setContactNumber("");
      setResumeFile(null);
      setKeywords("");
      setNotes("");
      setConsent(false);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create candidate");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-800">
              Recruitment
            </h1>
          </div>

          {/* red-style top tabs */}
          <RecruitmentTopTabs />

          {/* Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-5xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              Add Candidate
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs md:text-sm">
              {/* Names */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Full Name<span className="text-green-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Middle Name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Vacancy select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Vacancy
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                    value={vacancyId}
                    onChange={(e) => setVacancyId(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {vacancies?.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email & contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Email<span className="text-green-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Contact Number
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Resume
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-200">
                    Browse
                    <input
                      type="file"
                      accept=".doc,.docx,.odt,.pdf,.rtf,.txt"
                      className="hidden"
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate">
                    {resumeFile ? resumeFile.name : "No file selected"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Accepts .docx, .doc, .odt, .pdf, .rtf, .txt up to 1MB
                </p>
              </div>

              {/* Keywords & date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Keywords
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Enter comma separated words..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Date of Application
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={dateOfApplication}
                    onChange={(e) => setDateOfApplication(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-200"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type here"
                />
              </div>

              {/* Consent */}
              <div className="flex items-center gap-2">
                <input
                  id="consent"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-green-500 focus:ring-green-400"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <label
                  htmlFor="consent"
                  className="text-xs text-slate-600 select-none"
                >
                  Consent to keep data
                </label>
              </div>

              {/* Error / success */}
              {error && (
                <div className="text-xs text-green-500 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    // reset form
                    setFirstName("");
                    setMiddleName("");
                    setLastName("");
                    setVacancyId("");
                    setEmail("");
                    setContactNumber("");
                    setResumeFile(null);
                    setKeywords("");
                    setNotes("");
                    setConsent(false);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 rounded-full bg-lime-500 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 disabled:opacity-60"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                * Required
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
