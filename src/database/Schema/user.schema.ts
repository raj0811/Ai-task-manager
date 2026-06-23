import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    _id: ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: false })
    number: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'USER' })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);


// bcrypt code for hashing password salt = 10
UserSchema.pre('save', async function () {
    const user = this as any;

    if (!user.isModified('password')) return;

    user.password = await bcrypt.hash(user.password, 10);
});