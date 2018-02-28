import { Reply } from './Reply';

export class Review {
    id: string;
    userName: string;
    userImage: string;
    score: number;
    text: string;
    url: string;
    date: Date;
    response: Reply[];
    constructor() {
        this.response = [];
    }
}
