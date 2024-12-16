// models/accountModel.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import Stock from './stockModel';
import User from './userModel';

export interface IAccount extends Document {
  _id: string;
  name: string;
  plan: 'Free' | 'Pro' | 'Business';
  owner: mongoose.Types.ObjectId;
  managers?: mongoose.Types.ObjectId[];
  stocks: mongoose.Types.ObjectId[];
  storageUsed: number;
  calculateStorageUsed: () => Promise<void>;
}

const accountSchema: Schema<IAccount> = new Schema({
  name: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Business'],
    default: 'Free',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  stocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
  }],
  storageUsed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

accountSchema.methods.calculateStorageUsed = async function () {
  const stocks = await Stock.find({ account: this._id });
  let totalStorage = 0;

  for (const stock of stocks) {
    totalStorage += stock.storageUsed;
  }

  this.storageUsed = totalStorage;
  await this.save();
};

accountSchema.pre('findOneAndDelete', async function (next) {
  const accountId = this.getQuery()._id;
  try {
    // Hesap öncesinde account verisini çek
    const account = await Account.findById(accountId);
    if (!account) {
      return next(new Error('Account not found'));
    }

    await User.updateMany(
      { _id: { $in: account.managers } }, 
      { $pull: { accounts: accountId } } 
    );

    await Stock.deleteMany({ account: accountId });

    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const Account: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', accountSchema);
export default Account;
