import { send as sendEmail } from '@emailjs/react-native';

const FORMSUBMIT_AJAX_URL = 'https://formsubmit.co/ajax';

function filled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasEmailJsConfig(templateId) {
  return filled(process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY)
    && filled(process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID)
    && filled(templateId);
}

function assertRealRecipient(email) {
  if (!filled(email)) {
    throw new Error('Preencha EXPO_PUBLIC_COMPANY_EMAIL no .env para receber as solicitacoes.');
  }

  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith('@exemplo.com') || normalized.endsWith('@example.com')) {
    throw new Error('Troque EXPO_PUBLIC_COMPANY_EMAIL por um e-mail real no .env e reinicie o Expo.');
  }
}

function formatAddress(address) {
  return [
    `${address.street}, ${address.number}`,
    address.complement,
    address.neighborhood,
    address.city,
  ]
    .filter(Boolean)
    .join(' - ');
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function companyEmail() {
  return process.env.EXPO_PUBLIC_COMPANY_EMAIL?.trim() || process.env.EXPO_PUBLIC_ADMIN_EMAIL?.trim();
}

function buildNewRequestMessage({
  service,
  user,
  scheduledDate,
  observations,
  address,
  photos,
  providerName,
}) {
  const date = new Date(scheduledDate);

  return [
    `Nova solicitacao de orcamento - ${process.env.EXPO_PUBLIC_COMPANY_NAME || 'Jardinagem Weber'}`,
    '',
    `Servico: ${service.name}`,
    `Prestador: ${providerName || 'Nao informado'}`,
    `Cliente: ${user.name}`,
    `E-mail do cliente: ${user.email}`,
    `Telefone: ${user.phone || 'Nao informado'}`,
    `Data: ${formatDate(date)}`,
    `Horario: ${formatTime(date)}`,
    `Endereco: ${formatAddress(address)}`,
    `Observacoes: ${observations?.trim() || 'Nenhuma'}`,
    `Fotos anexadas no app: ${photos?.length || 0}`,
  ].join('\n');
}

function buildPasswordResetMessage({ name, code, expiresInMinutes }) {
  return [
    `Ola, ${name}.`,
    '',
    `Seu codigo de recuperacao de senha e: ${code}`,
    `Ele expira em ${expiresInMinutes} minutos.`,
    '',
    'Se voce nao solicitou a recuperacao, ignore esta mensagem.',
  ].join('\n');
}

async function sendFormSubmitEmail({ to, subject, payload }) {
  assertRealRecipient(to);

  const response = await fetch(`${FORMSUBMIT_AJAX_URL}/${encodeURIComponent(to.trim())}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      ...payload,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Nao foi possivel enviar o e-mail pelo FormSubmit.');
  }

  return { method: 'formsubmit', data };
}

export const emailService = {
  async sendNewRequestNotification({
    service,
    user,
    scheduledDate,
    observations,
    address,
    photos,
    providerName,
  }) {
    const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
    const date = new Date(scheduledDate);
    const toEmail = companyEmail();
    const message = buildNewRequestMessage({
      service,
      user,
      scheduledDate,
      observations,
      address,
      photos,
      providerName,
    });

    assertRealRecipient(toEmail);

    if (hasEmailJsConfig(templateId)) {
      await sendEmail(process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID, templateId, {
        to_email: toEmail,
        to_name: process.env.EXPO_PUBLIC_COMPANY_NAME || 'Jardinagem Weber',
        service_name: service.name,
        client_name: user.name,
        client_email: user.email,
        client_phone: user.phone || 'Nao informado',
        scheduled_date: formatDate(date),
        scheduled_time: formatTime(date),
        address: formatAddress(address),
        observations: observations?.trim() || 'Nenhuma',
        photos_count: String(photos?.length || 0),
        provider_name: providerName || 'Nao informado',
        message,
      });

      return { method: 'emailjs' };
    }

    return sendFormSubmitEmail({
      to: toEmail,
      subject: `Nova solicitacao de orcamento - ${service.name}`,
      payload: {
        name: user.name,
        email: user.email,
        telefone: user.phone || 'Nao informado',
        servico: service.name,
        prestador: providerName || 'Nao informado',
        data: formatDate(date),
        horario: formatTime(date),
        endereco: formatAddress(address),
        observacoes: observations?.trim() || 'Nenhuma',
        fotos: String(photos?.length || 0),
        message,
      },
    });
  },

  async sendPasswordReset({ email, name, code, expiresInMinutes }) {
    const templateId = process.env.EXPO_PUBLIC_EMAILJS_RESET_TEMPLATE_ID;
    const message = buildPasswordResetMessage({ name, code, expiresInMinutes });

    if (hasEmailJsConfig(templateId)) {
      await sendEmail(process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID, templateId, {
        to_email: email,
        to_name: name,
        reset_code: code,
        expires_in_minutes: String(expiresInMinutes),
        message,
      });

      return { method: 'emailjs' };
    }

    return sendFormSubmitEmail({
      to: email,
      subject: 'Codigo de recuperacao de senha',
      payload: {
        name,
        email,
        codigo: code,
        validade: `${expiresInMinutes} minutos`,
        message,
      },
    });
  },
};
