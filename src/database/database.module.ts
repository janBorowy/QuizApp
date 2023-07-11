import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'quizApp',
  synchronize: false,
  autoLoadEntities: true,
  retryAttempts: 3,
  retryDelay: 1000,
});
