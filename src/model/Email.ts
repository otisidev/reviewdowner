export class Email {
    to: string;
    content: string;
    subject: string;
    constructor(to, subject, body) {
        this.to = to;
        this.content = body;
        this.subject = subject;
    }
}
