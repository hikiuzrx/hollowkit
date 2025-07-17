import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userData: any) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password, ...userResponse } = user;

      return {
        user: {
          ...userResponse,
          createdAt: userResponse.createdAt.toISOString(),
          updatedAt: userResponse.updatedAt.toISOString(),
        },
        message: 'User created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userResponse } = user;

    return {
      user: {
        ...userResponse,
        createdAt: userResponse.createdAt.toISOString(),
        updatedAt: userResponse.updatedAt.toISOString(),
      },
      message: 'User found',
    };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userResponse } = user;

    return {
      user: {
        ...userResponse,
        createdAt: userResponse.createdAt.toISOString(),
        updatedAt: userResponse.updatedAt.toISOString(),
      },
      message: 'User found',
    };
  }

  async update(id: string, updateData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...userResponse } = updatedUser;

    return {
      user: {
        ...userResponse,
        createdAt: userResponse.createdAt.toISOString(),
        updatedAt: userResponse.updatedAt.toISOString(),
      },
      message: 'User updated successfully',
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    };
  }
}
