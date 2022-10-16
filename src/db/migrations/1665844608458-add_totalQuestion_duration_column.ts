import {MigrationInterface, QueryRunner} from "typeorm";

export class addTotalQuestionDurationColumn1665844608458 implements MigrationInterface {
    name = 'addTotalQuestionDurationColumn1665844608458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" ADD "totalQuestions" integer`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "duration" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "totalQuestions"`);
    }

}
