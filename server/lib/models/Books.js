/**
 * Created by Administrator on 2017/4/15.
 * 广告管理
 */
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;
var moment = require('moment')

var BooksItems = require('./BooksItems');
var BooksSchema = new Schema({
    _id: {
        type: String,

        'default': shortid.generate
    },
    name: String,
    type: { type: String, default: "0" }, // 展示形式 0文字 1图片 2友情链接
    carousel: { type: Boolean, default: true }, // 针对图片是否轮播    
    state: { type: Boolean, default: true }, // 广告状态，是否显示
    height: { type: Number, default: 50 },
    date: { type: Date, default: Date.now },
    items: [{ type: String, ref: 'BooksItems' }], // 广告列表id
    comments: String, // 描述
});



BooksSchema.set('toJSON', { getters: true, virtuals: true });
BooksSchema.set('toObject', { getters: true, virtuals: true });

BooksSchema.path('date').get(function (v) {
    return moment(v).format("YYYY-MM-DD HH:mm:ss");
});

var Books = mongoose.model("Books", BooksSchema);
module.exports = Books;

