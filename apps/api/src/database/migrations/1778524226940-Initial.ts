import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1778524226940 implements MigrationInterface {
  name = 'Initial1778524226940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('SALE', 'PAYMENT')`,
    );
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "price" numeric(10,3) NOT NULL,
        "stockQuantity" integer NOT NULL DEFAULT '0',
        "unit" character varying NOT NULL,
        "category" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "phone" character varying,
        "totalDebt" numeric(10,3) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "customerId" uuid NOT NULL,
        "type" "public"."transactions_type_enum" NOT NULL,
        "amount" numeric(10,3) NOT NULL,
        "note" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "transaction_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "transactionId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,3) NOT NULL,
        CONSTRAINT "PK_transaction_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "transactions"
        ADD CONSTRAINT "FK_transactions_customer"
        FOREIGN KEY ("customerId") REFERENCES "customers"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "transaction_items"
        ADD CONSTRAINT "FK_transaction_items_transaction"
        FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "transaction_items"
        ADD CONSTRAINT "FK_transaction_items_product"
        FOREIGN KEY ("productId") REFERENCES "products"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_items" DROP CONSTRAINT "FK_transaction_items_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_items" DROP CONSTRAINT "FK_transaction_items_transaction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_customer"`,
    );
    await queryRunner.query(`DROP TABLE "transaction_items"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
  }
}
