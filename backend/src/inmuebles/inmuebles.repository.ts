import { Injectable } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { CreateInmuebleDto } from './dto/inmueble.dto';

@Injectable()
export class InmueblesRepository {
  constructor(private oracle: OracleService) {}

  async findAll(filters: { region?: number; nombre?: string; rolSii?: string; page?: number; pageSize?: number }) {
    const { region, nombre, rolSii, page = 1, pageSize = 20 } = filters;
    const conditions: string[] = [];
    const binds: any = {};

    if (region) { conditions.push('I.REGION_IDREGION = :region'); binds.region = region; }
    if (nombre) { conditions.push('UPPER(I.INNOMBRECALLE) LIKE UPPER(:nombre)'); binds.nombre = `%${nombre}%`; }
    if (rolSii) { conditions.push('I.INROLSII = :rolSii'); binds.rolSii = rolSii; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    binds.offset = (page - 1) * pageSize;
    binds.pageSize = pageSize;

    return this.oracle.executeQuery(
      `SELECT I.IDINMUEBLE, I.INROLSII, I.INCARPETA, I.INPORCION,
              I.INNOMBRECALLE, I.INNUMEROCALLE, I.INBLOCK,
              R.RENOMBRE AS REGION, C.CONOMBRE AS COMUNA
       FROM INMUEBLE I
       JOIN REGION R ON R.IDREGION = I.REGION_IDREGION
       JOIN COMUNA C ON C.IDCOMUNA = I.COMUNA_IDCOMUNA
       ${where}
       ORDER BY I.INNOMBRECALLE
       OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      binds,
    );
  }

  async findById(id: number) {
    const result = await this.oracle.executeQuery(
      `SELECT I.*, R.RENOMBRE AS REGION_NOMBRE, C.CONOMBRE AS COMUNA_NOMBRE,
              TU.TUNOMBRE AS TIPO_URBANO, TI.TINOMBRE AS TIPO_INMUEBLE
       FROM INMUEBLE I
       JOIN REGION R ON R.IDREGION = I.REGION_IDREGION
       JOIN COMUNA C ON C.IDCOMUNA = I.COMUNA_IDCOMUNA
       JOIN TIPOURBANO TU ON TU.IDTIPOURBANO = I.TIPOURBANO_IDTIPOURBANO
       JOIN TIPOINMUEBLE TI ON TI.IDTIPOINMUEBLE = I.TIPOINMUEBLE_IDTIPOINMUEBLE
       WHERE I.IDINMUEBLE = :id`,
      { id },
    );
    return result.rows[0];
  }

  async create(dto: CreateInmuebleDto, userId: number) {
    return this.oracle.executeQuery(
      `INSERT INTO INMUEBLE (REGION_IDREGION, TIPOURBANO_IDTIPOURBANO, TIPOINMUEBLE_IDTIPOINMUEBLE,
        COMUNA_IDCOMUNA, INROLSII, INCARPETA, INPORCION, INPLANO,
        INSUPERFICIECONSTRUIDA, INSUPERFICIETOTAL, INAVALUOFISCAL, INTASACIONCOMERCIAL,
        INNOMBRECALLE, INNUMEROCALLE, INBLOCK, INDEPTOOFICINA, INVILLALOCALIDAD,
        INCONSERVADOR, INFOJAS, INNUMEROINSCRIPCION, INAGNOINSCRIPCION, IDCATASTRAL,
        INFCHACTUALIZA, INUSUARIOACTUALIZA)
       VALUES (:regionId, :tipoUrbanoId, :tipoInmuebleId, :comunaId,
               :rolSii, :carpeta, :porcion, :plano,
               :superficieConstruida, :superficieTotal, :avaluoFiscal, :tasacionComercial,
               :nombreCalle, :numeroCalle, :block, :deptoOficina, :villaLocalidad,
               :conservador, :fojas, :numeroInscripcion, :agnoInscripcion, :idCatastral,
               SYSDATE, :userId)`,
      {
        regionId: dto.regionId, tipoUrbanoId: dto.tipoUrbanoId,
        tipoInmuebleId: dto.tipoInmuebleId, comunaId: dto.comunaId,
        rolSii: dto.rolSii || null, carpeta: dto.carpeta || null,
        porcion: dto.porcion || null, plano: dto.plano || null,
        superficieConstruida: dto.superficieConstruida || null,
        superficieTotal: dto.superficieTotal || null,
        avaluoFiscal: dto.avaluoFiscal || null,
        tasacionComercial: dto.tasacionComercial || null,
        nombreCalle: dto.nombreCalle, numeroCalle: dto.numeroCalle || null,
        block: dto.block || null, deptoOficina: dto.deptoOficina || null,
        villaLocalidad: dto.villaLocalidad || null,
        conservador: dto.conservador || null, fojas: dto.fojas || null,
        numeroInscripcion: dto.numeroInscripcion || null,
        agnoInscripcion: dto.agnoInscripcion || null,
        idCatastral: dto.idCatastral || null, userId,
      },
    );
  }
}
