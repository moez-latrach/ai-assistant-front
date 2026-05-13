import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConstants } from '../constants/api-constants';
import { UploadResponseModel } from '../model/upload-response';
import { DocumentModel } from '../model/document-model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = ApiConstants.DOCUMENT_UPLOAD;

  constructor(private http: HttpClient) {
  }

  upload(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<UploadResponseModel>(this.apiUrl, formData);

  }

  getDocuments() {

  return this.http.get<DocumentModel[]>(

    ApiConstants.DOCUMENTS

  );

}


}