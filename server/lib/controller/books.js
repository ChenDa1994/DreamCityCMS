const BaseComponent = require('../prototype/baseComponent');
const BooksModel = require("../models").Books;
const BooksItemsModel = require("../models").BooksItems;
const formidable = require('formidable');
const { service, settings, validatorUtil, logUtil, siteFunc } = require('../../../utils');
const shortid = require('shortid');
const validator = require('validator')

function checkFormData(req, res, fields) {
    let errMsg = '';
    if (fields._id && !siteFunc.checkCurrentId(fields._id)) {
        errMsg = '非法请求，请稍后重试！';
    }
    if (!validator.isLength(fields.name, 2, 15)) {
        errMsg = '2-15个非特殊字符!';
    }
    if (!validator.isLength(fields.comments, 5, 30)) {
        errMsg = '5-30个非特殊字符!';
    }
    if (errMsg) {
        res.send({
            state: 'error',
            type: 'ERROR_PARAMS',
            message: errMsg
        })
    }
}

class Books {
    constructor() {
        // super()
    }
    async getBooks(req, res, next) {
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            let model = req.query.model; // 查询模式 full/simple
            let queryObj = {};
            if (model === 'full') {
                pageSize = '1000'
            }

            const Books = await BooksModel.find(queryObj).sort({ date: -1 }).skip(10 * (Number(current) - 1)).limit(Number(pageSize)).populate([{
                path: 'items'
            }]).exec();
            const totalItems = await BooksModel.count();
            res.send({
                state: 'success',
                docs: Books,
                pageInfo: {
                    totalItems,
                    current: Number(current) || 1,
                    pageSize: Number(pageSize) || 10
                }
            })
        } catch (err) {
            logUtil.error(err, req);
            res.send({
                state: 'error',
                type: 'ERROR_DATA',
                message: '获取Books失败' + err
            })
        }
    }

    async getOneBook(req, res, next) {
        try {
            let targetId = req.query.id;
            let state = req.query.state, queryObj = { _id: targetId };
            if (state) queryObj.state = state
            const ad = await BooksModel.findOne(queryObj).populate([{
                path: 'items'
            }]).exec();
            res.send({
                state: 'success',
                doc: ad || {}
            })
        } catch (error) {
            logUtil.error(err, req);
            res.send({
                state: 'error',
                type: 'ERROR_DATA',
                message: '获取Ad失败' + err
            })
        }
    }

    async addBooks(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            try {
                checkFormData(req, res, fields);
            } catch (err) {
                console.log(err.message, err);
                res.send({
                    state: 'error',
                    type: 'ERROR_PARAMS',
                    message: err.message
                })
                return
            }
            const bookObj = {
                name: fields.name,
                state: fields.state,
                height: fields.height,
                carousel: fields.carousel,
                type: fields.type,
                comments: fields.comments
            }
            let itemIdArr = [], booksItems = fields.items;
            if (booksItems.length > 0) {
                for (let i = 0; i < booksItems.length; i++) {
                    const newBookItem = new BooksItemsModel(booksItems[i]);
                    let newItem = await newBookItem.save();
                    itemIdArr.push(newItem._id);
                }
            }
            bookObj.items = itemIdArr;
            const newBooks = new BooksModel(bookObj);
            try {
                await newBooks.save();
                res.send({
                    state: 'success',
                    id: newBooks._id
                });
            } catch (err) {
                logUtil.error(err, req);
                res.send({
                    state: 'error',
                    type: 'ERROR_IN_SAVE_DATA',
                    message: '保存数据失败:',
                })
            }
        })
    }

    async updateBooks(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            try {
                checkFormData(req, res, fields);
            } catch (err) {
                console.log(err.message, err);
                res.send({
                    state: 'error',
                    type: 'ERROR_PARAMS',
                    message: err.message
                })
                return
            }

            const userObj = {
                name: fields.name,
                state: fields.state,
                height: fields.height,
                carousel: fields.carousel,
                type: fields.type,
                comments: fields.comments
            }
            const item_id = fields._id;
            let itemIdArr = [], booksItems = fields.items;
            try {
                if (booksItems.length > 0) {
                    for (let i = 0; i < booksItems.length; i++) {
                        let targetItem = booksItems[i], currentId = '';
                        if (targetItem._id) {
                            currentId = targetItem._id;
                            await BooksItemsModel.findOneAndUpdate({ _id: targetItem._id }, { $set: targetItem });
                        } else {
                            const newBookItem = new BooksItemsModel(targetItem);
                            let newItem = await newBookItem.save();
                            currentId = newItem._id;
                        }
                        itemIdArr.push(currentId);
                    }
                }
                userObj.items = itemIdArr;
                await BooksModel.findOneAndUpdate({ _id: item_id }, { $set: userObj });
                res.send({
                    state: 'success'
                });
            } catch (err) {
                logUtil.error(err, req);
                res.send({
                    state: 'error',
                    type: 'ERROR_IN_SAVE_DATA',
                    message: '更新数据失败:' + err,
                })
            }
        })

    }

    async delBooks(req, res, next) {
        try {
            let errMsg = '', targetIds = req.query.ids;
            if (!siteFunc.checkCurrentId(targetIds)) {
                errMsg = '非法请求，请稍后重试！';
            } else {
                targetIds = targetIds.split(',');
            }
            if (errMsg) {
                res.send({
                    state: 'error',
                    message: errMsg,
                })
            }
            for (let i = 0; i < targetIds.length; i++) {
                let currentId = targetIds[i];
                let targetAd = await BooksModel.findOne({ _id: currentId });
                await BooksItemsModel.remove({ '_id': { $in: targetAd.items } });
                await BooksModel.remove({ _id: currentId });
            }
            res.send({
                state: 'success'
            });
        } catch (err) {
            logUtil.error(err, req);
            res.send({
                state: 'error',
                type: 'ERROR_IN_SAVE_DATA',
                message: '删除数据失败:' + err,
            })
        }
    }

}

module.exports = new Books();