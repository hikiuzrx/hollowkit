import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '@hollowkit/constants';
import { CreateUserDto, UpdateUserDto, ListUsersQueryDto } from './dto';

@Injectable()
export class UserService {
  constructor(@Inject(SERVICES.USER_SERVICE) private client: ClientProxy) {}

  async createUser(createUserDto: CreateUserDto) {
    return firstValueFrom(this.client.send('createUser', createUserDto));
  }

  async getUser(id: string) {
    return firstValueFrom(this.client.send('getUser', { id }));
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    return firstValueFrom(this.client.send('updateUser', { id, ...updateUserDto }));
  }

  async deleteUser(id: string) {
    return firstValueFrom(this.client.send('deleteUser', { id }));
  }

  async listUsers(query: ListUsersQueryDto) {
    return firstValueFrom(this.client.send('listUsers', query));
  }

  async getUserByEmail(email: string) {
    return firstValueFrom(this.client.send('getUserByEmail', { email }));
  }
}
