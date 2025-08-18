import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, updateUserAttributes, confirmUserAttribute } from "aws-amplify/auth";

// Optional: if you keep a central util, you can delete this and import it from there
async function getAuthHeader() {
  const s = await fetchAuthSession();
  const token = s?.tokens?.idToken?.toString() || s?.tokens?.accessToken?.toString();
  return token ? { Authorization: token } : null;
}

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", email: "", email_verified: false });
  const [prefs, setPrefs] = useState({
    timezone: "Asia/Singapore",
    currency: "SGD",
    locale: "en-SG",
    theme: "system",
    numberFormat: "1,234.56",
    dateFormat: "YYYY-MM-DD",
  });
  const [notif, setNotif] = useState({ processing: true, failed: true, digest: "instant" });
  const [expenseCfg, setExpenseCfg] = useState({
    autoCategorize: true,
    confidenceThreshold: 0.7,
    defaultCategory: "Uncategorized",
    rules: [],
  });
  const [saving, setSaving] = useState({});
  const busy = useMemo(() => Object.values(saving).some(Boolean), [saving]);

useEffect(() => {
  (async () => {
    try {
      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      const meRes = await fetch("https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/preferences", { headers });
      if (meRes.ok) {
        const data = await meRes.json();
        if (data?.profile) setProfile((p) => ({ ...p, ...data.profile }));
        if (data?.prefs) setPrefs((p) => ({ ...p, ...data.prefs }));
        if (data?.notifications) setNotif((n) => ({ ...n, ...data.notifications }));
        if (data?.expenseCfg) setExpenseCfg((e) => ({ ...e, ...data.expenseCfg }));
      }

      // 👇 Grab Cognito user + email
      const me = await getCurrentUser();
      setUser(me);

      const session = await fetchAuthSession();
      const email = session?.tokens?.idToken?.payload?.email;
      const email_verified = session?.tokens?.idToken?.payload?.email_verified;
      if (email) {
        setProfile((p) => ({ ...p, email, email_verified }));
      }
    } catch (e) {
      console.warn("Load settings failed", e);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  if (loading) return <div className="container py-4">Loading settings…</div>;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Account Settings</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <ProfileCard profile={profile} setProfile={setProfile} setSaving={setSaving} />
        </div>

        <div className="col-12">
          <PrivacyDataCard setSaving={setSaving} />
        </div>
      </div>
      {busy && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center text-bg-secondary">
            <div className="d-flex">
              <div className="toast-body">Saving…</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, children, footer, className = "" }) {
  return (
    <div className={`card shadow-sm border-0 rounded-3 ${className}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="h5 m-0">{title}</h2>
            {subtitle && <div className="text-muted small">{subtitle}</div>}
          </div>
        </div>
        {children}
      </div>
      {footer && <div className="card-footer bg-white border-0 pt-0">{footer}</div>}
    </div>
  );
}

function ProfileCard({ profile, setProfile, setSaving }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    avatarUrl: profile.avatarUrl || ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(profile.avatarUrl || "");

  useEffect(() => {
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      avatarUrl: profile.avatarUrl || ""
    });
    setPreview(profile.avatarUrl || "");
    setAvatarFile(null);
  }, [profile]);

  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSave = async () => {
    setSaving(s => ({ ...s, profile: true }));
    try {
      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      let avatarUrl = form.avatarUrl || "";

      // If a new image was picked, get a presigned URL and upload straight to S3
      if (avatarFile) {
        // 1) Ask backend for presigned PUT URL
        const pres = await fetch(
          "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/profile/avatar-url",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ fileName: avatarFile.name, contentType: avatarFile.type })
          }
        );
        const pj = await pres.json().catch(() => ({}));
        if (!pres.ok || !pj?.uploadUrl || !pj?.publicUrl) {
          throw new Error(pj?.error || "Failed to get upload URL");
        }

        // 2) Upload file directly to S3 via presigned URL (DO NOT set Authorization here)
        await fetch(pj.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile
        });

        avatarUrl = pj.publicUrl;
      }

      // 3) Save first/last name + avatar URL
      const save = await fetch(
        "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            avatarUrl
          })
        }
      );
      if (!save.ok) {
        const j = await save.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to save profile");
      }

      // Update local UI + navbar cache
      const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim();
      setProfile(p => ({ ...p, ...form, avatarUrl }));
      try {
        localStorage.setItem("userName", fullName || "User");
        localStorage.setItem("avatarUrl", avatarUrl || "");
      } catch {}
      alert("Profile saved.");
    } catch (e) {
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(s => ({ ...s, profile: false }));
    }
  };

  // Email edit flow state
  const [emailEdit, setEmailEdit] = useState(false);
  const [emailNew, setEmailNew] = useState(form.email || "");
  const [emailCode, setEmailCode] = useState("");
  const [emailStage, setEmailStage] = useState("idle"); // 'idle' | 'code'

  // Start email change: updates Cognito attribute and triggers a code to the new email
  const startEmailChange = async () => {
    const newEmail = emailNew.trim();
    if (!newEmail || newEmail === form.email) return;

    try {
      // Update email attribute in Cognito; this automatically sends a verification code
      await updateUserAttributes({
        userAttributes: { email: newEmail }
      });
      setEmailStage("code");
      alert("We sent a verification code to your new email.");
    } catch (e) {
      alert(e.message || "Failed to start email change");
    }
  };

  // Confirm the verification code to finalize the email change
  const confirmEmail = async () => {
    try {
      await confirmUserAttribute({
        userAttributeKey: "email",
        confirmationCode: emailCode.trim()
      });

      // Update local UI state
      setForm((f) => ({ ...f, email: emailNew, email_verified: true }));
      setEmailEdit(false);
      setEmailStage("idle");
      setEmailCode("");
      alert("Your email has been verified and updated.");
    } catch (e) {
      alert(e.message || "Invalid or expired code");
    }
  };

  return (
    <Card title="Profile" subtitle="Your basic information">
      <div className="row g-3">
        {/* Avatar */}
        <div className="col-12 d-flex align-items-center gap-3">
          <label
            htmlFor="avatarInput"
            className="rounded-circle border"
            style={{
              width: 72,
              height: 72,
              overflow: "hidden",
              background: "#f8f9fa",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span className="text-muted small">Add photo</span>
            )}
          </label>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            hidden
            onChange={pickImage}
          />
          {avatarFile && <div className="small text-muted">{avatarFile.name}</div>}
        </div>

        {/* Names */}
        <div className="col-12 col-md-6">
          <label className="form-label">First Name</label>
          <input
            className="form-control"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Last Name</label>
          <input
            className="form-control"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        {/* Email (read-only) + verify */}
        <div className="col-12">
          <label className="form-label">Email</label>

          {/* Read-only view */}
          {!emailEdit && (
            <div className="d-flex gap-2">
              <input className="form-control" value={form.email} disabled />
              <div className="form-text">{form.email_verified ? "Verified" : "Not verified"}</div>
              <button type="button" className="btn btn-outline-secondary" onClick={() => {
                setEmailEdit(true);
                setEmailNew(form.email || "");
                setEmailStage("idle");
                setEmailCode("");
              }}>
                Change
              </button>
            </div>
          )}

          {/* Edit view */}
          {emailEdit && (
            <>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control"
                  type="email"
                  value={emailNew}
                  onChange={(e) => setEmailNew(e.target.value)}
                  placeholder="your-new-email@example.com"
                />
                {emailStage === "idle" && (
                  <button type="button" className="btn btn-primary" onClick={startEmailChange}>
                    Send code
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary" onClick={() => {
                  setEmailEdit(false);
                  setEmailStage("idle");
                  setEmailCode("");
                  setEmailNew(form.email || "");
                }}>
                  Cancel
                </button>
              </div>

              {/* Code entry stage */}
              {emailStage === "code" && (
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter verification code"
                  />
                  <button type="button" className="btn btn-success" onClick={confirmEmail}>
                    Confirm
                  </button>
                </div>
              )}
            </>
          )}

          <div className="form-text">
            {form.email_verified ? "Verified" : "Not verified"}
          </div>
        </div>


        <div className="col-12">
          <button className="btn btn-primary" onClick={onSave}>Save profile</button>
        </div>
      </div>
    </Card>
  );
}

function PrivacyDataCard({ setSaving }) {
  const [busy, setBusy] = useState(false);

  const exportData = async () => {
    setBusy(true);
    setSaving((s) => ({ ...s, export: true }));
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/me/export`, { method: "POST", headers });
      if (!res.ok) throw new Error("Export failed");
      alert("Export requested. Check your email for download link.");
    } catch (e) {
      alert(e.message || "Failed to start export");
    } finally {
      setBusy(false);
      setSaving((s) => ({ ...s, export: false }));
    }
  };

  const deleteAccount = async () => {
    const sure = prompt("Type DELETE to confirm account deletion. This cannot be undone.");
    if (sure !== "DELETE") return;
    setSaving((s) => ({ ...s, delete: true }));
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/me`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed");
      alert("Account scheduled for deletion.");
      // Optionally signOut here
      // await signOut();
      window.location.href = "/";
    } catch (e) {
      alert(e.message || "Failed to delete account");
    } finally {
      setSaving((s) => ({ ...s, delete: false }));
    }
  };

  return (
    <Card title="Privacy & Data" subtitle="Export or delete your data">
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-outline-primary" onClick={exportData} disabled={busy}>Export my data</button>
        <button className="btn btn-outline-danger" onClick={deleteAccount}>Delete my account</button>
      </div>
    </Card>
  );
}
