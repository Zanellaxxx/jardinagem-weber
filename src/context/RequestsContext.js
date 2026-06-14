import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { providerRepository } from '../repositories/providerRepository';
import { requestRepository } from '../repositories/requestRepository';
import { APP_EVENTS, eventService } from '../services/eventService';
import { useAuth } from './AuthContext';
import {
  acceptQuote,
  cancelRequest,
  completeRequest,
  confirmRequest,
  createRequest,
  markPaymentPaid,
  normalizeRequest,
  rateRequest,
  rejectRequest,
  rejectQuote,
  sendQuote,
  startRequest,
} from '../services/requestService';

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    requestRepository.getAll().then((stored) => setRequests(stored.map(normalizeRequest)));
    return eventService.subscribe(APP_EVENTS.REQUESTS_CHANGED, (updated) => {
      setRequests(updated.map(normalizeRequest));
    });
  }, []);

  const addRequest = useCallback(async (requestData) => {
    if (!user || user.isAdmin) throw new Error('Apenas clientes podem criar solicitações.');
    const provider = requestData.providerId
      ? await providerRepository.findById(requestData.providerId)
      : await providerRepository.getDefault();
    if (!provider?.active) throw new Error('Selecione um prestador disponível.');
    const newRequest = createRequest({
      ...requestData,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      providerId: provider.id,
      providerName: provider.name,
    });
    await requestRepository.add(newRequest);
    return newRequest;
  }, [user]);

  const updateRequest = useCallback(async (id, changes) => {
    await requestRepository.update(id, changes);
  }, []);

  const runAuthorizedAction = useCallback(async (id, authorize, action, ...args) => {
    const current = (await requestRepository.getAll()).map(normalizeRequest);
    const request = current.find((item) => item.id === id);
    if (!request) throw new Error('Solicitação não encontrada.');
    if (!authorize(request)) throw new Error('Você não tem permissão para alterar esta solicitação.');
    await updateRequest(id, action(request, ...args));
  }, [updateRequest]);

  const runAdminAction = useCallback(
    (id, action, ...args) => runAuthorizedAction(
      id,
      (request) => Boolean(user?.isAdmin && request.providerId === user.providerId),
      action,
      ...args,
    ),
    [runAuthorizedAction, user],
  );

  const runClientAction = useCallback(
    (id, action, ...args) => runAuthorizedAction(
      id,
      (request) => Boolean(user && !user.isAdmin && request.userEmail === user.email),
      action,
      ...args,
    ),
    [runAuthorizedAction, user],
  );

  const value = useMemo(() => ({
    requests,
    addRequest,
    sendQuote: (id, value, description) => runAdminAction(id, sendQuote, value, description),
    acceptQuote: (id, paymentMethod) => runClientAction(id, acceptQuote, paymentMethod),
    rejectQuote: (id) => runClientAction(id, rejectQuote),
    rejectRequest: (id) => runAdminAction(id, rejectRequest),
    confirmRequest: (id) => runAdminAction(id, confirmRequest),
    startRequest: (id) => runAdminAction(id, startRequest),
    cancelRequest: (id) => runClientAction(id, cancelRequest),
    completeRequest: (id, photos) => runAdminAction(id, completeRequest, photos),
    rateRequest: (id, score, comment) => runClientAction(id, rateRequest, score, comment),
    markPaymentPaid: (id) => runAdminAction(id, markPaymentPaid),
  }), [requests, addRequest, runAdminAction, runClientAction]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (!context) throw new Error('useRequests deve ser usado dentro de RequestsProvider');
  return context;
}
