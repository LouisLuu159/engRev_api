import {MigrationInterface, QueryRunner} from "typeorm";

export class addNameCollumnTestTable1665306607794 implements MigrationInterface {
    name = 'addNameCollumnTestTable1665306607794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "name"`);
    }

}
