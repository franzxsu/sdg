const express = require('express');
const router = express.Router();
const APIService = require('../api');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const {
	handleFileUpload
} = require('../api');
const path = require('path');
const fs = require('fs');
// const storage = multer.memoryStorage();
const upload = multer({
	dest: 'uploads/'
}); // Set the destination folder for uploads

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

router.get('/analyze', (req, res) => {
	res.render('analyze', { predictions: null, error: null });
});

router.post('/analyze', async (req, res) => {
  const reportText = req.body.reportText; // Get the report text

  // If no text is provided, return an error message
  if (!reportText || reportText.trim() === "") {
    return res.render('analyze', { predictions: null, error: "Please enter some text to analyze." });
  }

  try {
    // Make the POST request to the prediction API
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      text: reportText
    });

    const predictions = response.data.predictions; // Get predictions from API response

    // Send the predictions to the EJS view
    res.render('analyze', { predictions, error: null });
  } catch (error) {
    console.error("Error calling prediction API:", error);
    res.render('analyze', { predictions: null, error: "There was an error processing the prediction." });
  }
});

router.get('/results', (req, res) => {
	res.render('results', {

	});
});
router.get('/contact', (req, res) => {
	res.render('contact', {

	});
});

router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).send('No file uploaded.');
		}

		// Get the uploaded file path
		const filePath = path.join(__dirname, '../uploads', req.file.filename);

		// Handle file upload and prediction
		await handleFileUpload(filePath);

		// Delete the uploaded file after processing
		fs.unlinkSync(filePath);

		res.send('File uploaded and prediction processed successfully!');
	} catch (error) {
		console.error(error);
		res.status(500).send('Error processing the file.');
	}
});


module.exports = router;