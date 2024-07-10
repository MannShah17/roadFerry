const router = require('express').Router();



router.get('/transporter', async (req, res) => {
    res.render('transporterdetails')
});

//{ Fname, Lname, phone, email, password, address, area, city, pincode, state, country, status, registernumber, gstnumber, dfname, dlname, demail, dphone, age, pimg, aimg, iimg, vehical, vnumber, chassis, comments, vimg }
router.post('/transporter', async (req, res) => {
    const detailes = req.body
    
    res.render('transporterdetails', detailes)
});


module.exports = router;