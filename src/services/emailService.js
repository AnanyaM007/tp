// Email sending via EmailJS browser SDK.
// Requires the following Vite env vars to be set:
// VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
// Your EmailJS template should expect (at least) these params: to_email, subject, message.
import emailjs from "@emailjs/browser";

function getEmailJsConfig() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  return { serviceId, templateId, publicKey };
}

export async function sendRequestEmails({ emails, title, deadline, link, subject, body }) {
  const { serviceId, templateId, publicKey } = getEmailJsConfig();

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS config missing, skipping email send.");
    return { delivered: false, reason: "missing-config" };
  }

  if (!emails || emails.length === 0) {
    console.warn("No recipient emails provided, skipping email send.");
    return { delivered: false, reason: "no-recipients" };
  }

  const templateParams = {
    to_email: emails.join(","),
    subject: subject || `Data request: ${title}`,
    message:
      body ||
      `Hi team,\n\nPlease submit the requested data here: ${link}\nDeadline: ${deadline || "Not specified"}\n\nThank you.`,
  };

  await emailjs.send(serviceId, templateId, templateParams, {
    publicKey,
  });

  return { delivered: true };
}

export async function sendReminderEmails({ emails, title, nextReminder }) {
  const { serviceId, templateId, publicKey } = getEmailJsConfig();
  if (!serviceId || !templateId || !publicKey || !emails?.length) return;

  const templateParams = {
    to_email: emails.join(","),
    subject: `Reminder: ${title}`,
    message: `Friendly reminder: next reminder is scheduled on ${nextReminder}.`,
  };

  await emailjs.send(serviceId, templateId, templateParams, {
    publicKey,
  });
}
