import {MigrationInterface, QueryRunner} from "typeorm";

export class createNoteHistoryNoteTable1668260670454 implements MigrationInterface {
    name = 'createNoteHistoryNoteTable1668260670454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "noteType" character varying NOT NULL, "wordKey" character varying(300) NOT NULL, "text" character varying(4000), "description" character varying(500), "wordType" character varying, "en_meaning" character varying(400), "vi_meaning" character varying(600), "en_example" character varying(400), "vi_example" character varying(600), "imageURl" character varying(400), "color" character varying, "tags" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "history_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "questionNo" integer, "questionRange" character varying, "part" character varying NOT NULL, "noteId" uuid NOT NULL, "historyId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_9aabe134bc7a5b2b6ff0cf6a09" UNIQUE ("noteId"), CONSTRAINT "PK_f3d408b110caddc4c4d0147a6a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "history_note" ADD CONSTRAINT "FK_9aabe134bc7a5b2b6ff0cf6a094" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "history_note" ADD CONSTRAINT "FK_1ed0a78632f9be64e8101587f0e" FOREIGN KEY ("historyId") REFERENCES "users_history"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "history_note" DROP CONSTRAINT "FK_1ed0a78632f9be64e8101587f0e"`);
        await queryRunner.query(`ALTER TABLE "history_note" DROP CONSTRAINT "FK_9aabe134bc7a5b2b6ff0cf6a094"`);
        await queryRunner.query(`DROP TABLE "history_note"`);
        await queryRunner.query(`DROP TABLE "notes"`);
    }

}
