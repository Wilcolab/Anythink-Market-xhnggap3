require('dotenv').config();
const mongoose = require('mongoose');
require('../models/User'); // Ensure your User model is imported
require('../models/Item'); // Ensure your Item model is imported
require('../models/Comment'); // Ensure your Comment model is imported
const User = mongoose.model('User');
const Item = mongoose.model('Item');
const Comment = mongoose.model('Comment');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', async () => {
  try {
    const userIds = await createUsers();
    const itemIds = await createItems(userIds);
    await createComments(userIds, itemIds);
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    mongoose.disconnect();
  }
});

async function createUsers() {
  let userIds = [];
  for (let i = 1; i <= 100; i++) {
    const user = new User({
      username: `user${i}`,
      email: `user${i}@example.com`,
    });
    user.setPassword('password123');
    try {
      await user.save();
      userIds.push(user._id);
    } catch (err) {
      console.error(`Error creating user ${i}: ${err}`);
    }
  }
  return userIds;
}

function generateItemData(userIds) {
  const userIndex = Math.floor(Math.random() * userIds.length);
  const title = `Product ${userIndex}`;
  return {
    title,
    description: `Description for ${title}`,
    image: `https://example.com/images/${userIndex}.png`,
    seller: userIds[userIndex]
  };
}

async function createItems(userIds) {
  let itemIds = [];
  for (let i = 0; i < 100; i++) {
    const itemData = generateItemData(userIds);
    const item = new Item(itemData);
    try {
      await item.save();
      itemIds.push(item._id);
    } catch (err) {
      console.error(`Error creating item ${i}: ${err}`);
    }
  }
  return itemIds;
}

function generateCommentData(userIds, itemIds) {
  const userIndex = Math.floor(Math.random() * userIds.length);
  const itemIndex = Math.floor(Math.random() * itemIds.length);
  const body = `Comment content for item ${itemIndex}`;
  return {
    body,
    seller: userIds[userIndex],
    item: itemIds[itemIndex]
  };
}

async function createComments(userIds, itemIds) {
  for (let i = 0; i < 100; i++) {
    const commentData = generateCommentData(userIds, itemIds);
    const comment = new Comment(commentData);
    try {
      await comment.save();
    } catch (err) {
      console.error(`Error creating comment ${i}: ${err}`);
    }
  }
}
