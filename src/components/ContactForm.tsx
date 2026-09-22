"use client";

import { FormEvent, useCallback, useId, useState } from "react";
import { IconArrowRight } from "@/components/Icons";
import { Toast, type ToastTone } from "@/components/Toast";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/event-content";

type FieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

type ToastState = {
  message: string;
  tone: ToastTone;
} | null;

const MESSAGE_MAX = 4000;

function validateClient(values: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!CONTACT_SUBJECTS.includes(values.subject as ContactSubject)) {
    errors.subject = "Please select a topic.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Please enter a message of at least 10 characters.";
  } else if (values.message.length > MESSAGE_MAX) {
    errors.message = `Message must be ${MESSAGE_MAX.toLocaleString()} characters or fewer.`;
  }
  return errors;
}

export function ContactForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setToast(null);

    const nextErrors = validateClient({ name, email, subject, message });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
          company,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        throw new Error(data.error || "We couldn't submit your message. Please try again.");
      }

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCompany("");
      setFieldErrors({});
      setToast({
        tone: "ok",
        message:
          data.message ||
          "Thank you for contacting us. Your message has been received.",
      });
    } catch (err) {
      setToast({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "We couldn't submit your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toast ? (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={dismissToast}
          durationMs={8000}
        />
      ) : null}

      <form
        id="contact-form"
        className="contact-form"
        onSubmit={onSubmit}
        noValidate
        aria-busy={loading}
      >
        <div className="contact-form__intro">
          <h2 className="contact-panel__title">
            Send Us a Message
            <span className="contact-panel__rule" aria-hidden />
          </h2>
          <p className="contact-form__lede">
            Fill out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>
        </div>

        <div className="contact-form__row">
          <div className="contact-field">
            <label htmlFor={`${formId}-name`}>
              Full Name <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              value={name}
              disabled={loading}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={
                fieldErrors.name ? `${formId}-name-error` : undefined
              }
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name ? (
              <p id={`${formId}-name-error`} className="contact-field__error" role="alert">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="contact-field">
            <label htmlFor={`${formId}-email`}>
              Email Address <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              disabled={loading}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={
                fieldErrors.email ? `${formId}-email-error` : undefined
              }
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email ? (
              <p id={`${formId}-email-error`} className="contact-field__error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor={`${formId}-subject`}>
            Subject <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-subject`}
            name="subject"
            required
            value={subject}
            disabled={loading}
            aria-invalid={fieldErrors.subject ? true : undefined}
            aria-describedby={
              fieldErrors.subject ? `${formId}-subject-error` : undefined
            }
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="" disabled>
              Select a topic
            </option>
            {CONTACT_SUBJECTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.subject ? (
            <p id={`${formId}-subject-error`} className="contact-field__error" role="alert">
              {fieldErrors.subject}
            </p>
          ) : null}
        </div>

        <div className="contact-field">
          <label htmlFor={`${formId}-message`}>
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={6}
            placeholder="How can we help you?"
            value={message}
            disabled={loading}
            maxLength={MESSAGE_MAX + 1}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={
              fieldErrors.message ? `${formId}-message-error` : `${formId}-message-hint`
            }
            onChange={(e) => setMessage(e.target.value)}
          />
          <p id={`${formId}-message-hint`} className="contact-field__hint">
            {message.length}/{MESSAGE_MAX}
          </p>
          {fieldErrors.message ? (
            <p id={`${formId}-message-error`} className="contact-field__error" role="alert">
              {fieldErrors.message}
            </p>
          ) : null}
        </div>

        {/* Honeypot - hidden from users */}
        <div className="contact-honeypot" aria-hidden="true">
          <label htmlFor={`${formId}-company`}>Company</label>
          <input
            id={`${formId}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block contact-form__submit"
          disabled={loading}
        >
          <span>{loading ? "Sending…" : "Send Message"}</span>
          {!loading ? <IconArrowRight className="btn__icon" /> : null}
        </button>
      </form>
    </>
  );
}
