
export type User = {
    id: string;
    _id: string;
    username: string;
    email: string;
    avartar: string;
    user?:{
        _id: string;
        username: string;
        email: string;
    }
    bio: string;
    role: "owner" | "member";
}