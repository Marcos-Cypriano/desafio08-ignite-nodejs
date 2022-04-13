import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AlterStatementsAddSenderIdFK1649075625395 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("statements", "type",
        new TableColumn({
            name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw', 'transfer']
        }))

        await queryRunner.addColumn("statements",
        new TableColumn({
            name: "sender_id",
            type: "uuid",
            isNullable: true
        }))

        await queryRunner.createForeignKey("statements",
        new TableForeignKey({
            name: "FKSender_id",
            columnNames: ["sender_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("statements", "type",
        new TableColumn({
            name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw']
        }))
        await queryRunner.dropForeignKey("statements", "FKSender_id")
        await queryRunner.dropColumn("statements", "sender_id")
    }
}
