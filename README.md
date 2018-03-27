# Review downloader project

# Background
Some of our customers have requested that we handle reviews in our products (e.g. App store reviews, Amazon reviews). As a first step, we would like to be able to download the reviews.


When the user submits the URL account, your server should download the data from the reviews and create a json
file in the following format
UserName - Name of user who wrote the review
Date - Date of the review
Star rating - Number of stars
Review Comment
Link - Direct link to the review (where available)

# Basic version
Your site should support reviews from Google Play and Apple Store. Here are some examples
Sample URL that user will input into your site API

Apple Store https://itunes.apple.com/us/app/grubhub-food-delivery-takeout/id302920553?mt=8
https://itunes.apple.com/rss/customerreviews/id= 302920553/json

Google Play https://play.google.com/store/apps/details?id=com.eero.android
Unofficial API
There might be other APIs which
work better, you can feel free to choose any one

Download as many reviews as possible i.e. if the app has thousands of reviews then the CSV should also contain thousands of reviews

# Advanced version (optional)
Your site should also support Amazon reviews. If you complete this you will qualify to receive higher salary than our current entry level. This project is more difficult for the following reasons

● There is no official API for downloading the actual text of the Amazon reviews. There may be some unofficial APIs that uses a webscraping technique

● You may face timeouts when the number of reviews is very high so your site needs to have a way to download the reviews in the background. 

Another solution could be to send the download as an email once it is ready
Sample URLs that the user will input into your site
https://www.amazon.com/Argan-Treatment-Color-Treated-eSalon/dp/B00SI0MCL4/ref=sr_1_2_a_it?ie=UTF8&qid=1489250924&sr=8-2&keywords=esalon
https://www.amazon.com/eero-Home-WiFi-System-Pack/dp/B00XEW3YD6/ref=sr_1_1?s=pc&ie=UTF8&qid=148925
0467&sr=1-1&keywords=eero&th=1#customerReviews


## Demo
Open the following Link http://reviewdownloader.openode.io/home

## Developed By
@otisidev
