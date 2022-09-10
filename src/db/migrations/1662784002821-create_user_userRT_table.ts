import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserUserRTTable1662784002821 implements MigrationInterface {
    name = 'createUserUserRTTable1662784002821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(255), "age" integer, "email" character varying(350) NOT NULL, "username" character varying(128) NOT NULL, "password" character varying(256) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_rts" ("id" SERIAL NOT NULL, "userId" uuid NOT NULL, "rt" character varying(350) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_82737c9972dd5e65fcc529ac0f7" UNIQUE ("rt"), CONSTRAINT "PK_bf487a22d4a38652018571adda4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_rts" ADD CONSTRAINT "FK_cd75cfb2562179b5e6e3954f762" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_rts" DROP CONSTRAINT "FK_cd75cfb2562179b5e6e3954f762"`);
        await queryRunner.query(`DROP TABLE "user_rts"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
