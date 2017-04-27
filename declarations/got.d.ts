interface GotInterface {
    (url: string, opts: object): Promise<any>;
    <T>(url: string, opts: object): Promise<T>;
    stream: (url: string, opts: object) => any;
    RequestError: typeof Error;
    ReadError: typeof Error;
    ParseError: typeof Error;
    HTTPError: typeof Error;
    MaxRedirectsError: typeof Error;
}

declare const got: GotInterface; 

export = got;
