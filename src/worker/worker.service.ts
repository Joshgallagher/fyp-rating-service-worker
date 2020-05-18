import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from './schemas/rating.schema';

@Injectable()
export class WorkerService {
    constructor(
        @InjectModel(Rating.name)
        private readonly ratingModel: Model<Rating>
    ) { }

    @RabbitSubscribe({
        exchange: 'article.exchange',
        routingKey: 'article.deleted',
        queue: 'rating-service-queue'
    })
    async deleteRatingsHandler(
        { id }: Record<string, number>
    ): Promise<void> {
        const ratingCount = await this.ratingModel
            .countDocuments({ article_id: id })
            .exec();

        if (ratingCount > 0) {
            await this.ratingModel.deleteMany({ article_id: id });
        }
    }
}
