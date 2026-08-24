"use client";

import { useEffect, useId, useRef, useState } from "react";

import { perthSuburbs } from "@/lib/site";

type Status = "idle" | "submitting" | "error";
type Preference = "veg" | "non-veg" | "";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mirrors the server rule: 4XXXXXXXX, 04XXXXXXXX, or 614XXXXXXXX. */
function validAuMobile(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  return (
    (digits.length === 9 && digits.startsWith("4")) ||
    (digits.length === 10 && digits.startsWith("04")) ||
    (digits.length === 11 && digits.startsWith("614"))
  );
}

export default function WaitlistModal({
  open,
  initialEmail,
  onClose,
  onSuccess,
}: {
  open: boolean;
  initialEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const titleId = useId();
  const emailId = useId();
  const mobileId = useId();
  const suburbId = useId();
  const prefId = useId();
  const errorId = useId();

  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState("");
  const [suburb, setSuburb] = useState("");
  const [preference, setPreference] = useState<Preference>("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");

  // No prop→state sync effect here on purpose: the parent remounts this
  // component (via `key`) each time it opens, so useState picks up the
  // current email as its initial value and every field starts clean.

  // Native <dialog> gives us the focus trap, Escape handling and inert
  // background for free — we only need to drive open/close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Scroll lock is deliberately its own effect. Folding it into the one above
  // made it depend on `!dialog.open`, so a cleanup+rerun (React's dev double
  // invoke) would unlock and then skip re-locking. This one is idempotent.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function fail(message: string, field: string) {
    setStatus("error");
    setError(message);
    setErrorField(field);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return fail("Enter a valid email address.", "email");
    }
    if (!validAuMobile(mobile)) {
      return fail("Enter a valid Australian mobile, e.g. 412 345 678.", "mobile");
    }
    if (preference !== "veg" && preference !== "non-veg") {
      return fail("Choose veg or non-veg.", "preference");
    }

    setStatus("submitting");
    setError("");
    setErrorField("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          mobile,
          suburb,
          preference,
          company: honeypot.current?.value ?? "",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Something went wrong.");

      setStatus("idle");
      onSuccess();
    } catch (caught) {
      fail(
        caught instanceof Error ? caught.message : "Something went wrong. Try again.",
        "",
      );
    }
  }

  const fieldBase =
    "w-full rounded-md border bg-bg px-4 py-3 text-heading placeholder:text-muted " +
    "transition-colors duration-200 hover:border-line-strong disabled:opacity-60";
  const borderFor = (field: string) =>
    errorField === field ? "border-red-500" : "border-line";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="theme-dark m-auto w-[min(100%-2rem,34rem)] rounded-xl border border-line
        bg-surface p-0 text-body backdrop:bg-charcoal/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow">Almost there</p>
            <h2 id={titleId} className="mt-2 text-2xl sm:text-3xl">
              Save your place.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-md p-2 text-muted transition-colors
              duration-200 hover:text-heading"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
          <div>
            <label htmlFor={emailId} className="eyebrow block">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={status === "submitting"}
              aria-invalid={errorField === "email"}
              className={`mt-2.5 ${fieldBase} ${borderFor("email")}`}
            />
          </div>

          <div>
            <label htmlFor={mobileId} className="eyebrow block">
              Mobile
            </label>
            <div className="mt-2.5 flex">
              <span
                aria-hidden
                className="grid place-items-center rounded-l-md border border-r-0
                  border-line bg-bg px-3.5 text-muted"
              >
                +61
              </span>
              <input
                id={mobileId}
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="412 345 678"
                autoComplete="tel-national"
                disabled={status === "submitting"}
                aria-invalid={errorField === "mobile"}
                aria-describedby={`${mobileId}-hint`}
                className={`${fieldBase} rounded-l-none ${borderFor("mobile")}`}
              />
            </div>
            <p id={`${mobileId}-hint`} className="mt-2 text-xs text-muted">
              Australian mobile, without the leading zero.
            </p>
          </div>

          <div>
            <label htmlFor={suburbId} className="eyebrow block">
              Perth suburb <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <select
              id={suburbId}
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              disabled={status === "submitting"}
              className={`mt-2.5 ${fieldBase} ${borderFor("suburb")}`}
            >
              <option value="">Select a suburb</option>
              {perthSuburbs.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">
              Suburbs open in order of demand — this helps us pick the order.
            </p>
          </div>

          <fieldset aria-describedby={errorField === "preference" ? errorId : undefined}>
            <legend id={prefId} className="eyebrow">
              Preference
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {(["veg", "non-veg"] as const).map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center rounded-md
                    border px-4 py-3 transition-colors duration-200
                    ${
                      preference === value
                        ? "border-accent bg-accent/10 text-heading"
                        : `${borderFor("preference")} text-body hover:border-line-strong`
                    }`}
                >
                  <input
                    type="radio"
                    name="preference"
                    value={value}
                    checked={preference === value}
                    onChange={() => setPreference(value)}
                    disabled={status === "submitting"}
                    className="sr-only"
                  />
                  {value === "veg" ? "Veg" : "Non-veg"}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Honeypot — real people never see or fill this. */}
          <input
            ref={honeypot}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-md bg-accent px-6 py-3.5 font-medium text-on-accent
              transition-all duration-200 hover:brightness-110 active:translate-y-px
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Joining…" : "Join the waitlist"}
          </button>

          <p
            id={errorId}
            role={status === "error" ? "alert" : undefined}
            aria-live="polite"
            className={`min-h-5 text-sm ${status === "error" ? "text-red-400" : "text-muted"}`}
          >
            {error || "We'll only email you about the Perth launch."}
          </p>
        </form>
      </div>
    </dialog>
  );
}
