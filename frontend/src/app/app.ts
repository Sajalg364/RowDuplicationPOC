import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  GridModule,
  EditService,
  ToolbarService,
  SortService,
  PageService,
  GridComponent,
  ExcelExportService,  
  PdfExportService
} from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-buttons';
import { DatePickerAllModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { HttpClientModule } from '@angular/common/http';

import { LoanService } from './services/loan.service';

@Component({
  imports: [
    CommonModule,
    GridModule,
    DatePickerAllModule,
    TimePickerModule,
    FormsModule,
    TextBoxModule,
    MultiSelectModule,
    AutoCompleteModule,
    ToolbarModule,
    DropDownListModule,
    HttpClientModule // ensure HttpClient is available for the service
  ],
  providers: [EditService, ToolbarService, SortService, PageService, ExcelExportService, PdfExportService],
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  public data: any[] = [];
  @ViewChild('grid') public grid?: GridComponent;

  // grid config
  public editSettings?: Object;
  public loanIDRules?: Object;
  public borrowerRules?: Object;
  public amountRules?: Object;
  public documentTypeEditParams?: Object;
  public pageSettings?: Object;
  public toolbarOptions?: string[];
  public selectionSettings?: Object;
  public isDark: boolean = false;
  public exportMenuOpen: boolean = false;
  public exportFormats = ['CSV', 'PDF'];

  constructor(private loanService: LoanService) { }

  public ngOnInit(): void {
    // theme from localStorage (unchanged)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('app.theme');
        this.isDark = saved === 'dark';
      } else {
        this.isDark = false;
      }
    } catch (e) {
      this.isDark = false;
    }

    // grid editing settings
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Normal'
    };

    this.selectionSettings = { type: 'Single' };

    this.loanIDRules = { required: true, number: true };
    this.borrowerRules = { required: true };
    this.amountRules = { required: true, min: 1 };

    this.documentTypeEditParams = {
      params: {
        allowFiltering: true,
        filterType: 'Contains',
        popupHeight: '200px',
        placeholder: 'Select document type'
      }
    };

    this.pageSettings = { pageCount: 5, pageSize: 10 };
    this.toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Duplicate'];

    // load from backend (if API unavailable, it falls back to an empty array)
    this.loadFromServer();
  }

  // ---------------- Export helpers ----------------

  // toggle small dropdown menu (or use your own UI)
  public toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  // called when user selects a format
  public export(format: string): void {
    if (!this.grid) {
      window.alert('Grid not ready for export.');
      return;
    }

    const fmt = (format || '').toLowerCase();

    try {
      // export all pages (not only current page) by passing export options
      // csvExport and excelExport accept optional export properties; pdfExport accepts pdfExportProperties
      if (fmt === 'csv') {
        // csvExport has an optional argument (CsvExportProperties). Leaving default works too.
        (this.grid as any).csvExport({
          fileName: 'Loans.csv',
          exportType: 'All' // optional depending on version; Grid defaults often export all rows when called directly
        });
      } else if (fmt === 'excel') {
        (this.grid as any).excelExport({
          fileName: 'Loans.xlsx',
          exportType: 'All'
        });
      } else if (fmt === 'pdf') {
        // pdfExport accepts pdfExportProperties, ensure allowPdfExport is enabled on grid
        (this.grid as any).pdfExport({
          fileName: 'Loans.pdf',
          exportType: 'All', // set to 'CurrentPage' or 'All' depending on desired result / library version
          // pageOrientation: 'Landscape' // optional
        });
      }
    } catch (err) {
      console.error('Export failed', err);
      window.alert('Export failed — see console.');
    } finally {
      this.exportMenuOpen = false;
    }
  }

  /** ---------- Backend interactions (delegated to LoanService) ---------- */

  private async loadFromServer(): Promise<void> {
    try {
      const loans = await this.loanService.getAll();
      this.data = (loans || []).map(l => ({
        LoanID: l.LoanID ?? l.loanID,
        Borrower: l.Borrower ?? l.borrower,
        Amount: l.Amount ?? l.amount,
        Purpose: l.Purpose ?? l.purpose,
        Branch: l.Branch ?? l.branch,
        DocumentType: l.DocumentType ?? l.documentType,
        attachments: (() => {
          try {
            return JSON.parse(l.AttachmentsJson ?? l.attachmentsJson ?? '[]');
          } catch (e) {
            return [];
          }
        })()
      }));
    } catch (err) {
      console.error('Failed to load loans from server:', err);
      this.data = this.data || [];
    }
  }

  private async createLoanOnServer(record: any): Promise<any> {
    const payload = {
      LoanID: record.LoanID,
      Borrower: record.Borrower,
      Amount: record.Amount,
      Purpose: record.Purpose,
      Branch: record.Branch,
      DocumentType: record.DocumentType,
      AttachmentsJson: JSON.stringify(record.attachments || [])
    };
    return this.loanService.create(payload);
  }

  private async updateLoanOnServer(record: any): Promise<void> {
    const id = record.LoanID;
    const payload = {
      LoanID: record.LoanID,
      Borrower: record.Borrower,
      Amount: record.Amount,
      Purpose: record.Purpose,
      Branch: record.Branch,
      DocumentType: record.DocumentType,
      AttachmentsJson: JSON.stringify(record.attachments || [])
    };
    await this.loanService.update(id, payload);
  }

  private async deleteLoanOnServer(id: number): Promise<void> {
    await this.loanService.delete(id);
  }

  /** ---------- Grid + toolbar handlers (unchanged) ---------- */

  public toggleTheme(): void {
    this.isDark = !this.isDark;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('app.theme', this.isDark ? 'dark' : 'light');
      }
    } catch (e) { }
  }

  public onToolbarClick(args: ClickEventArgs): void {
    const id = (args as any).item.id;
    switch (id) {
      case 'add':
        this.grid?.addRecord();
        break;
      case 'edit':
        this.grid?.startEdit();
        break;
      case 'delete':
        this.grid?.deleteRecord();
        break;
      case 'update':
        this.grid?.endEdit();
        break;
      case 'cancel':
        this.grid?.closeEdit();
        break;
      case 'duplicate':
        this.duplicateSelectedRow();
        break;
      default:
        break;
    }
  }

  public async onActionComplete(args: any): Promise<void> {
    try {
      if (!args) return;

      // Save (add or edit)
      if (args.requestType === 'save') {
        const record = args.data;
        if (!record) return;

        if (args.action === 'add') {
          try {
            const created = await this.createLoanOnServer(record);
            await this.loadFromServer();
            const newId = created?.LoanID ?? created?.loanID;
            if (newId && this.grid) {
              setTimeout(() => {
                try {
                  const idx = (this.data || []).findIndex((r: any) => String(r.LoanID) === String(newId));
                  if (idx >= 0) (this.grid as any).selectRow(idx);
                } catch (e) { }
              }, 100);
            }
          } catch (err) {
            console.error('Failed to create loan on server', err);
            window.alert('Failed to create loan on server. See console.');
            await this.loadFromServer();
          }
        } else {
          try {
            await this.updateLoanOnServer(record);
            await this.loadFromServer();
          } catch (err) {
            console.error('Failed to update loan on server', err);
            window.alert('Failed to update loan on server. See console.');
            await this.loadFromServer();
          }
        }
      }

      // Delete
      if (args.requestType === 'delete') {
        const toDelete = Array.isArray(args.data) ? args.data : [args.data];
        for (const rec of toDelete) {
          try {
            const id = rec?.LoanID;
            if (id != null) {
              await this.deleteLoanOnServer(id);
            }
          } catch (err) {
            console.error('Failed to delete loan on server', err);
            window.alert('Failed to delete loan on server. See console.');
          }
        }
        await this.loadFromServer();
      }
    } catch (e) {
      console.error('onActionComplete error', e);
    }
  }

  public onActionBegin(args: any): void {
    if (args.requestType === 'add' && args.data) {
      if (!args.data.__tempId) {
        args.data.__tempId = 'tmp-' + Date.now();
      }
    }
  }

  private duplicateSelectedRow(): void {
    if (!this.grid) {
      return;
    }
    const selectedRecords: any[] = (this.grid as any).getSelectedRecords() || [];
    if (!selectedRecords || selectedRecords.length === 0) {
      window.alert('Please select one row to duplicate.');
      return;
    }
    const original = selectedRecords[0];
    const clone = JSON.parse(JSON.stringify(original));

    clone.LoanID = this.getNextLoanID();
    clone.attachments = (clone.attachments || []).map((x: any) => ({ ...x }));
    this.grid.addRecord(clone);

    setTimeout(() => {
      try {
        const rowIndex = (this.data as any[]).findIndex(r => String((r as any).LoanID) === String(clone.LoanID));
        if (rowIndex >= 0) {
          (this.grid as any).selectRow(rowIndex);
        }
      } catch (e) { /* ignore */ }
    }, 50);
  }

  private getNextLoanID(): number {
    try {
      const arr = (this.data as any[] || []).map(r => Number((r as any).LoanID)).filter(n => !isNaN(n));
      if (arr.length === 0) {
        return 1001;
      }
      return Math.max(...arr) + 1;
    } catch (e) {
      return Date.now();
    }
  }

  public openFileSelector(rowData: any): void {
    const loanId = rowData && (rowData.LoanID || rowData.LoanID === 0) ? rowData.LoanID : null;
    if (loanId) {
      const el = document.getElementById('file-input-' + loanId) as HTMLInputElement | null;
      if (el) {
        el.value = '';
        el.click();
        return;
      }
    }

    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.multiple = true;
    tempInput.style.display = 'none';

    const changeHandler = (ev: Event) => {
      try {
        this.onFileSelected(ev, rowData);
      } finally {
        tempInput.removeEventListener('change', changeHandler);
        if (tempInput.parentNode) tempInput.parentNode.removeChild(tempInput);
      }
    };

    tempInput.addEventListener('change', changeHandler);
    document.body.appendChild(tempInput);
    tempInput.click();
  }

  public onFileSelected(event: Event, rowData: any): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) {
      return;
    }

    rowData.attachments = rowData.attachments || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const objectUrl = URL.createObjectURL(file);
        rowData.attachments.push({
          name: file.name,
          type: file.type || this.getFileTypeFromName(file.name),
          url: objectUrl,
          size: file.size
        });
      } catch (err) {
        console.error('error creating object URL', err);
      }
    }
    try {
      (this.grid as any).refresh();
    } catch (e) {
      this.data = [...this.data];
    }
  }

  public onPreviewSelect(event: Event, rowData: any): void {
    const sel = event.target as HTMLSelectElement;
    const idxStr = sel.value;
    if (!idxStr) {
      return;
    }
    const idx = Number(idxStr);
    const file = rowData.attachments && rowData.attachments[idx];
    if (file && file.url) {
      window.open(file.url, '_blank');
    }
    sel.value = '';
  }

  private getFileTypeFromName(name: string): string {
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image/' + ext;
    if (ext === 'csv') return 'text/csv';
    return '';
  }
}
