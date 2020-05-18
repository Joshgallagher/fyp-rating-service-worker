import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Rating extends Document {
    @Prop()
    article_id: Number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
