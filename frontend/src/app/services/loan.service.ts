import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface LoanDto {
  LoanID?: number;
  loanID?: number;
  Borrower?: string;
  borrower?: string;
  Amount?: number;
  amount?: number;
  Purpose?: string;
  purpose?: string;
  Branch?: string;
  branch?: string;
  DocumentType?: string;
  documentType?: string;
  AttachmentsJson?: string;
  attachmentsJson?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  // change this base URL if your API listens on another port
  private apiBase = 'http://localhost:5089/api/loans';

  constructor(private http: HttpClient) { }

  public async getAll(): Promise<LoanDto[]> {
    return lastValueFrom(this.http.get<LoanDto[]>(this.apiBase));
  }

  public async create(payload: Partial<LoanDto>): Promise<LoanDto> {
    return lastValueFrom(this.http.post<LoanDto>(this.apiBase, payload));
  }

  public async update(id: number | string, payload: Partial<LoanDto>): Promise<void> {
    await lastValueFrom(this.http.put(`${this.apiBase}/${id}`, payload));
  }

  public async delete(id: number | string): Promise<void> {
    await lastValueFrom(this.http.delete(`${this.apiBase}/${id}`));
  }
}
