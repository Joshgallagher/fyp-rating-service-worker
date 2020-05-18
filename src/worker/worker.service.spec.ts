import { Test, TestingModule } from '@nestjs/testing';
import { WorkerService } from './worker.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Rating } from './schemas/rating.schema';
import { DiscoveryService } from '@nestjs/core';
import { Model, DocumentQuery, Query } from 'mongoose';
import { createMock } from '@golevelup/nestjs-testing';

describe('WorkerService', () => {
  let service: WorkerService;
  let model: Model<Rating>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigModule,
        DiscoveryService,
        AmqpConnection,
        RabbitMQModule,
        WorkerService,
        {
          provide: getModelToken(Rating.name),
          useValue: {
            constructor: jest.fn(),
            deleteMany: jest.fn(),
            countDocuments: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
    model = module.get<Model<Rating>>(getModelToken(Rating.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteRatingsHandler', () => {
    const data: Record<string, number> = { id: 1 };

    it('Ratings can be deleted if one or more exist', async () => {
      jest.spyOn(model, 'countDocuments').mockReturnValueOnce(
        createMock<Query<number>>({
          exec: jest.fn().mockResolvedValueOnce(4)
        })
      );

      await service.deleteRatingsHandler(data);

      expect(model.countDocuments).toHaveBeenCalledWith({ article_id: data.id });
      expect(model.deleteMany).toHaveBeenCalledWith({ article_id: data.id });
    });

    it('Ratings can not be deleted if none exist', async () => {
      jest.spyOn(model, 'countDocuments').mockReturnValueOnce(
        createMock<Query<number>>({
          exec: jest.fn().mockResolvedValueOnce(0)
        })
      );

      await service.deleteRatingsHandler(data);

      expect(model.countDocuments).toHaveBeenCalledWith({ article_id: data.id });
      expect(model.deleteMany).toHaveBeenCalledTimes(0);
    });
  });
});
