import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBedSensorsColumns1762000000000 implements MigrationInterface {
  name = 'AddBedSensorsColumns1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" ADD "sensorVibration" double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD "sensorTemperature" double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD "sensorTemperatureUnit" character varying(10)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "beds" DROP COLUMN "sensorTemperatureUnit"');
    await queryRunner.query('ALTER TABLE "beds" DROP COLUMN "sensorTemperature"');
    await queryRunner.query('ALTER TABLE "beds" DROP COLUMN "sensorVibration"');
  }
}
