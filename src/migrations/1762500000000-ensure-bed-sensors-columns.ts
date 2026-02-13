import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureBedSensorsColumns1762500000000
  implements MigrationInterface
{
  name = 'EnsureBedSensorsColumns1762500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "sensorVibration" double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "sensorTemperature" double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "sensorTemperatureUnit" character varying(10)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "sensorTemperatureUnit"',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "sensorTemperature"',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "sensorVibration"',
    );
  }
}
