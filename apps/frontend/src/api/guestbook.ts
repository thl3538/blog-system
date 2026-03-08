import { request } from '../lib/http';
import type {
  CreateGuestbookMessagePayload,
  GuestbookMessage,
} from '../types/guestbook';

export const guestbookApi = {
  list() {
    return request<GuestbookMessage[]>({
      url: '/guestbook/messages',
      method: 'GET',
    });
  },

  create(payload: CreateGuestbookMessagePayload) {
    return request<GuestbookMessage>({
      url: '/guestbook/messages',
      method: 'POST',
      data: payload,
    });
  },
};
