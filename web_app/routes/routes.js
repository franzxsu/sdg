const express = require('express');
const router = express.Router();

const multer = require('multer');

//store to memory
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage
});

router.get('/', (req, res) => {
    res.render('index', { 
      title: 'sadsda',
    });
  });

router.get('/upload', (req, res) => {
    res.render('upload', { 
      title: 'sadsda',
    });
  });
module.exports = router;