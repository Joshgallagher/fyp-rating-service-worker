import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './schemas/rating.schema';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: configService.get<string>('AMQP_EXCHANGE'),
            type: 'topic',
          },
        ],
        uri: configService.get<string>('AMQP_URI'),
        connectionInitOptions: {
          wait: false
        },
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      {
        name: Rating.name,
        schema: RatingSchema,
        collection: 'rating'
      }
    ])
  ],
  providers: [
    WorkerService
  ]
})
export class WorkerModule { }
