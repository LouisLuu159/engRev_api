import {MigrationInterface, QueryRunner} from "typeorm";

export class addSkillPartTypeColumn1666343196530 implements MigrationInterface {
    name = 'addSkillPartTypeColumn1666343196530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" ADD "skills" character varying`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "partType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "partType"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "skills"`);
    }

}
