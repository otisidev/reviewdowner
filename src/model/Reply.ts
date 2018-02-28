export class Reply {
    id: number;
    name: string;
    content: string;
    date: Date;
    constructor(id, name, content) {
        this.id = id;
        this.date = new Date(Date.now());
        this.content = content;
        this.name = name;
    }
}
