const express = require('express');
const router = express.Router();
const gPlay = require('google-play-scraper');
const mailer = require('nodemailer');
const amaAPi = require('amazon-reviews-crawler');
const helper = require('../customHelper');// custom helper file for working with Url

/* GET: api listing google app review sorted by newest */
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
// default: this does nothing
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


// POST: api that sends email to user
router.post('/sendMail', (req, res) => {
    var transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'info.reviewdownloader@gmail.com',
            pass: 'reviewdownloader@1@2'
        }
    });
    var mailOptions = {
        from: 'info.reviewdownloader@gmail.com',
        to: req.body.to, // gets email receiver from the request body
        subject: req.body.subject, // gets email subject from the request body
        html: req.body.content // gets the actual email's body in html string
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // it failed
            res.status(500).json({ error: error })
        } else {
            // sent
            res.status(200).json({ message: 'Email sent succssfully' });
        }
    });
})
// GET: listing amazon product review
router.get('/getAmazonReview/:asin', (req, res) => {
    let asin = req.params.asin
    amaAPi(asin)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;