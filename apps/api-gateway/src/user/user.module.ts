import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SERVICES, GRPC_PORTS } from '@hollowkit/constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.USER_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../../libs/proto/user.proto'),
          url: `localhost:${GRPC_PORTS.USER_SERVICE}`,
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
