import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as mysql from 'mysql2/promise';
import { seedBeds } from './seed-beds';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (): Promise<TypeOrmModuleOptions> => {
        const host = process.env.DB_HOST ?? 'localhost';
        const port = parseInt(process.env.DB_PORT ?? '3306', 10);
        const username = process.env.DB_USER ?? 'root';
        const password = process.env.DB_PASS ?? 'root@123';
        const database = process.env.DB_NAME ?? 'smart_bed';

        // Ensure database exists (create if missing) before TypeORM connects
        try {
          const connection = await mysql.createConnection({
            host,
            port,
            user: username,
            password,
          });
          await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
          await connection.end();
        } catch (err) {
          // If creation fails, log and rethrow so startup fails visibly
          console.error('Failed to create database:', err);
          throw err;
        }

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true, // ⚠️ keep only for dev, disable in prod
        } as TypeOrmModuleOptions;
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await seedBeds(this.dataSource);
    } catch (error) {
      console.error('Error seeding beds:', error);
    }
  }
}
