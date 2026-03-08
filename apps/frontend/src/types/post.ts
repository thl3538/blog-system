export type PostItem = {
  id: number;
  title: string;
  summary: string;
  content: string;
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
};

export type PostListResponse = {
  items: PostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: 'createdAt' | 'title';
  order: 'asc' | 'desc';
};

export type PostPayload = {
  title: string;
  summary: string;
  content: string;
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
  nickname: string;
  content: string;
};
