import {MigrationInterface, QueryRunner} from "typeorm";

export class createHistoryDetailTable1666196346780 implements MigrationInterface {
    name = 'createHistoryDetailTable1666196346780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "history_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "answer_sheet" json NOT NULL, "partScores" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9f69737bb82887f370d86110eb3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users_history" ADD "detailId" uuid`);
        await queryRunner.query(`ALTER TABLE "users_history" ADD CONSTRAINT "UQ_cfc60179af7dfb6b95867446e67" UNIQUE ("detailId")`);
        await queryRunner.query(`ALTER TABLE "users_history" ADD CONSTRAINT "FK_cfc60179af7dfb6b95867446e67" FOREIGN KEY ("detailId") REFERENCES "history_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_history" DROP CONSTRAINT "FK_cfc60179af7dfb6b95867446e67"`);
        await queryRunner.query(`ALTER TABLE "users_history" DROP CONSTRAINT "UQ_cfc60179af7dfb6b95867446e67"`);
        await queryRunner.query(`ALTER TABLE "users_history" DROP COLUMN "detailId"`);
        await queryRunner.query(`DROP TABLE "history_detail"`);
    }

}
