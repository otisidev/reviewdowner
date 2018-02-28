import { Reply } from "./Reply";

export class Review {
    id: number;
    userName: string;
    rating: number;
    review: string;
    link: string;
    date: Date;
    response: Reply[]
}
