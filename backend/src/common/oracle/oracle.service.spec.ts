import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OracleService } from './oracle.service';

// Mock oracledb module — createPool uses a factory to avoid hoisting issues
jest.mock('oracledb', () => ({
  OUT_FORMAT_OBJECT: 4001,
  outFormat: 4001,
  autoCommit: true,
  createPool: jest.fn(),
}));

import * as oracledb from 'oracledb';

const mockConnection = {
  execute: jest.fn(),
  close: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockPool = {
  getConnection: jest.fn(),
  close: jest.fn(),
};

describe('OracleService', () => {
  let service: OracleService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPool.getConnection.mockResolvedValue(mockConnection);
    mockConnection.close.mockResolvedValue(undefined);
    mockConnection.commit.mockResolvedValue(undefined);
    mockConnection.rollback.mockResolvedValue(undefined);
    (oracledb.createPool as jest.Mock).mockResolvedValue(mockPool);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                ORACLE_USER: 'testuser',
                ORACLE_PASSWORD: 'testpass',
                ORACLE_CONNECTION_STRING: 'localhost/XEPDB1',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OracleService>(OracleService);
    // Manually set pool to avoid calling onModuleInit (which requires real Oracle)
    (service as any).pool = mockPool;
  });

  describe('executeQuery', () => {
    it('usa parámetros vinculados y retorna filas', async () => {
      const mockRows = [{ ID: 1, NOMBRE: 'Test' }];
      mockConnection.execute.mockResolvedValue({ rows: mockRows, metaData: [] });

      const result = await service.executeQuery('SELECT * FROM TABLA WHERE ID = :id', { id: 1 });

      expect(result.rows).toEqual(mockRows);
      // Verifica que execute fue llamado con parámetros vinculados (no concatenación)
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'SELECT * FROM TABLA WHERE ID = :id',
        { id: 1 },
        expect.any(Object),
      );
    });

    it('retorna array vacío cuando no hay filas', async () => {
      mockConnection.execute.mockResolvedValue({ rows: null, metaData: [] });

      const result = await service.executeQuery('SELECT * FROM TABLA', {});

      expect(result.rows).toEqual([]);
    });

    it('lanza ServiceUnavailableException cuando Oracle retorna errorNum', async () => {
      const oracleError = new Error('ORA-12541: TNS:no listener') as any;
      oracleError.errorNum = 12541;
      mockConnection.execute.mockRejectedValue(oracleError);

      await expect(
        service.executeQuery('SELECT * FROM TABLA', {}),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('cierra la conexión incluso si ocurre un error', async () => {
      const oracleError = new Error('ORA-00942: table or view does not exist') as any;
      oracleError.errorNum = 942;
      mockConnection.execute.mockRejectedValue(oracleError);

      await expect(service.executeQuery('SELECT * FROM TABLA', {})).rejects.toThrow();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe('executeStoredProcedure', () => {
    it('usa parámetros vinculados al invocar el stored procedure', async () => {
      mockConnection.execute.mockResolvedValue({
        outBinds: { VAR_VALIDA: 1, VAR_MENSAJE: 'OK' },
      });

      await service.executeStoredProcedure('PA_TEST_SP', {
        param1: { val: 'value1', dir: 3001 },
        param2: { val: 42, dir: 3001 },
      });

      // Verifica que el SQL usa parámetros vinculados con :nombre
      const callArgs = mockConnection.execute.mock.calls[0];
      expect(callArgs[0]).toMatch(/BEGIN PA_TEST_SP\(:param1, :param2\); END;/);
    });

    it('lanza UnprocessableEntityException cuando VAR_VALIDA es 0', async () => {
      mockConnection.execute.mockResolvedValue({
        outBinds: { VAR_VALIDA: 0, VAR_MENSAJE: 'Error de negocio específico' },
      });

      await expect(
        service.executeStoredProcedure('PA_TEST_SP', { p1: 'val' }),
      ).rejects.toThrow(UnprocessableEntityException);

      await expect(
        service.executeStoredProcedure('PA_TEST_SP', { p1: 'val' }),
      ).rejects.toThrow('Error de negocio específico');
    });

    it('lanza UnprocessableEntityException con mensaje genérico si VAR_MENSAJE está vacío', async () => {
      mockConnection.execute.mockResolvedValue({
        outBinds: { VAR_VALIDA: 0, VAR_MENSAJE: null },
      });

      await expect(
        service.executeStoredProcedure('PA_TEST_SP', {}),
      ).rejects.toThrow('Error en procedimiento almacenado');
    });

    it('lanza ServiceUnavailableException cuando Oracle retorna errorNum', async () => {
      const oracleError = new Error('ORA-01017: invalid username/password') as any;
      oracleError.errorNum = 1017;
      mockConnection.execute.mockRejectedValue(oracleError);

      await expect(
        service.executeStoredProcedure('PA_TEST_SP', {}),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('retorna outBinds cuando VAR_VALIDA es 1', async () => {
      const outBinds = { VAR_VALIDA: 1, VAR_RESULTADO: 'datos' };
      mockConnection.execute.mockResolvedValue({ outBinds });

      const result = await service.executeStoredProcedure('PA_TEST_SP', { p: 'v' });

      expect(result).toEqual(outBinds);
    });
  });

  describe('executeTransaction', () => {
    it('ejecuta todas las operaciones y hace commit', async () => {
      mockConnection.execute.mockResolvedValue({});

      await service.executeTransaction([
        { sql: 'INSERT INTO T1 VALUES (:v)', binds: { v: 1 } },
        { sql: 'UPDATE T2 SET X = :x WHERE ID = :id', binds: { x: 2, id: 3 } },
      ]);

      // SET TRANSACTION + 2 operaciones = 3 llamadas a execute
      expect(mockConnection.execute).toHaveBeenCalledTimes(3);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.rollback).not.toHaveBeenCalled();
    });

    it('hace rollback y lanza ServiceUnavailableException si Oracle falla', async () => {
      const oracleError = new Error('ORA-00001: unique constraint violated') as any;
      oracleError.errorNum = 1;
      mockConnection.execute
        .mockResolvedValueOnce({}) // SET TRANSACTION
        .mockRejectedValueOnce(oracleError); // primera operación falla

      await expect(
        service.executeTransaction([{ sql: 'INSERT INTO T1 VALUES (:v)', binds: { v: 1 } }]),
      ).rejects.toThrow(ServiceUnavailableException);

      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });
});
