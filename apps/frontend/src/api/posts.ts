import { request } from '../lib/http';
import type {
  CreateCommentPayload,
  LikeState,
  PostComment,
  PostItem,
  PostListQuery,
  PostListResponse,
  PostPayload,
} from '../types/post';

const buildQuery = (query: PostListQuery) => {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.keyword?.trim()) params.set('keyword', query.keyword.trim());
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order);

  return params.toString();
};

export const postsApi = {
  list(query: PostListQuery) {
    const search = buildQuery(query);
    return request<PostListResponse>({
      url: search ? `/posts?${search}` : '/posts',
      method: 'GET',
    });
  },

  getById(id: number) {
    return request<PostItem>({
      url: `/posts/${id}`,
      method: 'GET',
    });
  },

  create(payload: PostPayload) {
    return request<PostItem>({
      url: '/posts',
      method: 'POST',
      data: payload,
    });
  },

  update(id: number, payload: Partial<PostPayload>) {
    return request<PostItem>({
      url: `/posts/${id}`,
      method: 'PATCH',
      data: payload,
    });
  },

  remove(id: number) {
    return request<{ message: string }>({
      url: `/posts/${id}`,
      method: 'DELETE',
    });
  },

  getLikeState(id: number, visitorId: string) {
    return request<LikeState>({
      url: `/posts/${id}/likes?visitorId=${encodeURIComponent(visitorId)}`,
      method: 'GET',
    });
  },

  like(id: number, visitorId: string) {
    return request<LikeState>({
      url: `/posts/${id}/likes`,
      method: 'POST',
      data: { visitorId },
    });
  },

  unlike(id: number, visitorId: string) {
    return request<LikeState>({
      url: `/posts/${id}/likes`,
      method: 'DELETE',
      data: { visitorId },
    });
  },

  listComments(id: number) {
    return request<PostComment[]>({
      url: `/posts/${id}/comments`,
      method: 'GET',
    });
  },

  addComment(id: number, payload: CreateCommentPayload) {
    return request<PostComment>({
      url: `/posts/${id}/comments`,
      method: 'POST',
      data: payload,
    });
  },
};
