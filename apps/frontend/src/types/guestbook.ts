export type GuestbookMessage = {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
};

export type CreateGuestbookMessagePayload = {
  nickname: string;
  content: string;
};
