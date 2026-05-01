"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Check, Loader2, Building2 } from "lucide-react";
import { getStoredUser, clearAuth } from "@/lib/auth";
import styles from "./profile-dropdown.module.css";

function initials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export function ProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ id: 0, email: "", full_name: "User", role: "admin", tenant_id: 0, tenant_name: "" });
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setName(stored.full_name);
      setEmail(stored.email);
    }
  }, []);

  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    setDirty(name.trim() !== user.full_name || email.trim() !== user.email);
    setSaved(false);
  }, [name, email, user.full_name, user.email]);

  async function handleSave() {
    if (!dirty || saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const updated = { ...user, full_name: name.trim(), email: email.trim() };
    setUser(updated);
    setDirty(false);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSignOut() {
    setOpen(false);
    clearAuth();
    router.push("/login");
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className={styles.avatar}>{initials(user.full_name)}</div>
        <span className={styles.triggerName}>{user.full_name.split(" ")[0]}</span>
        <ChevronDown
          size={13}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.dropdown} role="dialog" aria-label="Profile">

            <div className={styles.dropHeader}>
              <div className={styles.avatarLg}>{initials(user.full_name)}</div>
              <div className={styles.dropHeaderText}>
                <p className={styles.dropName}>{user.full_name}</p>
                <p className={styles.dropEmail}>{user.email}</p>
                <span className={styles.rolePill}>{user.role}</span>
              </div>
            </div>

            <div className={styles.dropBody}>
              <p className={styles.sectionLabel}>Edit Profile</p>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  className={styles.fieldInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="off"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="profile-email">
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className={styles.fieldInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="off"
                />
              </div>

              <div className={styles.field} style={{ marginBottom: 0 }}>
                <label className={styles.fieldLabel}>Organisation</label>
                <span className={styles.fieldStatic}>
                  <Building2
                    size={12}
                    style={{ display: "inline", marginRight: 5, verticalAlign: "middle", color: "#94a3b8" }}
                  />
                  {user.tenant_name || "—"}
                </span>
              </div>

              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!dirty || saving}
                style={{ marginTop: 14 }}
              >
                {saving ? (
                  <>
                    <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </button>

              {saved && (
                <p className={styles.savedMsg}>
                  <Check size={12} />
                  Profile updated
                </p>
              )}
            </div>

            <div className={styles.dropFooter}>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                <LogOut size={14} />
                Sign out
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
