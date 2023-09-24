import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save,
    getEmptyToy
}

function query(filterBy = {}) {
    console.log(filterBy, 'fromback');
    let toysToReturn = toys
    if (filterBy.searchKey) {
        const regExp = new RegExp(filterBy.searchKey, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.sortBy) {
        if (filterBy.sortBy === 'price' || filterBy.sortBy === 'createdAt') {
            const sortKey = filterBy.sortBy
            toysToReturn = toysToReturn.sort((a, b) => (a[sortKey] - b[sortKey]))
        } else if (filterBy.sortBy === 'name') {
            toysToReturn = toysToReturn.sort((a, b) => a.name.localeCompare(b.name))
        }
        else toysToReturn
    }
    if (filterBy.toyLabels) {
        toysToReturn = toysToReturn.filter(toy => {
            return toy.labels.some(label => {
                return filterBy.toyLabels.includes(label)
            })
        })




        // const regExp = new RegExp(filterBy.toyLabels, 'i')
        // toysToReturn = toysToReturn.filter(toy => regExp.test(toy.toyLabels))
    }

    if (filterBy.inStock) {
        const regExp = new RegExp(filterBy.inStock, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.inStock))
    }
    return Promise.resolve(toysToReturn)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    toys.splice(idx, 1)
    return _saveToysToFile()

}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
    } else {
        toy._id = _makeId()
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}

function getEmptyToy() {
    return {
        name: '',
        price: null,
        labels: ['Puzzle'],
        createdAt: Date.now(),
        inStock: true,
    }
}