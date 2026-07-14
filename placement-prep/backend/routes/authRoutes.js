const express = require("express")
const router= express.Router();
const {signup,login, getProfile}= require('../controllers/authController')
const protect = require('../middleware/AuthMiddleware')
const upload = require('../middleware/uploadMiddleware');
const {updateProfile}= require('../controllers/authController')

router.post('/signup', signup);  //here first signup is path and second one is function

router.post('/login', login);

router.get('/profile' , protect, getProfile)

router.put('/profile', protect, updateProfile);


module.exports= router;