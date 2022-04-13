import { Injectable } from '@nestjs/common';
import { PrismaService } from '@graduates/api/shared/services/prisma/data-access';
import {
  ShortCreateInput,
  ShortCreateTagInput,
} from '@graduates/api/shorts/api/shared/entities/data-access';
import { Short, ShortTag, User } from '@prisma/client';
import { ShortUpdateInput } from '@graduates/api/shorts/api/shared/entities/data-access';

@Injectable()
export class ShortsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all shorts from database
   * @return {Promise<Short[]>}
   */
  async findAll(): Promise<Short[]> {
    return this.prisma.short.findMany();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  /**
   * Find a short by id
   * @param {string} id The id of the short to find
   * @return {Promise<Short | null>}
   */
  async findById(id: string): Promise<Short | null> {
    return this.prisma.short.findUnique({ where: { id: id } });
  }

  /**
   * Find all shorts by user id
   * @param {string} userId The id of the user to find the shorts for
   * @return {Promise<Short[]>}
   */
  async findByUser(userId: string): Promise<Short[]> {
    // return this.prisma.short.findMany({
    //   where: {
    //     user: { id: userId },
    //   },
    // });
    return [];
  }

  /**
   * Find all shorts by tag
   * @param {string} tagId The id of the tag to find the shorts for
   * @return {Promise<Short[]>}
   */
  async findByTag(tagId: string): Promise<Short[]> {
    // return this.prisma.short.findMany({
    //   where: {
    //     shortTag: {
    //       some: {
    //         tag: tagId,
    //       },
    //     },
    //   },
    // });
    return [];
  }

  /**
   * Create a new short
   * @param {Short} short The short to create
   * @param {string} userId The id of the user to create the short for
   * @return {Promise<Short | null>}
   */
  async createShort(short: ShortCreateInput, userId: string): Promise<Short> {
    const res = await this.prisma.short.create({
      data: {
        media: short.media,
        data: short.data,
        archived: short.archived,
        user: {
          connect: { id: userId },
        },
        shortTag: {
          createMany: {
            data: short.shortTag,
          },
        },
        datePosted: new Date(),
      },
    });

    return res;
  }

  async updateShort(short: ShortUpdateInput): Promise<Short | null> {
    return this.prisma.short.update({
      where: { id: short.id },
      data: {
        media: short.media,
        data: short.data,
        archived: short.archived,
      },
    });
  }

  async deleteShort(id: string): Promise<Short | null> {
    const deleteTags = this.prisma.shortTag.deleteMany({
      where: {
        shortId: id,
      },
    });

    const deleteShort = this.prisma.short.delete({
      where: {
        id: id,
      },
    });

    await this.prisma.$transaction([deleteTags, deleteShort]);

    return deleteShort;
  }

  async findAllTags(): Promise<ShortTag[]> {
    return this.prisma.shortTag.findMany();
  }

  /**
   * Find a tag by id
   * @param {string} id The id of the short to find
   * @return {Promise<ShortTag[]>}
   */
  async findTagByShortId(id: string): Promise<ShortTag[]> {
    return this.prisma.shortTag.findMany({ where: { shortId: id } });
  }

  async createTag(tag: ShortCreateTagInput): Promise<ShortTag | null> {
    return this.prisma.shortTag.create({
      data: {
        tag: tag.tag,
        short: {
          connect: { id: tag.shortId },
        },
      },
    });
  }

  async updateTags(tag: string, newTag: string): Promise<string> {
    const res = await this.prisma.shortTag.updateMany({
      where: {
        tag: tag,
      },
      data: {
        tag: newTag,
      },
    });

    if (res.count > 0) {
      return 'success';
    } else {
      return 'No tags updated';
    }
  }

  async updateTagByShort(
    shortId: string,
    tag: string,
    newTag: string
  ): Promise<string> {
    const res = await this.prisma.shortTag.updateMany({
      where: {
        AND: {
          shortId: shortId,
          tag: tag,
        },
      },
      data: {
        tag: newTag,
      },
    });

    if (res.count > 0) {
      return 'success';
    } else {
      return 'Tag not found';
    }
  }

  async deleteTags(tag: string): Promise<string> {
    const res = await this.prisma.shortTag.deleteMany({
      where: {
        tag: tag,
      },
    });

    if (res.count > 0) {
      return 'success';
    } else {
      return 'No tags deleted';
    }
  }

  async deleteTagsByShortId(shortId: string): Promise<string> {
    const res = await this.prisma.shortTag.deleteMany({
      where: {
        shortId: shortId,
      },
    });

    if (res.count > 0) {
      return 'success';
    } else {
      return 'No tags deleted';
    }
  }

  async deleteTagByShortTag(shortId: string, tag: string): Promise<string> {
    const res = await this.prisma.shortTag.deleteMany({
      where: {
        AND: {
          shortId: shortId,
          tag: tag,
        },
      },
    });

    if (res.count > 0) {
      return 'success';
    } else {
      return 'Tag not found';
    }
  }
}
