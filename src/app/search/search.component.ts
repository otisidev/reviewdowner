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

declare let $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styles: []
})
export class SearchComponent implements OnInit {

  url: string;
  message: string;
  loading: boolean;
  googleReview: Review[];
  isGoogle: boolean;
  isApple: boolean;
  appinfo: AppInfo;
  logs: Log[];
  key = 'r_download';
  userEmail: string;
  response: string;

  constructor(private activeRouter: ActivatedRoute, private appService: AppService) {
    this.loading = true;
    this.appinfo = null;
    this.activeRouter.params.subscribe(params => {
      this.url = params.url.replace(' ', '');
      this.isGoogle = this.isAndriod(this.url);
      this.isApple = this.isIOS(this.url);
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
    this.startRating();
  }
  startSearch(url) {

    // update domain object
    this.isGoogle = this.isAndriod(this.url);
    this.isApple = this.isIOS(this.url);
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
        }, (error) => {
          this.message = error;
          this.loading = false;
        });
      // this.log(id.replace(' ', ''), this.url);
    } else if (this.isApple) {
      this.googleReview = [];
      this.appService.getAppleReview(url)
        .subscribe(data => {
          this.loading = false;
          this.formatData(data);
        }, (error) => {
          this.message = error;
        });
    }
  }

  // validate url
  isAndriod(url): boolean {
    const state = this.appService.isUrlValid(url);
    if (state && this.appService.getHostName(url) === SearchDomain.andriod) {
      this.message = '';
      return true;
    } else if (this.appService.getHostName(url) !== SearchDomain.apple) {
      this.message = 'Url is invalid!';
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
    } else if (this.appService.getHostName(url) !== SearchDomain.andriod) {
      this.message = 'Url is invalid!';
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

  startRating() {
    $('.ui.rating')
      .rating();
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
    if (reply.value) {
      const newObject = new Reply(index++, this.userEmail + ' user', reply.value);
      this.googleReview[index].response.push(newObject);
      // send email
      if (this.userEmail) {
        this.loading = true;
        this.appService.sendEmail(new Email(this.userEmail, 'Response: ' + this.googleReview[index].text, reply.value))
          .subscribe((res) => {
            this.loading = false;
            console.log(res.message);
          }, (err) => {
            this.loading = false;
            this.message = err;
          });
      }
      reply.value = null;
    }
  }

  // format apple json data
  formatData(data) {

    // set application information
    this.appinfo = {
      appId: data.feed.author.uri.label,
      title: data.feed.entry[0].title.label,
      updated: data.feed.updated.label,
      developer: data.feed.entry[0]['im:image'][0].label,
      developerEmail: data.feed.entry[0]['im:artist'].label,
      icon: data.feed.entry[0]['im:image'][2].label,
      reviews: data.feed.entry.length,
      summary: data.feed.entry[0]['im:name'].label,
    };
    this.googleReview = new Array();
    // get reviews
    const all = data.feed.entry;
    for (let i = 1; i < all.length; i++) {
      const rv = new Review();
      rv.id = all[i].id.label;
      rv.userName = all[i].author.name.label;
      rv.score = all[i]['im:rating'].label;
      rv.text = all[i].content.label;
      rv.url = all[i].link.attributes.href;
      rv.response = new Array();
      this.googleReview.unshift(rv);
    }
  }

  // getStar
  getStar(count): number[] {
    // tslint:disable-next-line:prefer-const
    let newCollection = [];
    for (let index = 0; index < count; index++) {
      newCollection.push(index);
    }
    return newCollection;
  }
}
