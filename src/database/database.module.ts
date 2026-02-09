import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { seedBeds } from './seed-beds';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('DatabaseConnection');
        const host = config.get<string>('DB_HOST') || '127.0.0.1';
        const dbType = (
          config.get<string>('DB_TYPE') || 'postgres'
        ).toLowerCase();
        const defaultPort = dbType === 'mysql' ? '3306' : '5432';
        const port = parseInt(config.get<string>('DB_PORT') || defaultPort, 10);
        const username = config.get<string>('DB_USER');
        const database = config.get<string>('DB_NAME');

        logger.log(
          `Connecting to ${dbType} database: ${database} at ${host}:${port} as user: ${username}`,
        );

        return {
          type: dbType as 'postgres' | 'mysql',
          host,
          port,
          username,
          password: config.get<string>('DB_PASSWORD'),
          database,
          synchronize: false, // only for dev
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          ssl: false, // important for local Docker
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await seedBeds(this.dataSource);
    } catch (error) {
      this.logger.error('Error seeding beds:', error);
    }
  }
}
