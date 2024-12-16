// models/userModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'manager';
  accounts: mongoose.Types.ObjectId[];
}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'A password is required'],
  },
  role: {
    type: String,
    enum: ['owner', 'manager'],
    required: true,
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  }],
}, { timestamps: true });

userSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getQuery()._id;
  const user = await mongoose.models.User.findById(userId);
  try {
    if (user?.role === 'owner') {
      await mongoose.models.Account.deleteMany({ owner: userId });
    } else {
      await mongoose.models.Account.updateMany(
        { managers: userId },
        { $pull: { managers: userId } }
      );
    }
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
