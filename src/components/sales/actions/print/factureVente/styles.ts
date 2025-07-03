
export const generateFactureVenteStyles = (): string => {
  return `
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        font-size: 11px;
        line-height: 1.4;
        color: #333;
      }
      .invoice-container {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        padding: 20px;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 20px;
      }
      .company-info {
        flex: 1;
        max-width: 50%;
      }
      .company-logo {
        width: 80px;
        height: 80px;
        margin-bottom: 15px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ddd;
      }
      .company-logo img {
        max-width: 70px;
        max-height: 70px;
        object-fit: contain;
      }
      .company-name {
        font-size: 18px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 8px;
      }
      .company-details {
        font-size: 10px;
        line-height: 1.5;
        color: #666;
      }
      .invoice-info {
        flex: 1;
        max-width: 45%;
        text-align: right;
      }
      .invoice-title {
        font-size: 28px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 20px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .invoice-details {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #e9ecef;
      }
      .invoice-details h3 {
        margin: 0 0 12px 0;
        font-size: 12px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
      }
      .invoice-details p {
        margin: 6px 0;
        font-size: 11px;
      }
      .client-section {
        margin: 25px 0;
        background: #fff8e1;
        padding: 20px;
        border-radius: 6px;
        border-left: 4px solid #ffc107;
      }
      .client-section h3 {
        margin: 0 0 15px 0;
        font-size: 14px;
        color: #e65100;
        text-transform: uppercase;
        font-weight: 600;
      }
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .client-field {
        display: flex;
        align-items: center;
      }
      .client-field label {
        font-weight: 600;
        margin-right: 8px;
        color: #6c757d;
        min-width: 60px;
      }
      .articles-section {
        margin: 30px 0;
      }
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #dee2e6;
        margin-bottom: 20px;
      }
      .articles-table th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 8px;
        text-align: center;
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: 1px solid #5a6cb8;
      }
      .articles-table td {
        padding: 10px 8px;
        border: 1px solid #dee2e6;
        font-size: 10px;
        text-align: center;
      }
      .articles-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      .articles-table tbody tr:hover {
        background-color: #e3f2fd;
      }
      .product-name {
        text-align: left !important;
        font-weight: 500;
        color: #2c3e50;
      }
      .quantity-delivered {
        color: #28a745;
        font-weight: 600;
      }
      .quantity-remaining {
        color: #dc3545;
        font-weight: 600;
      }
      .discount-amount {
        color: #dc3545;
        font-weight: 600;
      }
      .totals-section {
        display: flex;
        justify-content: space-between;
        margin: 30px 0;
        gap: 30px;
      }
      .totals-left {
        flex: 1;
      }
      .totals-right {
        width: 320px;
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        padding: 20px;
      }
      .totals-right h4 {
        margin: 0 0 15px 0;
        font-size: 12px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 8px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 11px;
      }
      .total-line.final {
        font-weight: bold;
        font-size: 14px;
        color: #2c3e50;
        border-top: 2px solid #495057;
        padding-top: 12px;
        margin-top: 15px;
      }
      .status-section {
        display: flex;
        gap: 20px;
        margin: 30px 0;
      }
      .status-box {
        flex: 1;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .status-box h4 {
        margin: 0 0 15px 0;
        font-size: 12px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 8px;
      }
      .status-info {
        margin-bottom: 10px;
        font-size: 11px;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 8px;
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
      .highlight-messages {
        margin: 25px 0;
      }
      .message-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        padding: 12px;
        margin: 10px 0;
        font-size: 10px;
        color: #856404;
        display: flex;
        align-items: center;
      }
      .message-box::before {
        content: "ℹ️";
        margin-right: 8px;
        font-size: 14px;
      }
      .observations-section {
        margin: 25px 0;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #6c757d;
      }
      .observations-section h4 {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #495057;
        font-weight: 600;
      }
      .legal-mention {
        margin-top: 40px;
        padding: 20px;
        background: #e9ecef;
        border-radius: 6px;
        text-align: center;
        font-size: 11px;
        font-weight: 500;
        color: #495057;
        font-style: italic;
        border: 1px dashed #adb5bd;
      }
      @media print {
        body { margin: 0; padding: 10px; }
        .no-print { display: none !important; }
        .invoice-container { max-width: none; padding: 0; }
      }
    </style>
  `;
};
