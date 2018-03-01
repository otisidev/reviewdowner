import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../Services/app.service';
import { SearchDomain } from '../../model/searchDomain.enum';
import { Review } from '../../model/Review';
import { AppInfo } from '../../model/appInfo';
import { MessageTarget } from '../../model/messageTarget.enum';
import { Log } from '../../model/log';
import { Reply } from '../../model/Reply';
import { Email } from '../../model/Email';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styles: []
})
export class SearchComponent implements OnInit {

  url: string;
  message: string;
  loading: boolean;
  adding: boolean;
  googleReview: Review[];
  isGoogle: boolean;
  isApple: boolean;
  isAmazon: boolean;
  appinfo: AppInfo;
  logs: Log[];
  key = 'r_download';
  userEmail: string;
  response: string;
  amazonTitle: string;

  constructor(private activeRouter: ActivatedRoute, private appService: AppService) {
    this.loading = true;
    this.adding = false;
    this.appinfo = null;
    this.amazonTitle = null;
    this.activeRouter.params.subscribe(params => {
      this.url = params.url.replace(' ', '');
      this.isGoogle = this.isAndriod(this.url);
      this.isApple = this.isIOS(this.url);
      this.isAmazon = this.appService.getHostName(this.url) === SearchDomain.amazon;
    });
    this.googleReview = new Array();
    this.logs = new Array();

    // subcribe to new message
    this.appService.onMessage.subscribe(data => {
      if (data.target === MessageTarget.Setting) {
        this.userEmail = data.content;
      }
    });
  }

  ngOnInit() {
    this.startSearch(this.url);
  }

  // start search
  startSearch(url) {

    // update domain object
    this.isGoogle = this.isAndriod(this.url);
    this.isApple = this.isIOS(this.url);
    this.isAmazon = this.isAma(this.url);
    // carry on executing reviews
    this.loading = true;

    if (this.isGoogle) {
      // get app information
      this.getGappInfo();
      this.googleReview = [];
      const id = this.appService.getUrlParams('id', url);
      this.appService.getGoogleReview(id.replace(' ', ''))
        .subscribe(reviews => {
          this.googleReview = reviews;
          this.googleReview.forEach(item => item.response = new Array());
          this.loading = false;
          this.amazonTitle = null;
        }, (error) => {
          this.message = error;
          this.loading = false;
        });
      // this.log(id.replace(' ', ''), this.url);
    } else if (this.isApple) {
      this.googleReview = [];
      this.appService.getAppleReview(this.getAppleId(url))
        .subscribe(data => {
          this.loading = false;
          this.formatData(data);
        }, (error) => {
          this.message = error;
        });
    } else if (this.isAmazon) {
      // get amazon data
      const isin = this.getAmazonId(this.url, SearchDomain.amazon);
      if (isin) {
        this.appService.getAmazonReviews(isin)
          .subscribe(data => {
            this.loading = false;
            this.formatAmazonResult(data);
          }, (erro) => {
            this.loading = false;
            alert('Failed! Unable to fetch review from amazon.');
          });
      } else {
        this.message = 'Amazon Product id is invalid!';
        this.loading = false;
      }
    } else {
      this.message = ' None matched!';
      this.loading = false;
    }

  }

  // validate url
  isAndriod(url): boolean {
    const state = this.appService.isUrlValid(url);
    if (state && this.appService.getHostName(url) === SearchDomain.andriod) {
      this.message = '';
      return true;
    } else if (this.appService.getHostName(url) !== SearchDomain.apple && this.appService.getHostName(url) !== SearchDomain.amazon) {
      this.message = 'invalid android store invalid!';
      return false;
    } else {
      this.message = null;
      return false;
    }
  }
  isIOS(url): boolean {
    const state = this.appService.isUrlValid(url);
    if (state && this.appService.getHostName(url) === SearchDomain.apple) {
      this.message = null;
      return true;
    } else if (this.appService.getHostName(url) !== SearchDomain.andriod && this.appService.getHostName(url) !== SearchDomain.amazon) {
      this.message = 'invalid apple store!';
      return false;
    } else {
      this.message = null;
      return false;
    }

  }

  isAma(url): boolean {
    const state = this.appService.isUrlValid(url);
    if (state && this.appService.getHostName(url) === SearchDomain.amazon) {
      this.message = null;
      return true;
    } else if (this.appService.getHostName(url) !== SearchDomain.andriod && this.appService.getHostName(url) !== SearchDomain.apple) {
      this.message = 'Invalid amazon store url!';
      return false;
    } else {
      this.message = null;
      return false;
    }

  }

  hasAndriodId(url): boolean {
    const result = this.appService.getUrlParams('id', url);
    if (result) {
      this.message = null;
      return true;
    } else if (!result && this.appService.getHostName(url) !== SearchDomain.apple) {
      this.message = 'Andriod app id is required!';
      return false;
    } else {
      this.message = null;
      return false;
    }
  }

  getGappInfo() {
    this.appinfo = null;
    this.loading = true;
    if (this.isAndriod(this.url)) {
      const id = this.appService.getUrlParams('id', this.url);
      this.appService.getGappInformation(id)
        .subscribe(info => {
          this.appinfo = info;
          this.loading = false;
        }, (error) => {
          this.message = error;
        });
    }
  }


  log(appId, url) {
    if (JSON.parse(localStorage.getItem(this.key)).length) {
      this.logs = JSON.parse(localStorage.getItem(this.key));
    } else {
      this.logs = new Array();
    }
    console.log('Logging Log:  ', this.logs);
    const data = { id: appId, url: url };
    let match: boolean;
    for (let i = 0; i < this.logs.length; i++) {
      if (this.logs[i].id === appId) {
        match = true;
        break;
      }
    }
    if (!match) {
      this.logs.unshift(data);
      localStorage.setItem(this.key, JSON.stringify(this.logs));
      this.appService.notifyMessage(JSON.stringify(data), MessageTarget.History);
    }
  }
  // add response to review
  addGoogleReponse(index: number, reply) {
    this.adding = true;
    if (reply.value) {
      const id = index + 1;
      const newObject = new Reply(id, this.userEmail + '- user', reply.value);
      this.googleReview[index].response.push(newObject);
      // send email
      if (this.userEmail) {
        this.adding = true;
        // tslint:disable-next-line:max-line-length
        const content = '<h2>Response to review</h2><p>' + reply.value + '</p> <br/><hr/> <h3> Review: </h3> <p> ' + this.googleReview[index].text + '</p> ';
        this.appService.sendEmail(new Email(this.userEmail, 'Response to : ' + this.googleReview[index].userName + ' review.', content))
          .subscribe((res) => {
            this.adding = false;
            console.log(res.message);
            alert(res.message);
          }, (err) => {
            this.adding = false;
            this.message = err;
          });
      }
      this.adding = false;
      reply.value = null;
    }
  }

  // format apple json data
  formatData(data) {

    // set application information
    this.appinfo = {
      appId: data.feed.entry[0].id.attributes['im:bundleId'],
      title: data.feed.entry[0].title.label,
      updated: data.feed.updated.label,
      developer: data.feed.entry[0].category.attributes.term,
      developerEmail: data.feed.entry[0]['im:artist'].label,
      icon: data.feed.entry[0]['im:image'][2].label,
      reviews: data.feed.entry.length,
      summary: data.feed.entry[0]['im:name'].label,
    };
    // clear review list
    this.googleReview = new Array();
    // get reviews
    const all = data.feed.entry;

    // create new review from the response returned from apple API
    for (let i = 1; i < all.length; i++) {
      const rv = new Review();
      rv.id = all[i].id.label;
      rv.userName = all[i].author.name.label;
      rv.score = all[i]['im:rating'].label;
      rv.text = all[i].content.label;
      rv.url = all[i].link.attributes.href;
      // reset the response
      rv.response = new Array();
      // adds it to our review list
      this.googleReview.unshift(rv);
    }
    // clear amazon product title
    this.amazonTitle = null;
  }

  // this method determines how many star rating could be display for each review
  getStar(count): number[] {
    // tslint:disable-next-line:prefer-const
    let newCollection = [];
    for (let index = 0; index < count; index++) {
      newCollection.push(index);
    }
    return newCollection;
  }

  // formats result returned from amazon API to fit our Review object : Review.ts
  formatAmazonResult(data) {
    if (data) {
      this.googleReview = new Array();
      data.reviews.forEach(item => {
        const dt = new Review();
        dt.id = item.id;
        dt.url = item.link;
        dt.score = item.rating;
        dt.text = item.title + ' - ' + item.text;
        dt.date = new Date(item.date);
        dt.userName = item.author;

        // add to review list
        this.googleReview.push(dt);
      });
      // set the title
      this.amazonTitle = data.title;
      this.appinfo = null;
    }
  }

  // This method extracts amazon product id from url: path to the product in their website
  getAmazonId(url, domain): any {
    const match = url.replace('https://', '').replace('http://', '').replace('www.amazon.com', '').split('/dp/');
    if (match.length) {
      return match[1].split('ref')[0].replace('/', '');
    }
    return null;
  }

  // get  apple application id from url
  getAppleId(url: string): string {
    if (url) {
      const item = url.replace('https://', '').replace('id', '').split('/'); 
      const id = item[item.length - 1].split('?')[0];
      return id;
    }
    return null;
  }
}
