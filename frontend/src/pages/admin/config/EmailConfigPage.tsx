// frontend/src/pages/admin/config/EmailConfigPage.tsx
import { useEffect, useState } from "react";
import {
  useGetEmailConfigQuery,
  useSaveEmailConfigMutation,
  useSendTestMailMutation,
} from "../../../features/admin/configApi";

// optional: extract a default form object
const defaultForm = {
  mailSentAs: "",
  sendingMethod: "SMTP",
  smtpHost: "",
  smtpPort: 587,
  useAuth: true,
  smtpUser: "",
  smtpPassword: "",
  tls: false,
};

export default function EmailConfigPage() {
  // NOTE: pass undefined so TS is happy
  const { data } = useGetEmailConfigQuery(undefined);
  const [saveConfig] = useSaveEmailConfigMutation();
  const [sendTest] = useSendTestMailMutation();

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      setForm({
        ...defaultForm,
        ...data,
      });
    }
  }, [data]);

  const handleSave = async () => {
    await saveConfig(form).unwrap();
    alert("Email settings saved");
  };

  const handleTest = async () => {
    const to = prompt("Enter email to send test mail:");
    if (!to) return;
    await sendTest(to).unwrap();
    alert("Test mail sent!");
  };

  return (
    <div className="p-6 bg-white rounded shadow mt-4">
      <h2 className="text-xl font-semibold mb-6">Email Configuration</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Mail Sent As */}
        <div>
          <label className="text-sm font-medium">Mail Sent As *</label>
          <input
            className="input w-full mt-2"
            value={form.mailSentAs}
            onChange={(e) =>
              setForm({ ...form, mailSentAs: e.target.value })
            }
          />
        </div>

        {/* Sending Method */}
        <div>
          <label className="text-sm font-medium">Sending Method</label>
          <div className="flex gap-4 mt-2">
            {["SMTP", "SECURE_SMTP", "SENDMAIL"].map((m) => (
              <label
                key={m}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  checked={form.sendingMethod === m}
                  onChange={() => setForm({ ...form, sendingMethod: m })}
                />
                {m.replace("_", " ")}
              </label>
            ))}
          </div>
        </div>

        {/* SMTP Host */}
        <div>
          <label className="text-sm font-medium">SMTP Host *</label>
          <input
            className="input w-full mt-2"
            value={form.smtpHost}
            onChange={(e) =>
              setForm({ ...form, smtpHost: e.target.value })
            }
          />
        </div>

        {/* SMTP Port */}
        <div>
          <label className="text-sm font-medium">SMTP Port *</label>
          <input
            type="number"
            className="input w-full mt-2"
            value={form.smtpPort}
            onChange={(e) =>
              setForm({ ...form, smtpPort: Number(e.target.value) })
            }
          />
        </div>

        {/* Use Auth */}
        <div>
          <label className="text-sm font-medium">
            Use SMTP Authentication
          </label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                checked={form.useAuth}
                onChange={() => setForm({ ...form, useAuth: true })}
              />
              Yes
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                checked={!form.useAuth}
                onChange={() => setForm({ ...form, useAuth: false })}
              />
              No
            </label>
          </div>
        </div>

        {/* SMTP User & Password (only if auth) */}
        {form.useAuth && (
          <>
            <div>
              <label className="text-sm font-medium">SMTP User *</label>
              <input
                className="input w-full mt-2"
                value={form.smtpUser}
                onChange={(e) =>
                  setForm({ ...form, smtpUser: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                SMTP Password *
              </label>
              <input
                type="password"
                className="input w-full mt-2"
                value={form.smtpPassword}
                onChange={(e) =>
                  setForm({ ...form, smtpPassword: e.target.value })
                }
              />
            </div>
          </>
        )}

        {/* TLS */}
        <div>
          <label className="text-sm font-medium">TLS</label>
          <div className="mt-2">
            <input
              type="checkbox"
              checked={form.tls}
              onChange={(e) =>
                setForm({ ...form, tls: e.target.checked })
              }
            />{" "}
            <span className="text-xs text-gray-500 ml-2">
              Optional – enable if your SMTP requires TLS.
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-4">
        <button
          type="button"
          onClick={() => setForm(data ? { ...defaultForm, ...data } : defaultForm)}
          className="px-4 py-2 rounded border border-gray-300 text-sm"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleTest}
          className="px-4 py-2 rounded bg-blue-500 text-white text-sm"
        >
          Send Test Mail
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded bg-lime-500 text-white text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}
