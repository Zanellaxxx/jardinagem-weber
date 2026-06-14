import { send as sendEmail } from '@emailjs/react-native';

function assertEmailConfig(serviceId, templateId) {
  if (!process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || !serviceId || !templateId) {
    throw new Error('O envio de e-mail não está configurado.');
  }
}

export const emailService = {
  async sendPasswordReset({ email, name, code, expiresInMinutes }) {
    const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EXPO_PUBLIC_EMAILJS_RESET_TEMPLATE_ID;
    assertEmailConfig(serviceId, templateId);
    await sendEmail(serviceId, templateId, {
      to_email: email,
      to_name: name,
      reset_code: code,
      expires_in_minutes: String(expiresInMinutes),
    });
  },
};
