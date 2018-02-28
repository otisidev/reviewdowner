import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Message } from '../../model/message';
import { Subject } from 'rxjs/Subject';
import { MessageTarget } from '../../model/messageTarget.enum';
import { Observable } from 'rxjs/Observable';
import { Review } from '../../model/Review';
import 'rxjs/add/operator/map';
import { AppInfo } from '../../model/appInfo';
import { Email } from '../../model/Email';

@Injectable()
export class AppService {
    //  create emiter property
    private appSubject = new Subject<Message>();
    // open a subscriber endpoint
    public onMessage = this.appSubject.asObservable();

    // app domain list
    domains: string[];
    constructor(private http: Http) {
        this.domains = ['play.google.com', 'itunes.apple.com', 'www.amazon.com'];
    }
    // notify every subscriber of new message
    notifyMessage(content: string, target: MessageTarget) {
        this.appSubject.next({ content: content, target: target });
    }

    // validates url
    isUrlValid(url: string): boolean {
        const domain = this.getHostName(url);
        if (domain) {
            return this.domains.filter(item => item === domain).length > 0;
        }
        return false;
    }

    getHostName(url): string {
        if (url) {
            const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
            if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
                return match[2];
            } else {
                return null;
            }
        }
        return null;
    }

    // get url params keu and value
    getUrlParams(param: string, url: string): string {
        param = param.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
        const results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // getGoogleReview
    getGoogleReview(appId: string): Observable<Review[]> {
        return this.http.get('/api/googleReview/' + appId)
            .map(items => items.json());
    }

    getGappInformation(appid: string): Observable<AppInfo> {
        return this.http.get('/api/googleAppInfo/' + appid)
            .map(info => info.json());
    }
    sendEmail(email: Email): Observable<any> {
        const data = new Email(email.to, email.subject, email.content);
        return this.http.post('/api/sendMail', data)
            .map(result => result.json());
    }

    getAppleReview(url): Observable<any> {
       return  this.http.get(url)
            .map(data =>  data.json());
    }


}
