import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

// const PAGE_SIZE = 3

async function query(filterBy = { txt: '' }) {
  try {
    const criteria = {
      // vendor: { $regex: filterBy.txt, $options: 'i' }
    }
    const collection = await dbService.getCollection('board')
    var boardCursor = await collection.find(criteria)

    // if (filterBy.pageIdx !== undefined) {
    //     boardCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
    // }

    const boards = boardCursor.toArray()
    return boards
  } catch (err) {
    logger.error('cannot find boards', err)
    throw err
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    const board = collection.findOne({ _id: ObjectId(boardId) })
    return board
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.deleteOne({ _id: ObjectId(boardId) })
    return boardId
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function add(board) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.insertOne(board)
    return board
  } catch (err) {
    logger.error('cannot insert board', err)
    throw err
  }
}

async function update(board) {
  try {
    const boardToSave = {
      title: board.title,
      imgUrl: board.imgUrl,
      bgColor: board.bgColor,
      isStarred: board.isStarred,
      createdBy: board.createdBy,
      labels: board.labels,
      style: board.style,
      members: board.members,
      cover: board.cover,
      backGround: board.backGround,
      groups: board.groups,
      activities: board.activities,
      cmpOrder: board.cmpOrder,
    }
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: ObjectId(board._id) },
      { $set: boardToSave }
    )
    return board
  } catch (err) {
    logger.error(`cannot update board ${boardId}`, err)
    throw err
  }
}

//Exemple to mini update
async function addBoardMsg(boardId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: ObjectId(boardId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add board msg ${boardId}`, err)
    throw err
  }
}

async function removeBoardMsg(boardId, msgId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: ObjectId(boardId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot add board msg ${boardId}`, err)
    throw err
  }
}

export const boardService = {
  remove,
  query,
  getById,
  add,
  update,
  addBoardMsg,
  removeBoardMsg,
}
