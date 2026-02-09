import { MigrationInterface, QueryRunner } from 'typeorm';

export class InterchangeForwardBackward1760000000001
  implements MigrationInterface
{
  name = 'InterchangeForwardBackward1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration skipped: Direction columns no longer exist in the Bed entity.
    // The entity now uses position-based fields instead of direction fields.
    console.log('Migration InterchangeForwardBackward1760000000001 skipped - direction columns not present.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: swap back 'forward' and 'backward' values using CASE statements
    // PostgreSQL will infer the enum type from the column definition

    await queryRunner.query(
      `UPDATE "beds" SET 
        "headDirection" = CASE 
          WHEN "headDirection" = 'forward' THEN 'backward'
          WHEN "headDirection" = 'backward' THEN 'forward'
          ELSE "headDirection"
        END,
        "rightTiltDirection" = CASE 
          WHEN "rightTiltDirection" = 'forward' THEN 'backward'
          WHEN "rightTiltDirection" = 'backward' THEN 'forward'
          ELSE "rightTiltDirection"
        END,
        "leftTiltDirection" = CASE 
          WHEN "leftTiltDirection" = 'forward' THEN 'backward'
          WHEN "leftTiltDirection" = 'backward' THEN 'forward'
          ELSE "leftTiltDirection"
        END,
        "legDirection" = CASE 
          WHEN "legDirection" = 'forward' THEN 'backward'
          WHEN "legDirection" = 'backward' THEN 'forward'
          ELSE "legDirection"
        END`,
    );
  }
}
