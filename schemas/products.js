let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    stock: { type: Number, default: 0 },
    imageURL: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);
