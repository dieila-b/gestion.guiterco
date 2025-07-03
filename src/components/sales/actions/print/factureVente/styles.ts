
export const generateFactureVenteStyles = (): string => {
  return `
    <style>
      @page {
        size: A4;
        margin: 15mm;
      }
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        font-size: 12px;
        line-height: 1.4;
        color: #000;
      }
      .invoice-container {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        padding: 15px;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 1px solid #000;
        padding-bottom: 15px;
      }
      .company-info {
        flex: 1;
        max-width: 50%;
      }
      .company-logo {
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .company-logo img {
        max-width: 60px;
        max-height: 60px;
        object-fit: contain;
      }
      .company-name {
        font-size: 18px;
        font-weight: bold;
        color: #000;
        margin-bottom: 5px;
      }
      .company-details {
        font-size: 11px;
        line-height: 1.3;
        color: #000;
      }
      .invoice-info {
        flex: 1;
        max-width: 45%;
        text-align: right;
      }
      .invoice-details {
        background: #f8f9fa;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .invoice-details h3 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #000;
        font-weight: bold;
      }
      .invoice-details p {
        margin: 4px 0;
        font-size: 11px;
        color: #000;
      }
      .invoice-title {
        font-size: 24px;
        font-weight: bold;
        color: #000;
        margin: 15px 0;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .client-section {
        margin: 20px 0;
        background: #f8f9fa;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .client-section h3 {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #000;
        font-weight: bold;
      }
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .client-field {
        display: flex;
        align-items: center;
        font-size: 11px;
      }
      .client-field label {
        font-weight: bold;
        margin-right: 5px;
        color: #000;
        min-width: 60px;
      }
      .client-field span {
        color: #000;
      }
      .articles-section {
        margin: 20px 0;
      }
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        margin-bottom: 15px;
      }
      .articles-table th {
        background: #f0f0f0;
        color: #000;
        padding: 8px 6px;
        text-align: center;
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
        border: 1px solid #000;
      }
      .articles-table td {
        padding: 6px;
        border: 1px solid #000;
        font-size: 10px;
        text-align: center;
        color: #000;
      }
      .articles-table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .product-name {
        text-align: left !important;
        font-weight: normal;
        color: #000;
      }
      .quantity-delivered {
        color: #000;
        font-weight: normal;
      }
      .quantity-remaining {
        color: #000;
        font-weight: normal;
      }
      .discount-amount {
        color: #000;
        font-weight: normal;
      }
      .totals-section {
        display: flex;
        justify-content: space-between;
        margin: 20px 0;
        gap: 20px;
      }
      .totals-left {
        flex: 1;
      }
      .totals-right {
        width: 280px;
        background: #f8f9fa;
        border: 1px solid #000;
        border-radius: 4px;
        padding: 15px;
      }
      .totals-right h4 {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #000;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 11px;
        color: #000;
      }
      .total-line.final {
        font-weight: bold;
        font-size: 12px;
        color: #000;
        border-top: 1px solid #000;
        padding-top: 8px;
        margin-top: 8px;
      }
      .status-section {
        display: flex;
        gap: 15px;
        margin: 20px 0;
      }
      .status-box {
        flex: 1;
        background: #f8f9fa;
        border: 1px solid #000;
        border-radius: 4px;
        padding: 12px;
      }
      .status-box h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #000;
        font-weight: bold;
        border-bottom: 1px solid #000;
        padding-bottom: 4px;
      }
      .status-info {
        margin-bottom: 6px;
        font-size: 10px;
        color: #000;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: bold;
        text-transform: uppercase;
        margin-left: 5px;
      }
      .badge-partial {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      .badge-paid {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .badge-delivered {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .observations-section {
        margin: 15px 0;
        background: #f8f9fa;
        padding: 12px;
        border: 1px solid #000;
        border-radius: 4px;
      }
      .observations-section h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #000;
        font-weight: bold;
      }
      .observations-section p {
        margin: 0;
        font-size: 10px;
        color: #000;
      }
      .legal-mention {
        margin-top: 25px;
        padding: 12px;
        background: #f0f0f0;
        border: 1px solid #000;
        border-radius: 4px;
        text-align: center;
        font-size: 11px;
        color: #000;
        font-style: italic;
      }
      .legal-mention strong {
        font-weight: bold;
        color: #000;
      }
      @media print {
        body { margin: 0; padding: 5px; }
        .no-print { display: none !important; }
        .invoice-container { max-width: none; padding: 0; }
      }
    </style>
  `;
};
