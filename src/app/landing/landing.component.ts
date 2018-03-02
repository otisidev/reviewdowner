import { Component, OnInit } from '@angular/core';
import { AppService } from '../Services/app.service';
import { MessageTarget } from '../../model/messageTarget.enum';
import { Router } from '@angular/router';
import { SearchDomain } from '../../model/searchDomain.enum';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent implements OnInit {

  // setting
  setting = {
    email: '',
    historyUrl: ''
  };
  // url
  url: string;
  // status message
  message: string;
  search: string;

  constructor(private appService: AppService, private router: Router) {
    this.appService.onMessage.subscribe((item) => {
      if (item.target === MessageTarget.Setting) {
        this.setting.email = item.content;
      } else if (item.target === MessageTarget.History) {
        this.setting.historyUrl = item.content;
        // open search here
        this.startSearch(this.setting.historyUrl);
      }
    });
  }

  ngOnInit() {
  }


  startSearch(url) {
    this.router.navigate(['search', url]);
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
}
