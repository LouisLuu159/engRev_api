import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserRTTable1662223470106 implements MigrationInterface {
    name = 'createUserRTTable1662223470106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_rts" ("id" SERIAL NOT NULL, "userId" uuid NOT NULL, "rt" character varying(350) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_82737c9972dd5e65fcc529ac0f7" UNIQUE ("rt"), CONSTRAINT "PK_bf487a22d4a38652018571adda4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_rts" ADD CONSTRAINT "FK_cd75cfb2562179b5e6e3954f762" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_rts" DROP CONSTRAINT "FK_cd75cfb2562179b5e6e3954f762"`);
        await queryRunner.query(`DROP TABLE "user_rts"`);
    }

}
