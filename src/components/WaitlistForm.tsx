"use client";

import { useId, useState } from "react";

import WaitlistModal from "@/components/WaitlistModal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Two-step sign-up: email captured on the page, the rest gathered in a modal.
 * Keeps the page itself a teaser while still collecting what launch needs.
 */
export default function WaitlistForm() {
  const emailId = useId();
  const hintId = useId();

  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setModalOpen(true);
  }

  if (done) {
    return (
      <div
        className="rounded-lg border border-accent/40 bg-accent/[0.08] p-6 sm:p-8"
        role="status"
        aria-live="polite"
      >
        <p className="eyebrow text-accent">You&rsquo;re on the list</p>
        <p className="mt-3 text-2xl text-heading sm:text-3xl">
          Saved. We&rsquo;ll be in touch before 14 September.
        </p>
        <p className="mt-2 text-sm">
          Suburbs open in order of demand — yours just moved up the queue.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="w-full">
        <label htmlFor={emailId} className="eyebrow block">
          Email address
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (invalid) setInvalid(false);
            }}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={invalid}
            aria-describedby={hintId}
            className={`min-w-0 flex-1 rounded-md border bg-bg px-4 py-3.5 text-heading
              placeholder:text-muted transition-colors duration-200 hover:border-line-strong
              ${invalid ? "border-red-500" : "border-line"}`}
          />

          <button
            type="submit"
            className="shrink-0 rounded-md bg-accent px-6 py-3.5 font-medium text-on-accent
              transition-all duration-200 hover:brightness-110 active:translate-y-px"
          >
            Join the waitlist
          </button>
        </div>

        <p
          id={hintId}
          role={invalid ? "alert" : undefined}
          aria-live="polite"
          className={`mt-3 min-h-5 text-sm ${invalid ? "text-red-400" : "text-muted"}`}
        >
          {invalid
            ? "That doesn't look like a valid email — check for typos."
            : "One more step after this. No spam, ever."}
        </p>
      </form>

      <WaitlistModal
        /* Remount on open so the modal's fields initialise from the current
           email and reset between attempts — no prop→state sync effect needed. */
        key={modalOpen ? `open-${email}` : "closed"}
        open={modalOpen}
        initialEmail={email}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          setDone(true);
        }}
      />
    </>
  );
}
