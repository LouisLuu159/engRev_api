import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserConfigUserStatusTables1666195460989 implements MigrationInterface {
    name = 'createUserConfigUserStatusTables1666195460989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_config" ("id" SERIAL NOT NULL, "goal" integer, "time_reminder" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b529cae1138818ca95223e95db8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_status" ("id" SERIAL NOT NULL, "full_score" integer, "listening_score" integer, "reading_score" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d295cb2f8df33c080e23acfb8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "statusId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fffa7945e50138103659f6326b7" UNIQUE ("statusId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "configId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_1cb69ed58524a0a959ad00be59d" UNIQUE ("configId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_fffa7945e50138103659f6326b7" FOREIGN KEY ("statusId") REFERENCES "users_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_1cb69ed58524a0a959ad00be59d" FOREIGN KEY ("configId") REFERENCES "users_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_1cb69ed58524a0a959ad00be59d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_fffa7945e50138103659f6326b7"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_1cb69ed58524a0a959ad00be59d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "configId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fffa7945e50138103659f6326b7"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "statusId"`);
        await queryRunner.query(`DROP TABLE "users_status"`);
        await queryRunner.query(`DROP TABLE "users_config"`);
    }

}
