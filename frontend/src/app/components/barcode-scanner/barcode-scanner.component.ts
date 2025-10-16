import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html'
})
export class BarcodeScannerComponent {
  @Output() barcodeScanned = new EventEmitter<string>();
  
  barcodeInput = '';
  showInput = false;

  toggleInput(): void {
    this.showInput = !this.showInput;
    if (!this.showInput) {
      this.barcodeInput = '';
    }
  }

  onBarcodeSubmit(): void {
    if (this.barcodeInput.trim()) {
      this.barcodeScanned.emit(this.barcodeInput.trim());
      this.barcodeInput = '';
      this.showInput = false;
    }
  }

  onBarcodeKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onBarcodeSubmit();
    }
  }
}
