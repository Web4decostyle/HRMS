import { FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useGetVacanciesQuery,
  useCreateCandidateMutation,
} from "../../features/recruitment/recruitmentApi";
import { FiUploadCloud, FiArrowLeft } from "react-icons/fi";

/* ================= Tabs ================= */

const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill =
    "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-lime-500 text-white shadow-sm`
      : `${pill} text-slate-600 hover:bg-white hover:shadow-sm`;

  return (
    <div className="mb-6 flex gap-2">
      <NavLink to={`${base}`} end className={getClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/vacancies`} className={getClass}>
        Vacancies
      </NavLink>
    </div>
  );
};

/* ================= Page ================= */

export default function CandidatesPage() {
  const { data: vacancies } = useGetVacanciesQuery();
  const [createCandidate, { isLoading }] = useCreateCandidateMutation();
  const navigate = useNavigate();

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
      formData.append("dateOfApplication", dateOfApplication);
      formData.append("consentToKeepData", String(consent));
      if (notes) formData.append("notes", notes);
      if (resumeFile) formData.append("resume", resumeFile);

      await createCandidate(formData).unwrap();
      setSuccess("Candidate created successfully.");

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
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-lime-50 via-white to-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Add Candidate
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a new candidate profile for recruitment process
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>
      </div>

      <RecruitmentTopTabs />

      {/* Form Card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-6xl">

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Info */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700">
              Personal Information
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                className="input"
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                className="input"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700">
              Application Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <select
                className="input"
                value={vacancyId}
                onChange={(e) => setVacancyId(e.target.value)}
              >
                <option value="">Select Vacancy</option>
                {vacancies?.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="input"
                value={dateOfApplication}
                onChange={(e) => setDateOfApplication(e.target.value)}
              />
            </div>

            <input
              className="input"
              placeholder="Keywords (comma separated)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          {/* Resume Upload */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Resume Upload
            </h3>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:bg-white transition">
              <FiUploadCloud className="text-2xl text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">
                {resumeFile ? resumeFile.name : "Click to upload resume"}
              </span>
              <input
                type="file"
                accept=".doc,.docx,.pdf,.rtf,.txt"
                className="hidden"
                onChange={(e) =>
                  setResumeFile(e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>

          {/* Notes */}
          <div>
            <textarea
              className="input min-h-[100px]"
              placeholder="Notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Consent */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span className="text-sm text-slate-600">
              Consent to keep candidate data
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2 rounded-full bg-lime-500 text-white font-semibold hover:bg-lime-600 disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save Candidate"}
            </button>
          </div>

        </form>
      </section>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.6rem 0.9rem;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
          background: white;
        }
        .input:focus {
          border-color: #84cc16;
          box-shadow: 0 0 0 2px rgba(132, 204, 22, 0.2);
        }
      `}</style>

    </div>
  );
}
