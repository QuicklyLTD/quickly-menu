import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class HttpService {
    hostname: string;

    constructor(private http: HttpClient) {
        this.hostname = "https://hq.quickly.com.tr";
        // this.hostname = "http://localhost:3000"
        // this.hostname = "https://quickly.com.tr";
    }

    get(url: string) {
        return this.http.get(this.hostname + url);
    }
    put(url: string, data?: any) {
        return this.http.put(this.hostname + url, data);
    }
    post(url: string, data?: any) {
        return this.http.post(this.hostname + url, data);
    }
    delete(url: string) {
        return this.http.delete(this.hostname + url);
    }
}