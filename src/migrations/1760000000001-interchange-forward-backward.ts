import { MigrationInterface, QueryRunner } from 'typeorm';

export class InterchangeForwardBackward1760000000001 implements MigrationInterface {
  name = 'InterchangeForwardBackward1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Swap 'forward' and 'backward' values in existing data using CASE statements
    // This ensures that what was 'forward' becomes 'backward' and vice versa

    // headDirection
    await queryRunner.query(
      `UPDATE "beds" SET "headDirection" = CASE 
        WHEN "headDirection" = 'forward' THEN 'backward'::beds_headDirection_enum
        WHEN "headDirection" = 'backward' THEN 'forward'::beds_headDirection_enum
        ELSE "headDirection"
      END`,
    );

    // rightTiltDirection
    await queryRunner.query(
      `UPDATE "beds" SET "rightTiltDirection" = CASE 
        WHEN "rightTiltDirection" = 'forward' THEN 'backward'::beds_rightTiltDirection_enum
        WHEN "rightTiltDirection" = 'backward' THEN 'forward'::beds_rightTiltDirection_enum
        ELSE "rightTiltDirection"
      END`,
    );

    // leftTiltDirection
    await queryRunner.query(
      `UPDATE "beds" SET "leftTiltDirection" = CASE 
        WHEN "leftTiltDirection" = 'forward' THEN 'backward'::beds_leftTiltDirection_enum
        WHEN "leftTiltDirection" = 'backward' THEN 'forward'::beds_leftTiltDirection_enum
        ELSE "leftTiltDirection"
      END`,
    );

    // legDirection
    await queryRunner.query(
      `UPDATE "beds" SET "legDirection" = CASE 
        WHEN "legDirection" = 'forward' THEN 'backward'::beds_legDirection_enum
        WHEN "legDirection" = 'backward' THEN 'forward'::beds_legDirection_enum
        ELSE "legDirection"
      END`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: swap back 'forward' and 'backward' values using CASE statements

    // headDirection
    await queryRunner.query(
      `UPDATE "beds" SET "headDirection" = CASE 
        WHEN "headDirection" = 'forward' THEN 'backward'::beds_headDirection_enum
        WHEN "headDirection" = 'backward' THEN 'forward'::beds_headDirection_enum
        ELSE "headDirection"
      END`,
    );

    // rightTiltDirection
    await queryRunner.query(
      `UPDATE "beds" SET "rightTiltDirection" = CASE 
        WHEN "rightTiltDirection" = 'forward' THEN 'backward'::beds_rightTiltDirection_enum
        WHEN "rightTiltDirection" = 'backward' THEN 'forward'::beds_rightTiltDirection_enum
        ELSE "rightTiltDirection"
      END`,
    );

    // leftTiltDirection
    await queryRunner.query(
      `UPDATE "beds" SET "leftTiltDirection" = CASE 
        WHEN "leftTiltDirection" = 'forward' THEN 'backward'::beds_leftTiltDirection_enum
        WHEN "leftTiltDirection" = 'backward' THEN 'forward'::beds_leftTiltDirection_enum
        ELSE "leftTiltDirection"
      END`,
    );

    // legDirection
    await queryRunner.query(
      `UPDATE "beds" SET "legDirection" = CASE 
        WHEN "legDirection" = 'forward' THEN 'backward'::beds_legDirection_enum
        WHEN "legDirection" = 'backward' THEN 'forward'::beds_legDirection_enum
        ELSE "legDirection"
      END`,
    );
  }
}
