const VISITOR_KEY = 'blog-system-visitor-id';

const createVisitorId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  return `visitor_${Date.now()}_${random}`;
};

export const getVisitorId = () => {
  if (typeof window === 'undefined') return 'server_visitor';

  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const id = createVisitorId();
  window.localStorage.setItem(VISITOR_KEY, id);
  return id;
};
