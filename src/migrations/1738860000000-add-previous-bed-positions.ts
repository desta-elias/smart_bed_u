import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviousBedPositions1738860000000
  implements MigrationInterface
{
  name = 'AddPreviousBedPositions1738860000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "previousHeadPosition" integer NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "previousRightTiltPosition" integer NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "previousLeftTiltPosition" integer NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "previousLegPosition" integer NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "previousLegPosition"',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "previousLeftTiltPosition"',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "previousRightTiltPosition"',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" DROP COLUMN IF EXISTS "previousHeadPosition"',
    );
  }
}