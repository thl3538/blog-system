import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.interface';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private nextId = 1;

  findAll(): Post[] {
    return [...this.posts].sort((a, b) => b.id - a.id);
  }

  findOne(id: number): Post {
    const post = this.posts.find((item) => item.id === id);
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return post;
  }

  create(dto: CreatePostDto): Post {
    const now = new Date().toISOString();
    const post: Post = {
      id: this.nextId++,
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      createdAt: now,
      updatedAt: now,
    };

    this.posts.push(post);
    return post;
  }

  update(id: number, dto: UpdatePostDto): Post {
    const post = this.findOne(id);

    if (dto.title !== undefined) {
      post.title = dto.title;
    }

    if (dto.summary !== undefined) {
      post.summary = dto.summary;
    }

    if (dto.content !== undefined) {
      post.content = dto.content;
    }

    post.updatedAt = new Date().toISOString();
    return post;
  }

  remove(id: number): { message: string } {
    const index = this.posts.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    this.posts.splice(index, 1);
    return { message: `Post ${id} deleted` };
  }
}
