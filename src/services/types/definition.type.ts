export interface APIResponse<T = unknown> {
    success:boolean,
    message?:string,
    error?:string,
    data?: T | null
    errors?: {
            [key: string]: string[] | undefined;
    }
}

