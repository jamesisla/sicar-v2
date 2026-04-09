import { Injectable, ConflictException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto } from './dto/cliente.dto';

@Injectable()
export class ClientesRepository {
  constructor(private oracle: OracleService) {}

  async findAll(filters: { rut?: number; nombre?: string; page?: number; pageSize?: number }) {
    const { rut, nombre, page = 1, pageSize = 20 } = filters;
    const conditions: string[] = [];
    const binds: any = {};

    if (rut) { conditions.push('C.CLRUT = :rut'); binds.rut = rut; }
    if (nombre) { conditions.push('UPPER(C.CLNOMBRE) LIKE UPPER(:nombre)'); binds.nombre = `%${nombre}%`; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const sql = `
      SELECT C.IDCLIENTE, C.CLRUT, C.CLDV, C.CLNOMBRE, C.CLFONOCONTACTO,
             C.CLMAILCONTACTO, C.TIPOCLIENTE_IDTIPOCLIENTE, TC.TCDESCRIPCION
      FROM CLIENTE C
      JOIN TIPOCLIENTE TC ON TC.IDTIPOCLIENTE = C.TIPOCLIENTE_IDTIPOCLIENTE
      ${where}
      ORDER BY C.CLNOMBRE
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`;

    binds.offset = offset;
    binds.pageSize = pageSize;
    return this.oracle.executeQuery(sql, binds);
  }

  async findById(id: number) {
    const result = await this.oracle.executeQuery(
      `SELECT C.*, TC.TCDESCRIPCION AS TIPOCLIENTE_DESC
       FROM CLIENTE C
       JOIN TIPOCLIENTE TC ON TC.IDTIPOCLIENTE = C.TIPOCLIENTE_IDTIPOCLIENTE
       WHERE C.IDCLIENTE = :id`,
      { id },
    );
    return result.rows[0];
  }

  async findByRut(rut: number) {
    const result = await this.oracle.executeQuery(
      'SELECT IDCLIENTE FROM CLIENTE WHERE CLRUT = :rut',
      { rut },
    );
    return result.rows[0];
  }

  async createPersonaNatural(dto: CreatePersonaNaturalDto, userId: number) {
    const existing = await this.findByRut(dto.rut);
    if (existing) throw new ConflictException('El RUT ingresado ya está registrado');

    // Insert CLIENTE (tipo 1 = persona natural)
    const clienteResult = await this.oracle.executeQuery(
      `INSERT INTO CLIENTE (TIPOCLIENTE_IDTIPOCLIENTE, CLNOMBRE, CLRUT, CLDV,
        CLFONOCONTACTO, CLMAILCONTACTO, CLINGRESOMES, CLFCHACTUALIZADA, CLUSUARIOACTUALIZA)
       VALUES (1, :nombre, :rut, :dv, :telefono, :email, :rentaMensual, SYSDATE, :userId)
       RETURNING IDCLIENTE INTO :id`,
      {
        nombre: `${dto.nombre} ${dto.apellidoPaterno} ${dto.apellidoMaterno || ''}`.trim(),
        rut: dto.rut, dv: dto.dv, telefono: dto.telefono || null,
        email: dto.email || null, rentaMensual: dto.rentaMensual || null,
        userId,
        id: { dir: 3003, type: 2010 }, // OUT bind
      },
    );

    const idCliente = (clienteResult.rows[0] as any)?.ID;

    // Insert PERSONA
    await this.oracle.executeQuery(
      `INSERT INTO PERSONA (CLIENTE_IDCLIENTE, PERUT, PEDV, PENOMBRE,
        PEAPELLIDOPATERNO, PEAPELLIDOMATERNO, PEPROFESION, PEEMAIL,
        SEXO_IDSEXO, NACIONALIDAD_IDNACIONALIDAD, ESTADOPRODUCTO_CIVIL_IDESTADO,
        PEFCHACTUALIZA, PEUSUARIOACTUALIZA)
       VALUES (:idCliente, :rut, :dv, :nombre, :apellidoPaterno, :apellidoMaterno,
               :profesion, :email, :sexo, :nacionalidad, :estadoCivil, SYSDATE, :userId)`,
      {
        idCliente, rut: dto.rut, dv: dto.dv, nombre: dto.nombre,
        apellidoPaterno: dto.apellidoPaterno, apellidoMaterno: dto.apellidoMaterno || null,
        profesion: dto.profesion || null, email: dto.email || null,
        sexo: dto.sexo || null, nacionalidad: dto.nacionalidad || null,
        estadoCivil: dto.estadoCivil || null, userId,
      },
    );

    return { idCliente };
  }

  async createPersonaJuridica(dto: CreatePersonaJuridicaDto, userId: number) {
    const existing = await this.findByRut(dto.rut);
    if (existing) throw new ConflictException('El RUT ingresado ya está registrado');

    const clienteResult = await this.oracle.executeQuery(
      `INSERT INTO CLIENTE (TIPOCLIENTE_IDTIPOCLIENTE, CLNOMBRE, CLRUT, CLDV,
        CLFCHACTUALIZADA, CLUSUARIOACTUALIZA)
       VALUES (2, :razonSocial, :rut, :dv, SYSDATE, :userId)
       RETURNING IDCLIENTE INTO :id`,
      {
        razonSocial: dto.razonSocial, rut: dto.rut, dv: dto.dv, userId,
        id: { dir: 3003, type: 2010 },
      },
    );

    const idCliente = (clienteResult.rows[0] as any)?.ID;

    await this.oracle.executeQuery(
      `INSERT INTO EMPRESA (CLIENTE_IDCLIENTE, EMRAZONSOCIAL, EMGIRO,
        EMRUTREPLEGAL, EMDVREPLEGAL, EMNOMBREREPLEGAL,
        EMAPELLIDOPATERNOREP, EMAPELLIDOMATERNOREP)
       VALUES (:idCliente, :razonSocial, :giro, :repRut, :repDv,
               :repNombre, :repApellidoPaterno, :repApellidoMaterno)`,
      {
        idCliente, razonSocial: dto.razonSocial, giro: dto.giro || null,
        repRut: dto.repLegalRut, repDv: dto.repLegalDv,
        repNombre: dto.repLegalNombre, repApellidoPaterno: dto.repLegalApellidoPaterno,
        repApellidoMaterno: dto.repLegalApellidoMaterno || null,
      },
    );

    return { idCliente };
  }

  async addDomicilio(clienteId: number, dto: AddDomicilioDto) {
    return this.oracle.executeQuery(
      `INSERT INTO DOMICILIO (CLIENTE_IDCLIENTE, COMUNA_IDCOMUNA, DOMCALLE,
        DOMBLOCK, DOMDEPTOOFICINA, DOMVILLALOCALIDAD, DOMFCHCREACION)
       VALUES (:clienteId, :comunaId, :calle, :block, :deptoOficina, :villaLocalidad, SYSDATE)`,
      {
        clienteId, comunaId: dto.comunaId, calle: dto.calle,
        block: dto.block || null, deptoOficina: dto.deptoOficina || null,
        villaLocalidad: dto.villaLocalidad || null,
      },
    );
  }

  async addContacto(clienteId: number, dto: AddContactoDto) {
    return this.oracle.executeQuery(
      `INSERT INTO CONTACTO (CLIENTE_IDCLIENTE, CONOMBRE, COCARGORELACION,
        COMAIL, CONUMEROFIJO, CONUMEROMOVIL)
       VALUES (:clienteId, :nombre, :cargoRelacion, :email, :numeroFijo, :numeroMovil)`,
      {
        clienteId, nombre: dto.nombre, cargoRelacion: dto.cargoRelacion || null,
        email: dto.email || null, numeroFijo: dto.numeroFijo || null,
        numeroMovil: dto.numeroMovil || null,
      },
    );
  }
}
