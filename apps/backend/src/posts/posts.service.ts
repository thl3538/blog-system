import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.post.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return post;
  }

  create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
      },
    });
  }

  async update(id: number, dto: UpdatePostDto) {
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
          ...(dto.content !== undefined ? { content: dto.content } : {}),
        },
      });
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
}
