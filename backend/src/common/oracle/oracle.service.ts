import { Injectable, OnModuleInit, OnModuleDestroy, ServiceUnavailableException, UnprocessableEntityException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oracledb from 'oracledb';

export interface BindParams {
  [key: string]: oracledb.BindParameter | any;
}

export interface QueryResult<T = any> {
  rows: T[];
  metaData?: oracledb.Metadata<T>[];
}

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool;
  private readonly logger = new Logger(OracleService.name);

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      oracledb.autoCommit = true;
      this.pool = await oracledb.createPool({
        user: this.config.get('ORACLE_USER'),
        password: this.config.get('ORACLE_PASSWORD'),
        connectString: this.config.get('ORACLE_CONNECTION_STRING'),
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
      });
      this.logger.log('Oracle connection pool created');
    } catch (err) {
      this.logger.error('Failed to create Oracle pool', err);
      throw new ServiceUnavailableException('Servicio de base de datos no disponible');
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.close(0);
  }

  async executeQuery<T = any>(sql: string, binds: BindParams = {}): Promise<QueryResult<T>> {
    let conn: oracledb.Connection;
    try {
      conn = await this.pool.getConnection();
      const result = await conn.execute<T>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return { rows: (result.rows as T[]) || [], metaData: result.metaData };
    } catch (err) {
      this.logger.error({ sql: sql.substring(0, 100), error: err.message });
      if (err.errorNum) {
        throw new ServiceUnavailableException('Servicio de base de datos no disponible');
      }
      throw err;
    } finally {
      if (conn) await conn.close();
    }
  }

  async executeStoredProcedure(name: string, binds: BindParams = {}): Promise<any> {
    let conn: oracledb.Connection;
    const paramNames = Object.keys(binds).map(k => `:${k}`).join(', ');
    const sql = `BEGIN ${name}(${paramNames}); END;`;
    try {
      conn = await this.pool.getConnection();
      const result = await conn.execute(sql, binds);
      const out = result.outBinds as any;
      if (out?.VAR_VALIDA === 0 || out?.var_valida === 0) {
        const msg = out?.VAR_MENSAJE || out?.var_mensaje || 'Error en procedimiento almacenado';
        throw new UnprocessableEntityException(msg);
      }
      return out;
    } catch (err) {
      if (err instanceof UnprocessableEntityException) throw err;
      this.logger.error({ sp: name, error: err.message, errorNum: err.errorNum });
      if (err.errorNum) {
        throw new ServiceUnavailableException('Servicio de base de datos no disponible');
      }
      throw err;
    } finally {
      if (conn) await conn.close();
    }
  }

  async executeTransaction(operations: Array<{ sql: string; binds: BindParams }>): Promise<void> {
    let conn: oracledb.Connection;
    try {
      conn = await this.pool.getConnection();
      await conn.execute('SET TRANSACTION READ WRITE', {});
      for (const op of operations) {
        await conn.execute(op.sql, op.binds);
      }
      await conn.commit();
    } catch (err) {
      if (conn) await conn.rollback();
      this.logger.error({ error: err.message });
      if (err instanceof UnprocessableEntityException) throw err;
      if (err.errorNum) throw new ServiceUnavailableException('Servicio de base de datos no disponible');
      throw err;
    } finally {
      if (conn) await conn.close();
    }
  }
}
