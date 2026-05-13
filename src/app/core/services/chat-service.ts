import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConstants } from '../constants/api-constants';
import { ChatResponse } from '../model/chat-response';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = ApiConstants.CHAT;

  constructor(private http: HttpClient) {
  }

  askQuestion(request: any) {

    return this.http.post<ChatResponse>(
      this.apiUrl,
      request
      
    );
  }

}