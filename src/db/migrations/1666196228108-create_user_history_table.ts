import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserHistoryTable1666196228108 implements MigrationInterface {
    name = 'createUserHistoryTable1666196228108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer, "userId" uuid NOT NULL, "testId" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a710c18fdd04f26872921580eb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users_history" ADD CONSTRAINT "FK_524b508a4d00f1709885d5a12ae" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_history" ADD CONSTRAINT "FK_a1b5c7c5b64bd78cb8f07dc4892" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_history" DROP CONSTRAINT "FK_a1b5c7c5b64bd78cb8f07dc4892"`);
        await queryRunner.query(`ALTER TABLE "users_history" DROP CONSTRAINT "FK_524b508a4d00f1709885d5a12ae"`);
        await queryRunner.query(`DROP TABLE "users_history"`);
    }

}
