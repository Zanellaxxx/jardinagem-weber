import { PAYMENT_STATUS } from '../constants/payment';
import { DEFAULT_PROVIDER } from '../constants/providers';
import { REQUEST_STATUS } from '../constants/requestStatus';

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

function assertStatus(request, allowed, message) {
  if (!allowed.includes(request.status)) throw new Error(message);
}

export function normalizeRequest(request) {
  const legacyStatus = request.status === 'rejected' ? REQUEST_STATUS.QUOTE_REJECTED : request.status;
  return {
    completionPhotos: [],
    payment: null,
    rating: null,
    history: [],
    providerId: DEFAULT_PROVIDER.id,
    providerName: DEFAULT_PROVIDER.name,
    ...request,
    status: legacyStatus,
  };
}

export function createRequest(requestData) {
  const now = new Date().toISOString();
  return normalizeRequest({
    ...requestData,
    id: `${Date.now()}`,
    status: REQUEST_STATUS.PENDING,
    quotedValue: null,
    adminResponse: null,
    createdAt: now,
    updatedAt: now,
    history: [{ status: REQUEST_STATUS.PENDING, at: now }],
  });
}

function transition(request, status, changes = {}) {
  const at = new Date().toISOString();
  return {
    ...changes,
    status,
    history: [...(request.history || []), { status, at }],
  };
}

export function sendQuote(request, quotedValue, description) {
  assertStatus(request, [REQUEST_STATUS.PENDING], 'Somente solicitações pendentes podem receber orçamento.');
  const numericValue = Number(String(quotedValue).replace(',', '.'));
  if (!Number.isFinite(numericValue) || numericValue <= 0) throw new Error('Informe um valor válido.');
  if (description.trim().length < 15) {
    throw new Error('Descreva detalhadamente o serviço (mínimo de 15 caracteres).');
  }
  return transition(request, REQUEST_STATUS.QUOTED, {
    quotedValue: numericValue,
    adminResponse: description.trim(),
  });
}

export function acceptQuote(request, paymentMethod) {
  assertStatus(request, [REQUEST_STATUS.QUOTED], 'Este orçamento não está disponível para aceite.');
  if (!paymentMethod) throw new Error('Selecione uma forma de pagamento.');
  return transition(request, REQUEST_STATUS.QUOTE_ACCEPTED, {
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cash' ? PAYMENT_STATUS.PAY_ON_SERVICE : PAYMENT_STATUS.PENDING,
      registeredAt: new Date().toISOString(),
    },
  });
}

export function rejectQuote(request) {
  assertStatus(request, [REQUEST_STATUS.QUOTED], 'Este orçamento não está disponível para recusa.');
  return transition(request, REQUEST_STATUS.QUOTE_REJECTED);
}

export function rejectRequest(request) {
  assertStatus(request, [REQUEST_STATUS.PENDING], 'Esta solicitação não pode ser recusada.');
  return transition(request, REQUEST_STATUS.QUOTE_REJECTED);
}

export function confirmRequest(request) {
  assertStatus(
    request,
    [REQUEST_STATUS.QUOTE_ACCEPTED],
    'O cliente precisa aceitar o orçamento antes da confirmação.',
  );
  return transition(request, REQUEST_STATUS.CONFIRMED);
}

export function startRequest(request) {
  assertStatus(request, [REQUEST_STATUS.CONFIRMED], 'Somente serviços confirmados podem ser iniciados.');
  return transition(request, REQUEST_STATUS.IN_PROGRESS);
}

export function cancelRequest(request) {
  assertStatus(
    request,
    [REQUEST_STATUS.PENDING, REQUEST_STATUS.QUOTED, REQUEST_STATUS.QUOTE_ACCEPTED, REQUEST_STATUS.CONFIRMED],
    'Esta solicitação não pode mais ser cancelada.',
  );
  if (new Date(request.scheduledDate).getTime() - Date.now() < FOUR_HOURS_MS) {
    throw new Error('O cancelamento só é permitido com no mínimo 4 horas de antecedência.');
  }
  return transition(request, REQUEST_STATUS.CANCELLED, { cancelledAt: new Date().toISOString() });
}

export function completeRequest(request, completionPhotos) {
  assertStatus(
    request,
    [REQUEST_STATUS.CONFIRMED, REQUEST_STATUS.IN_PROGRESS],
    'Somente serviços confirmados ou em andamento podem ser concluídos.',
  );
  if (!completionPhotos?.length) throw new Error('Anexe ao menos uma evidência antes de concluir.');
  const payment = request.payment?.method === 'cash'
    ? { ...request.payment, status: PAYMENT_STATUS.PAID, paidAt: new Date().toISOString() }
    : request.payment;
  return transition(request, REQUEST_STATUS.COMPLETED, {
    completionPhotos,
    completedAt: new Date().toISOString(),
    payment,
  });
}

export function rateRequest(request, score, comment) {
  assertStatus(request, [REQUEST_STATUS.COMPLETED], 'Este serviço não está disponível para avaliação.');
  if (request.rating) throw new Error('Este serviço já foi avaliado.');
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Selecione uma nota de 1 a 5.');
  if (!comment.trim()) throw new Error('Escreva um comentário sobre o serviço.');
  return transition(request, REQUEST_STATUS.RATED, {
    rating: {
      score,
      comment: comment.trim(),
      providerId: request.providerId,
      createdAt: new Date().toISOString(),
    },
  });
}

export function markPaymentPaid(request) {
  if (!request.payment) throw new Error('Nenhuma forma de pagamento foi registrada.');
  return {
    payment: { ...request.payment, status: PAYMENT_STATUS.PAID, paidAt: new Date().toISOString() },
  };
}
