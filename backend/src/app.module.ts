import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';

// Config
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  whatsappConfig,
} from './config';

// Database
import { DatabaseModule } from './database';

// Feature Modules
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ContactsModule } from './modules/contacts';
import { QueuesModule } from './modules/queues';
import { TicketsModule } from './modules/tickets';
import { MessagesModule } from './modules/messages';
import { HealthModule } from './modules/health';
import { GatewaysModule } from './gateways';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AIModule } from './modules/ai/ai.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { TagsModule } from './modules/tags';
import { SchedulesModule } from './modules/schedules';
import { InternalChatModule } from './modules/internal-chat';
import { CampaignsModule } from './modules/campaigns';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, whatsappConfig],
      envFilePath: ['.env', '.env.example'],
    }),

    // Event Emitter for internal communication
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // BullMQ for job queues
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    HealthModule,
    AuthModule,
    UsersModule,
    WhatsappModule,
    ContactsModule,
    QueuesModule,
    TicketsModule,
    MessagesModule,
    GatewaysModule,
    WebhooksModule,
    AIModule,
    PromptsModule,
    TagsModule,
    SchedulesModule,
    InternalChatModule,
    CampaignsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
