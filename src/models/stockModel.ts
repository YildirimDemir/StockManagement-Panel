// models/stockModel.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import Item from './itemModel';
import Account from '@/components/Account/Account';

export interface IStock extends Document {
  name: string;
  account: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];
  storageUsed: number;
  icon: string;
  calculateStorage: () => Promise<void>; 
}

const stockSchema = new Schema<IStock>({
  name: {
    type: String,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  }],
  icon: {
    type: String,
    default: 'FaCube',
  },
  storageUsed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

stockSchema.methods.calculateStorage = async function () {
  try {
    const totalStorage = await Item.aggregate([
      { $match: { stock: this._id } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } },
    ]);

    this.storageUsed = totalStorage[0]?.totalSize || 0;
    await this.save();
  } catch (error) {
    console.error("Error calculating storage:", error);
    throw error;
  }
};

stockSchema.pre('findOneAndDelete', async function (next) {
  const stockId = this.getQuery()._id; 

  try {
    if (!stockId) {
      return next(new Error('Stock ID not provided')); 
    }

    await Item.deleteMany({ stock: stockId });

    next(); 
  } catch (error) {
    next(error as mongoose.CallbackError); 
  }
});


const Stock: Model<IStock> = mongoose.models.Stock || mongoose.model<IStock>("Stock", stockSchema);
export default Stock;