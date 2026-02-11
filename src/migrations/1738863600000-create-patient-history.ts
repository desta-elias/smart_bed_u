import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientHistory1738863600000
  implements MigrationInterface
{
  name = 'CreatePatientHistory1738863600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "bed" character varying,
        "room" character varying NOT NULL,
        "condition" character varying NOT NULL,
        "age" integer NOT NULL,
        "gender" character varying NOT NULL,
        "admitted" character varying NOT NULL,
        "bedHeadPosition" integer NOT NULL DEFAULT 0,
        "bedLeftPosition" integer NOT NULL DEFAULT 0,
        "bedRightPosition" integer NOT NULL DEFAULT 0,
        "bedTiltPosition" integer NOT NULL DEFAULT 0,
        "userId" integer,
        "dischargedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patient_history_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "patient_history"');
  }
}