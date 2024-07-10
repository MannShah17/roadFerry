
const router = require('express').Router();



router.get('/', async (req, res) => {
    res.render('./Payment/otp')
});
router.post('/otp', async (req, res) => {
    const otp = req.body
    
    res.render('transporterdetails',otp)
});


module.exports = router;