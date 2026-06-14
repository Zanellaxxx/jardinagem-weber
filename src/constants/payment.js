export const PAYMENT_METHODS = Object.freeze([
  { id: 'pix', label: 'Pix' },
  { id: 'credit_card', label: 'Cartão de crédito' },
  { id: 'debit_card', label: 'Cartão de débito' },
  { id: 'cash', label: 'Dinheiro' },
]);

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAY_ON_SERVICE: 'pay_on_service',
  PAID: 'paid',
});

export const PAYMENT_STATUS_LABELS = Object.freeze({
  [PAYMENT_STATUS.PENDING]: 'Pendente',
  [PAYMENT_STATUS.PAY_ON_SERVICE]: 'Pagamento na execução',
  [PAYMENT_STATUS.PAID]: 'Pago',
});

export function getPaymentMethodLabel(method) {
  return PAYMENT_METHODS.find((item) => item.id === method)?.label || 'Não informado';
}

