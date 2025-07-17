import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: any) {
    return this.userService.create(data);
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(data: { id: string }) {
    return this.userService.findOne(data.id);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: any) {
    const { id, ...updateData } = data;
    return this.userService.update(id, updateData);
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(data: { id: string }) {
    return this.userService.remove(data.id);
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(data: any) {
    return this.userService.findAll(data);
  }

  @GrpcMethod('UserService', 'GetUserByEmail')
  async getUserByEmail(data: { email: string }) {
    return this.userService.findByEmail(data.email);
  }
}
