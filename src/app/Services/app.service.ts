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
        this.domains = ['play.google.com', 'itunes.apple.com', 'amazon.com'];
    }
    // notify every subscriber of new message
    notifyMessage(content: string, target: MessageTarget) {
        this.appSubject.next({ content: content, target: target });
    }

    // validates url
    // checks if supplied url contains predefined domain
    isUrlValid(url: string): boolean {
        const domain = this.getHostName(url);
        if (domain) {
            return this.domains.filter(item => item === domain).length > 0;
        }
        return false;
    }
    // gets the urll's domain example: paly.google.com
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
    // get more information about google play store application
    getGappInformation(appid: string): Observable<AppInfo> {
        return this.http.get('/api/googleAppInfo/' + appid)
            .map(info => info.json());
    }

    // sends email to user on response
    sendEmail(email: Email): Observable<any> {
        const data = new Email(email.to, email.subject, email.content);
        return this.http.post('/api/sendMail', data)
            .map(result => result.json());
    }

    // gets list of apple's product review
    getAppleReview(id): Observable<any> {
        return this.http.get('https://itunes.apple.com/rss/customerreviews/id=' + id + '/json')
            .map(data => data.json());
    }
    // gets list of amazon product review
    getAmazonReviews(isin: string): Observable<any> {
        return this.http.get('/api/getAmazonReview/' + isin)
            .map(items => items.json());
    }


}
