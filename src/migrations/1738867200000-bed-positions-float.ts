import { MigrationInterface, QueryRunner } from 'typeorm';

export class BedPositionsFloat1738867200000 implements MigrationInterface {
  name = 'BedPositionsFloat1738867200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "headPosition" TYPE double precision USING "headPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousHeadPosition" TYPE double precision USING "previousHeadPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "rightTiltPosition" TYPE double precision USING "rightTiltPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousRightTiltPosition" TYPE double precision USING "previousRightTiltPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "leftTiltPosition" TYPE double precision USING "leftTiltPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousLeftTiltPosition" TYPE double precision USING "previousLeftTiltPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "legPosition" TYPE double precision USING "legPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousLegPosition" TYPE double precision USING "previousLegPosition"::double precision',
    );

    await queryRunner.query(
      'ALTER TABLE "bed_movement_history" ALTER COLUMN "previousPosition" TYPE double precision USING "previousPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "bed_movement_history" ALTER COLUMN "newPosition" TYPE double precision USING "newPosition"::double precision',
    );

    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedHeadPosition" TYPE double precision USING "bedHeadPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedLeftPosition" TYPE double precision USING "bedLeftPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedRightPosition" TYPE double precision USING "bedRightPosition"::double precision',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedTiltPosition" TYPE double precision USING "bedTiltPosition"::double precision',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedTiltPosition" TYPE integer USING ROUND("bedTiltPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedRightPosition" TYPE integer USING ROUND("bedRightPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedLeftPosition" TYPE integer USING ROUND("bedLeftPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "patient" ALTER COLUMN "bedHeadPosition" TYPE integer USING ROUND("bedHeadPosition")::integer',
    );

    await queryRunner.query(
      'ALTER TABLE "bed_movement_history" ALTER COLUMN "newPosition" TYPE integer USING ROUND("newPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "bed_movement_history" ALTER COLUMN "previousPosition" TYPE integer USING ROUND("previousPosition")::integer',
    );

    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousLegPosition" TYPE integer USING ROUND("previousLegPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "legPosition" TYPE integer USING ROUND("legPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousLeftTiltPosition" TYPE integer USING ROUND("previousLeftTiltPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "leftTiltPosition" TYPE integer USING ROUND("leftTiltPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousRightTiltPosition" TYPE integer USING ROUND("previousRightTiltPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "rightTiltPosition" TYPE integer USING ROUND("rightTiltPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "previousHeadPosition" TYPE integer USING ROUND("previousHeadPosition")::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "beds" ALTER COLUMN "headPosition" TYPE integer USING ROUND("headPosition")::integer',
    );
  }
}