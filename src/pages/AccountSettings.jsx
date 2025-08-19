import '../styles/style.css';
import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, updateUserAttributes, confirmUserAttribute } from "aws-amplify/auth";

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

      // Grab Cognito user + email
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
      <div className="d-flex justify-content-center">
        <div className="w-100" style={{ maxWidth: "760px" }}>
          <ProfileCard profile={profile} setProfile={setProfile} setSaving={setSaving} />
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

function ProfileCard({ profile, setProfile, setSaving }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    avatarUrl: profile.avatarUrl || "",
    email_verified: !!profile.email_verified,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(profile.avatarUrl || "");
  const [emailEdit, setEmailEdit] = useState(false);
  const [emailNew, setEmailNew] = useState(profile.email || "");
  const [emailCode, setEmailCode] = useState("");
  const [emailStage, setEmailStage] = useState("idle");
  useEffect(() => {
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      avatarUrl: profile.avatarUrl || "",
      email_verified: !!profile.email_verified,
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

  async function onSave() {
    setSaving(s => ({ ...s, profile: true }));
    try {
      // auth header
      const s = await fetchAuthSession();
      const token = s?.tokens?.idToken?.toString() || s?.tokens?.accessToken?.toString();
      if (!token) throw new Error("Not authenticated");
      const headers = { Authorization: token, "Content-Type": "application/json" };

      // 1) If a new avatar chosen, get presigned URL and PUT to S3
      let avatarUrl = form.avatarUrl || "";
      if (avatarFile) {
        const pres = await fetch(
          "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/profile/avatar-url",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ fileName: avatarFile.name, contentType: avatarFile.type })
          }
        );
        const pj = await pres.json().catch(() => ({}));
        if (!pres.ok || !pj?.uploadUrl || !pj?.publicUrl) {
          throw new Error(pj?.error || "Failed to get upload URL");
        }

        await fetch(pj.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile,
        });
        avatarUrl = pj.publicUrl;
      }

      // Save profile basics
      const res = await fetch(
        "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/profile",
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            avatarUrl
          })
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to save profile");
      }

      // sync UI + cache for navbar
      const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim();
      setProfile((p) => ({ ...p, ...form, avatarUrl }));
      try {
        localStorage.setItem("userName", fullName || "User");
        localStorage.setItem("avatarUrl", avatarUrl || "");
      } catch {}

      // done
      const okToast = document.getElementById("saveToast");
      if (okToast) {
        okToast.classList.add("show");
        setTimeout(() => okToast.classList.remove("show"), 1600);
      } else {
        alert("Profile saved.");
      }
    } catch (e) {
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(s => ({ ...s, profile: false }));
    }
  }

  // Email change flow
  async function startEmailChange() {
    const newEmail = emailNew.trim();
    if (!newEmail || newEmail === form.email) return;
    try {
      await updateUserAttributes({ userAttributes: { email: newEmail } });
      setEmailStage("code");
      // optional hint to the user
      // alert("We sent a verification code to your new email.");
    } catch (e) {
      alert(e.message || "Failed to start email change");
    }
  }
  async function confirmEmail() {
    try {
      await confirmUserAttribute({
        userAttributeKey: "email",
        confirmationCode: emailCode.trim(),
      });

      // 🔑 get a fresh ID token that contains the NEW email
      await fetchAuthSession({ forceRefresh: true });

      // reload the prefs (optional but nice to keep backend + UI consistent)
      try {
        const s = await fetchAuthSession();
        const token = s?.tokens?.idToken?.toString() || s?.tokens?.accessToken?.toString();
        if (token) {
          const r = await fetch(
            "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/me/preferences",
            { headers: { Authorization: token } }
          );
          const j = await r.json().catch(() => ({}));
          const newEmail = j?.profile?.email || emailNew.trim();

          // update form + global profile
          setForm((f) => ({ ...f, email: newEmail, email_verified: true }));
          setProfile((p) => ({ ...p, email: newEmail, email_verified: true }));

          // make other pages (navbar, upload, etc.) see it immediately
          try { localStorage.setItem("userEmail", newEmail); } catch {}
        }
      } catch {}

      // reset UI
      setEmailEdit(false);
      setEmailStage("idle");
      setEmailCode("");
    } catch (e) {
      alert(e.message || "Invalid or expired code");
    }
  }

  return (
    <div className="profile-card card border-0 shadow-sm overflow-hidden">
      {/* Body */}
      <div className="card-body p-4 p-md-5">
        {/* Avatar + basic */}
        <div className="d-flex flex-column flex-sm-row align-items-center gap-3 mb-4">
          <label htmlFor="avatarInput" className="avatar-uploader">
            {preview ? (
              <img src={preview} alt="avatar" className="w-100 h-100 object-fit-cover" />
            ) : (
              <span className="text-muted small">Add photo</span>
            )}
          </label>
          <input id="avatarInput" type="file" accept="image/*" hidden onChange={pickImage} />
          <button className="btn btn-primary" onClick={onSave}>
            Save changes
          </button>
        </div>

        {/* Form */}
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">First name</label>
            <div className="input-group input-group-modern">
              <span className="input-group-text"><i className="fa-regular fa-user" /></span>
              <input
                className="form-control"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Your first name"
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Last name</label>
            <div className="input-group input-group-modern">
              <span className="input-group-text"><i className="fa-regular fa-user" /></span>
              <input
                className="form-control"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Your last name"
              />
            </div>
          </div>

          {/* Email section */}
          <div className="col-12">
            <label className="form-label">Email</label>

          {!emailEdit && (
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div className="input-group input-group-modern flex-grow-1">
                <span className="input-group-text"><i className="fa-regular fa-envelope" /></span>
                <input className="form-control" value={form.email} disabled />
              </div>

              <span className={`badge ${form.email_verified ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                {form.email_verified ? "Verified" : "Not verified"}
              </span>

              <button type="button" className="btn btn-outline-secondary ms-auto btn-44"
                      onClick={() => { setEmailEdit(true); setEmailNew(form.email || ""); setEmailStage("idle"); setEmailCode(""); }}>
                Change
              </button>
            </div>
          )}

          {emailEdit && (
            <div className="d-flex flex-column gap-2">
              <div className="d-flex gap-2 flex-wrap">
                <div className="input-group input-group-modern flex-grow-1">
                  <span className="input-group-text"><i className="fa-regular fa-envelope" /></span>
                  <input className="form-control" type="email" value={emailNew}
                        onChange={(e) => setEmailNew(e.target.value)} placeholder="your-new-email@example.com" />
                </div>

                {emailStage === "idle" && (
                  <button type="button" className="btn btn-primary btn-44" onClick={startEmailChange}>
                    Send code
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary btn-44"
                        onClick={() => { setEmailEdit(false); setEmailStage("idle"); setEmailCode(""); setEmailNew(form.email || ""); }}>
                  Cancel
                </button>
              </div>

              {emailStage === "code" && (
                <div className="d-flex gap-2 flex-wrap">
                  <div className="input-group input-group-modern flex-grow-1">
                    <span className="input-group-text"><i className="fa-solid fa-key" /></span>
                    <input className="form-control" value={emailCode} onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="Verification code" />
                  </div>
                  <button type="button" className="btn btn-success btn-44" onClick={confirmEmail}>Confirm</button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* subtle toast for "saved" */}
      <div
        id="saveToast"
        className="toast align-items-center text-bg-dark position-absolute end-0 m-3"
        role="status"
        aria-live="polite"
      >
        <div className="d-flex">
          <div className="toast-body">Profile saved</div>
        </div>
      </div>
    </div>
  );
}

