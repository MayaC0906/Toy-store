import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'


async function query(filterBy = {}) {
    let toys = []
    try {
        let criteria = {}
        if (filterBy.searchKey) {
            const regex = new RegExp(filterBy.searchKey, 'i')
            criteria.name = { $regex: regex }
        } if (filterBy.labels) {
            criteria.labels = { $in: filterBy.labels }
        } if (filterBy.inStock) {
            const inStockFilter = JSON.parse(filterBy.inStock)
            criteria.inStock = {$eq:inStockFilter}
        }
        if (filterBy.sortBy) {
            const sort = filterBy.sortBy
            const sortKey = {}
            sortKey[sort] = 1
            const collection = await dbService.getCollection('toy')
            toys = await collection.find(criteria).sort(sortKey).toArray()
        } else {
            const collection = await dbService.getCollection('toy')
            toys = await collection.find(criteria).toArray()
        }
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        let toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            inStock: toy.inStock
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}

function getEmptyToy() {
    return {
        name: '',
        price: null,
        labels: [],
        createdAt: Date.now(),
        inStock: true,
    }
}


function getRandImgUrl() {
    const imgUrls = ['https://freepngimg.com/thumb/categories/2432.png',
        'https://pngfre.com/wp-content/uploads/spider-man-png-from-pngfre-45-1-887x1024.png',
        'https://www.freepnglogos.com/uploads/toy-story-png/toy-story-buzz-robot-toytoon-png-photos-5.png']

    return imgUrls[utilService.getRandomIntInclusive(0, 2)]
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        msg.createdAt = Date.now()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}


export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg,
    getEmptyToy,
    getRandImgUrl
}