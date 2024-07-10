var express = require("express");
var router = express.Router();



router.get('/', async (req, res) => {
    res.render("Pages/pages-login");
});

router.post('/',async(req,res)=>{
    const name = req.body.name
    const phone = req.body.phone
    
    res.render('otp',{phone,name})
})
module.exports = router;