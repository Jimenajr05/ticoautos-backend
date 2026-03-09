const express = require('express');
const register = require('../controllers/registerController');
const login= require('../controllers/loginController');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/register',upload.single('profileImage'), register);
router.post('/login', login);


module.exports = router;