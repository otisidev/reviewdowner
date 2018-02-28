const express = require('express');
const router = express.Router();
const gPlay = require('google-play-scraper');
const mailer = require('nodemailer');

/* GET api listing. */
router.get('/googleReview/:appId', (req, res) => {
    const appId = req.params.appId;
    gPlay.reviews({
        appId: appId,
        page: 0,
        sort: gPlay.sort.NEWEST,
        lang: 'en'
    }).then((result) => {
        res.status(200).json(result)
    }, (err) => {
        res.status(500).json({
            error: err
        })
    });
});
// default
router.get('/', (req, res) => {
    res.send('API works');
})

// get application information
router.get('/googleAppInfo/:appId', (req, res) => {
    let id = req.params.appId;
    gPlay.app({
        appId: id,
    }).then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(500)
            .json({ error: err })
    });
});

var transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info.reviewdownloader@gmail.com',
        pass: 'reviewdownloader@1@2'
    }
});

router.post('/sendMail', (req, res) => {
    
    var mailOptions = {
        from: 'info.reviewdownloader@gmail.com',
        to: req.body.to,
        subject: req.body.subject,
        text: JSON.stringify(req.body.content)
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).json({error:error})
        } else {
            res.status(200).json({ message: 'Email sent: ' + info.response});
        }
    });
})



module.exports = router;