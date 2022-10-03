import {MigrationInterface, QueryRunner} from "typeorm";

export class createTestPartCollectionTable1664811003085 implements MigrationInterface {
    name = 'createTestPartCollectionTable1664811003085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "collections" ("id" SERIAL NOT NULL, "range_start" integer NOT NULL, "range_end" integer NOT NULL, "images" json NOT NULL, "transcript" json NOT NULL, "questions" json NOT NULL, "partId" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tests" ("id" SERIAL NOT NULL, "folderId" character varying NOT NULL, "description" character varying NOT NULL, "type" character varying NOT NULL, "audioUrl" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parts" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "range_start" integer NOT NULL, "range_end" integer NOT NULL, "skill" character varying NOT NULL, "testId" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_daa5595bb8933f49ac00c9ebc79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_df9fdc0615edac3ff960b8669d5" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_20b3cfd0df36d64268d0bb3d3e0" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_20b3cfd0df36d64268d0bb3d3e0"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_df9fdc0615edac3ff960b8669d5"`);
        await queryRunner.query(`DROP TABLE "parts"`);
        await queryRunner.query(`DROP TABLE "tests"`);
        await queryRunner.query(`DROP TABLE "collections"`);
    }

}
