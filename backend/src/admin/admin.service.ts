import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../common/database/entities/usuario.entity';
import { Perfil } from '../common/database/entities/perfil.entity';
import { validarRut } from '../common/validators/rut.validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Perfil) private perfilRepo: Repository<Perfil>,
  ) {}

  getUsuarios() {
    return this.usuarioRepo.find({ relations: ['perfil'], order: { nombre: 'ASC' } });
  }

  async createUsuario(dto: any) {
    if (!validarRut(dto.rut, dto.dv)) {
      throw new Error('El dígito verificador del RUT es incorrecto');
    }
    const existing = await this.usuarioRepo.findOne({ where: { login: dto.login } });
    if (existing) throw new ConflictException('El login ingresado ya está en uso');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usuarioRepo.save({
      perfilId: dto.perfilId, nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno, apellidoMaterno: dto.apellidoMaterno,
      rut: dto.rut, dv: dto.dv, regionId: dto.region,
      estado: 1, login: dto.login, password: hashedPassword, correo: dto.correo,
    });
  }

  async desactivarUsuario(id: number) {
    await this.usuarioRepo.update(id, { estado: 0, token: null });
    return { success: true };
  }

  getPerfiles() { return this.perfilRepo.find({ order: { id: 'ASC' } }); }

  getOpciones() { return []; }

  getPermisos(_perfilId: number) { return []; }

  getUnidadesSigfe() { return []; }

  getCuentasSigfe() { return []; }

  getSeremi() { return []; }
}
