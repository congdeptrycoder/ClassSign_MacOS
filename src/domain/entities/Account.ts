export class Account {
    id: number;
    username: string;
    name: string;
    role: string;
    id_card: string;

    constructor(
        id: number,
        username: string,
        name: string,
        role: string,
        id_card: string
    ) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.role = role;
        this.id_card = id_card;
    }
}
