import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
  shopId: string;
  customerName: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileData: Buffer;
  uploadedAt: Date;
  expiresAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default File;
