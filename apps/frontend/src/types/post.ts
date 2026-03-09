export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PostItem = {
  id: number;
  title: string;
  summary: string;
  content: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
};

export type PostListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: 'createdAt' | 'title';
  order?: 'asc' | 'desc';
  status?: PostStatus;
};

export type PostListResponse = {
  items: PostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: 'createdAt' | 'title';
  order: 'asc' | 'desc';
  status?: PostStatus;
};

export type PostPayload = {
  title: string;
  summary: string;
  content: string;
  status: PostStatus;
};

export type LikeState = {
  count: number;
  liked: boolean;
};

export type PostComment = {
  id: number;
  postId: number;
  nickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentPayload = {
  nickname?: string;
  content: string;
};
