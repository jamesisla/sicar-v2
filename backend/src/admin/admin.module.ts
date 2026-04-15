import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../common/database/entities/usuario.entity';
import { Perfil } from '../common/database/entities/perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Perfil])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
