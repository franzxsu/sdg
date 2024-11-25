const express = require('express');
const router = express.Router();
const APIService = require('../api');
// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({
// 	storage: storage
// });

router.get('/', (req, res) => {
    res.render('index', { 
      title: 'sadsda',
    });
  });

  router.get('/goals', async (req, res) => {
    try {
      const rawGoals = await APIService.getGoals(true);
      const transformedGoals = APIService.transformGoalData(rawGoals);
  
      res.render('goals', { 
        title: 'SDG Goals', 
        goals: transformedGoals,
        rawGoals: rawGoals
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to fetch SDG Goals' 
      });
    }
  });

router.get('/upload', (req, res) => {
    res.render('upload', { 

    });
  });
router.get('/results', (req, res) => {
    res.render('results', { 

    });
  });
router.get('/contact', (req, res) => {
    res.render('contact', { 

    });
  });
module.exports = router;