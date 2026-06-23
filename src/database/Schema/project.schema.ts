import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, ObjectId } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

@Schema({ timestamps: true })
export class Project {
    _id: ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: false })
    description: string;

    // Owner of project
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId;

    // Team members
    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    members: Types.ObjectId[];

    @Prop({
        enum: ProjectStatus,
        default: ProjectStatus.ACTIVE,
    })
    status: ProjectStatus;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);