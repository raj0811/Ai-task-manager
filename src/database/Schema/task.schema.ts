import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

@Schema({ timestamps: true })
export class Task {
    _id: ObjectId;

    @Prop({
        required: true,
        trim: true,
    })
    title: string;

    @Prop({
        required: true,
        trim: true,
    })
    description: string;

    @Prop({
        required: false,
    })
    summary: string;

    @Prop({
        enum: TaskStatus,
        default: TaskStatus.TODO,
    })
    status: TaskStatus;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    createdBy: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: false,
    })
    assignedTo: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Project',
        required: true,
    })
    projectId: Types.ObjectId;

    @Prop({
        required: false,
    })
    dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);