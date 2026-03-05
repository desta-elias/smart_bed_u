import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBedManagementSecurity1763000000000
  implements MigrationInterface
{
  name = 'CreateBedManagementSecurity1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bed_management_security" (
        "id" integer NOT NULL,
        "pinHash" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bed_management_security_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "bed_management_security" ("id")
      VALUES (1)
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "bed_management_security"');
  }
}

