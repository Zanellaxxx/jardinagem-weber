import Colors from './colors';

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  QUOTED: 'quoted',
  QUOTE_ACCEPTED: 'quote_accepted',
  QUOTE_REJECTED: 'quote_rejected',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  RATED: 'rated',
});

const STATUS_CONFIG = Object.freeze({
  [REQUEST_STATUS.PENDING]: {
    label: 'Aguardando orçamento',
    color: '#9A6700',
    bg: '#FFF8E1',
    icon: '...',
  },
  [REQUEST_STATUS.QUOTED]: {
    label: 'Orçamento recebido',
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: '$',
  },
  [REQUEST_STATUS.QUOTE_ACCEPTED]: {
    label: 'Orçamento aceito',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'OK',
  },
  [REQUEST_STATUS.QUOTE_REJECTED]: {
    label: 'Orçamento recusado',
    color: Colors.error,
    bg: '#FFEBEE',
    icon: 'X',
  },
  [REQUEST_STATUS.CONFIRMED]: {
    label: 'Confirmado/agendado',
    color: Colors.success,
    bg: '#E8F5E9',
    icon: 'OK',
  },
  [REQUEST_STATUS.IN_PROGRESS]: {
    label: 'Em andamento',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    icon: '>',
  },
  [REQUEST_STATUS.CANCELLED]: {
    label: 'Cancelado',
    color: Colors.error,
    bg: '#FFEBEE',
    icon: 'X',
  },
  [REQUEST_STATUS.COMPLETED]: {
    label: 'Concluído',
    color: '#00695C',
    bg: '#E0F2F1',
    icon: 'OK',
  },
  [REQUEST_STATUS.RATED]: {
    label: 'Avaliado',
    color: '#EF6C00',
    bg: '#FFF3E0',
    icon: '*',
  },
});

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[REQUEST_STATUS.PENDING];
}
