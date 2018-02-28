import { Component } from '@angular/core';
import { AppService } from './Services/app.service';
import { MessageTarget } from '../model/messageTarget.enum';
import { Log } from '../model/log';
import { Router } from '@angular/router';
declare let $: any;
@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {

  title = 'app';
  newEmail: string;
  log: Log[];
  key = 'r_download';

  constructor(private appService: AppService, private router: Router) {
    this.newEmail = '';
    this.appService.onMessage.subscribe(newData => {
      if (newData.target === MessageTarget.History) {
        this.log.unshift(JSON.parse(newData.content));
      }

    });
  }
  onSetting() {
    $('#setting').modal({
      centered: false,
      transition: 'fade up'
    }).modal('show');
  }

  setEmail(val) {
    this.appService.notifyMessage(val, MessageTarget.Setting);
  }
  reload() {
    this.router.navigate(['/home']);
  }
}
