import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessManagementModule } from './modules/access_management/access_management.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './authGrard/JwtAuthGuard';
import { MasterModule } from './modules/master/master.module';
import { TransactionModule } from './modules/transaction/transaction.module';
// import { JwtAuthGuard } from './authGrard/JwtAuthGuard';

// Modules

// import { ContactModule } from './modules/contact/contact.module';
// import { CallBackModule } from './modules/call-back/call-back.module';

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

console.log('=== DEBUG DB CONFIG ===');

if (isDev) {
  console.log('ENVIRONMENT: DEVELOPMENT');
  console.log('DB_HOST:', JSON.stringify(process.env.DB_HOST));
  console.log('DB_PORT:', JSON.stringify(process.env.DB_PORT));
  console.log('DB_USERNAME:', JSON.stringify(process.env.DB_USERNAME));
  console.log('DB_DATABASE:', JSON.stringify(process.env.DB_DATABASE));
  console.log('DB_SSL:', JSON.stringify(process.env.DB_SSL));
} else {
  console.log('ENVIRONMENT: PRODUCTION');
  console.log('PGHOST:', JSON.stringify(process.env.PGHOST));
  console.log('PGPORT:', JSON.stringify(process.env.PGPORT));
  console.log('PGUSER:', JSON.stringify(process.env.PGUSER));
  console.log('PGDATABASE:', JSON.stringify(process.env.PGDATABASE));
}

console.log('========================');

@Module({
  imports: [
    // ==============================
    // CONFIG
    // ==============================
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ==============================
    // SCHEDULER
    // ==============================
    // ScheduleModule.forRoot(),

    // ==============================
    // JWT
    // ==============================
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),

    // ==============================
    // MAILER
    // ==============================
    // MailerModule.forRoot({
    //   transport: {
    //     host: process.env.MAIL_HOST,
    //     port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    //     secure: false,
    //     auth: {
    //       user: process.env.MAIL_USER,
    //       pass: process.env.MAIL_PASS,
    //     },
    //   },

    //   defaults: {
    //     from: `"No Reply" <${process.env.MAIL_FROM}>`,
    //   },
    // }),

    // ==============================
    // DATABASE
    // ==============================
    isDev
      ? TypeOrmModule.forRoot({
          type: 'postgres',

          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT ?? '5432', 10),

          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,

          autoLoadEntities: true,

          // Development only
          synchronize: true,

          ssl: false,

          extra: {
            max: 100,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        })
      : TypeOrmModule.forRoot({
          type: 'postgres',

          host: process.env.PGHOST,
          port: parseInt(process.env.PGPORT ?? '5432', 10),

          username: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          database: process.env.PGDATABASE,

          autoLoadEntities: true,

          // Production
          synchronize: true,

          ssl: {
            rejectUnauthorized: false,
          },

          extra: {
            max: 100,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        }),

    // ==============================
    // APPLICATION MODULES
    // ==============================
    AccessManagementModule,
    MasterModule,
    TransactionModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    // ==============================
    // GLOBAL JWT GUARD
    // ==============================
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
