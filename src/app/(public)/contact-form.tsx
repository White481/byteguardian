"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { fieldErrors } from "@/lib/validation";

const ContactInput = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(2000),
});

// TODO(ตัง): send to a real endpoint (email / CRM) when the business team decides where messages go.
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const bind = (name: keyof typeof values) => ({
    id: `contact-${name}`,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  if (sent) {
    return (
      <Alert tone="info">
        Thanks! This contact form is a demo — messages aren&apos;t delivered yet. Please email the team directly for now.
      </Alert>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = ContactInput.safeParse(values);
        if (!parsed.success) return setErrors(fieldErrors(parsed.error));
        setErrors({});
        setSent(true);
      }}
    >
      <Field label="Name" htmlFor="contact-name" required error={errors.name}>
        <Input {...bind("name")} autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="contact-email" required error={errors.email}>
        <Input {...bind("email")} type="email" autoComplete="email" />
      </Field>
      <Field label="Message" htmlFor="contact-message" required error={errors.message}>
        <Textarea {...bind("message")} />
      </Field>
      <Button type="submit">Send message</Button>
    </form>
  );
}
