import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../auth/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { FindPostsDto } from './dto/find-posts.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query: FindPostsDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Get(':id/likes')
  getLikeState(
    @Param('id', ParseIntPipe) id: number,
    @Query('visitorId') visitorId?: string,
  ) {
    return this.postsService.getLikeState(id, visitorId);
  }

  @Post(':id/likes')
  like(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleLikeDto) {
    return this.postsService.like(id, dto);
  }

  @Delete(':id/likes')
  unlike(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleLikeDto) {
    return this.postsService.unlike(id, dto);
  }

  @Get(':id/comments')
  listComments(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.listComments(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
