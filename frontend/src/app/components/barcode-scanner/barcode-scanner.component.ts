import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.css']
})
export class BarcodeScannerComponent {
  @Output() barcodeScanned = new EventEmitter<string>();
  
  barcodeInput = '';

  onBarcodeSubmit(): void {
    if (this.barcodeInput.trim()) {
      this.barcodeScanned.emit(this.barcodeInput.trim());
      this.barcodeInput = '';
    }
  }

  onBarcodeKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onBarcodeSubmit();
    }
  }
}
