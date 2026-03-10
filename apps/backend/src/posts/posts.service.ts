import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { FindPostsDto } from './dto/find-posts.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizePost(
    post: Prisma.PostGetPayload<{
      include: { _count: { select: { likes: true; comments: true } } };
    }>,
  ) {
    return {
      id: post.id,
      title: post.title,
      summary: post.summary,
      content: post.content,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    };
  }

  async findAll(query: FindPostsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';
    const status = query.status;

    const where: Prisma.PostWhereInput = {
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { summary: { contains: keyword } },
              { content: { contains: keyword } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((item) => this.normalizePost(item)),
      total,
      page,
      pageSize,
      sortBy,
      order,
      status,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return this.normalizePost(post);
  }

  async create(dto: CreatePostDto) {
    const status = dto.status ?? PostStatus.PUBLISHED;

    const created = await this.prisma.post.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        status,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return this.normalizePost(created);
  }

  async update(id: number, dto: UpdatePostDto) {
    const current = await this.prisma.post.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    const nextStatus = dto.status ?? current.status;

    const nextPublishedAt =
      nextStatus === PostStatus.PUBLISHED
        ? (current.publishedAt ?? new Date())
        : null;

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.status !== undefined ? { publishedAt: nextPublishedAt } : {}),
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return this.normalizePost(updated);
  }

  async remove(id: number) {
    try {
      await this.prisma.post.delete({ where: { id } });
      return { message: `Post ${id} deleted` };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post ${id} not found`);
      }

      throw error;
    }
  }

  async getLikeState(postId: number, visitorId?: string) {
    await this.ensurePostExists(postId);

    const count = await this.prisma.postLike.count({ where: { postId } });
    const liked = visitorId
      ? await this.prisma.postLike.findUnique({
          where: {
            postId_visitorId: {
              postId,
              visitorId,
            },
          },
        })
      : null;

    return {
      count,
      liked: Boolean(liked),
    };
  }

  async like(postId: number, dto: ToggleLikeDto) {
    await this.ensurePostExists(postId);

    const visitorId = dto.visitorId.trim();

    await this.prisma.postLike.upsert({
      where: {
        postId_visitorId: {
          postId,
          visitorId,
        },
      },
      create: {
        postId,
        visitorId,
      },
      update: {},
    });

    return this.getLikeState(postId, visitorId);
  }

  async unlike(postId: number, dto: ToggleLikeDto) {
    await this.ensurePostExists(postId);
    const visitorId = dto.visitorId.trim();

    await this.prisma.postLike.deleteMany({
      where: {
        postId,
        visitorId,
      },
    });

    return this.getLikeState(postId, visitorId);
  }

  async listComments(postId: number) {
    await this.ensurePostExists(postId);

    return this.prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async addComment(postId: number, dto: CreateCommentDto, userId?: number) {
    await this.ensurePostExists(postId);

    let nickname = '匿名用户';

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (user) {
        nickname = user.name?.trim() || user.email.split('@')[0] || nickname;
      }
    }

    return this.prisma.postComment.create({
      data: {
        postId,
        nickname,
        content: dto.content.trim(),
      },
    });
  }

  private async ensurePostExists(postId: number) {
    const exists = await this.prisma.post.count({ where: { id: postId } });
    if (!exists) {
      throw new NotFoundException(`Post ${postId} not found`);
    }
  }
}
