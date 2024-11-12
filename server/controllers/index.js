// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// Get the Cat model
const { Cat, Dog } = models;

// function to help render index page
const hostIndex = (req, res) => {
  const name = 'unknown';

  res.render('index', {
    currentName: name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// try to find all the cats in the database by search
// if there is no cat, will be sent back an error
// only return JSON object being stored (.lean())
const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();
    return res.render('page1', { cats: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

// function to render page 2
const hostPage2 = (req, res) => {
  res.render('page2');
};

// function to render page 3
const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();
    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find dogs' });
  }
};

// return the name of the last added cat
// trying to find most recently added cat
// will get error message instead
const getName = async (req, res) => {
  try {
    const doc = await Cat.findOne({}).sort({ createdDate: 'descending' }).lean().exec();
    if (!doc) {
      return res.status(404).json({ error: 'No cat found' });
    }
    return res.json({ name: doc.name });
  } catch (err) {
    console.log(err);
    return res.status(500).json(
      { error: 'Something went wrong contacting the database' },
    );
  }
};

// return the name of the last added dog
// trying to find most recently added dog
// will get error message instead
const getDogName = async (req, res) => {
  try {
    const doc = await Dog.findOne({}).sort({ createdDate: 'descending' }).lean().exec();
    if (!doc) {
      return res.status(404).json({ error: 'No dog found' });
    }
    return res.json({ name: doc.name });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong contacting the database',
    });
  }
};

// create a new cat in the database
// if there is no first or last nmame submitted, send an error of 400
const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  // if data sent, create a cat and add it to our database
  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);
  console.log(newCat);
  try {
    await newCat.save();
    return res.status(201).json({
      name: newCat.name,
      beds: newCat.bedsOwned,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// create a new dog in the database
const setDogName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
    return res.status(400).json({ error: 'firstname, lastname, breed, and age are all required' });
  }

  const dogData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    breed: `${req.body.breed}`,
    age: req.body.age,
  };

  const newDog = new Dog(dogData);
  console.log(newDog);
  try {
    await newDog.save();
    return res.status(201).json({
      name: newDog.name,
      breed: newDog.breed,
      age: newDog.age,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create dog :( ' });
  }
};

const searchName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }
  try {
    const doc = await Cat.findOne({ name: req.query.name }).select('name bedsOwned').exec();
    if (!doc) {
      return res.status(404).json({ error: 'No cat found' });
    }
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const searchDogName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required' });
  } try {
    const doc = await Dog.findOne({ name: req.query.name }).exec();
    if (!doc) {
      return res.status(400).json({ error: 'No dog found' });
    }
    return res.json({ name: doc.name, breed: doc.breed, age: doc.age });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateLast = (req, res) => {
  const updatePromise = Cat.findOneAndUpdate({}, { $inc: { bedsOwned: 1 } }, {
    returnDocument: 'after', // Populates doc in the .then() with the version after update
    sort: { createdDate: 'descending' },
  }).lean().exec();

  // If we successfully save/update them in the database, send back the cat's info.
  updatePromise.then((doc) => res.json({
    name: doc.name,
    beds: doc.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  updatePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

const updateDogLast = (req, res) => {
  const updatePromise = Dog.findOneAndUpdate({}, { $inc: { age: 1 } }, {
    returnDocument: 'after', // Populates doc in the .then() with the version after update
    sort: { createdDate: 'descending' },
  }).lean().exec();

  // If we successfully save/update them in the database, send back the cat's info.
  updatePromise.then((doc) => res.json({
    name: doc.name,
    breed: doc.breed,
    age: doc.age,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  updatePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  getDogName,
  setName,
  setDogName,
  updateLast,
  updateDogLast,
  searchName,
  searchDogName,
  notFound,
};
