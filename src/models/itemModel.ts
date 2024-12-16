import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    sku: string;
    image?: string;
    category: string;
    quantity: number;
    unitPrice?: number;
    wholesalePrice?: number;
    status: 'in stock' | 'out of stock';  
    supplier?: string;
    stock: {_id: Schema.Types.ObjectId;}
}

const ItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true, required: true },  
    image: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: false },  
    wholesalePrice: { type: Number, required: false },  
    status: { type: String, enum: ['in stock', 'out of stock'], default: 'in stock' },
    supplier: { type: String },
    stock: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
}, {
    timestamps: true, 
});

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
