
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
        font-size: 11px;
        line-height: 1.3;
        color: #333;
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
        border-bottom: 2px solid #e0e0e0;
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
        background: #f5f5f5;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ddd;
      }
      .company-logo img {
        max-width: 60px;
        max-height: 60px;
        object-fit: contain;
      }
      .company-name {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 6px;
      }
      .company-details {
        font-size: 9px;
        line-height: 1.4;
        color: #666;
      }
      .invoice-info {
        flex: 1;
        max-width: 45%;
        text-align: right;
      }
      .invoice-title {
        font-size: 24px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 15px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .invoice-details {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #e9ecef;
      }
      .invoice-details h3 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
      }
      .invoice-details p {
        margin: 4px 0;
        font-size: 10px;
      }
      .client-section {
        margin: 12px 0;
        background: #e8f4fd;
        padding: 8px;
        border-radius: 4px;
        border-left: 3px solid #007bff;
      }
      .client-section h3 {
        margin: 0 0 6px 0;
        font-size: 12px;
        color: #0056b3;
        text-transform: uppercase;
        font-weight: 600;
      }
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .client-field {
        display: flex;
        align-items: center;
        font-size: 10px;
      }
      .client-field label {
        font-weight: 600;
        margin-right: 6px;
        color: #6c757d;
        min-width: 50px;
      }
      .articles-section {
        margin: 15px 0;
      }
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #dee2e6;
        margin-bottom: 12px;
      }
      .articles-table th {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        padding: 6px 4px;
        text-align: center;
        font-weight: 600;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        border: 1px solid #0056b3;
      }
      .articles-table td {
        padding: 4px 3px;
        border: 1px solid #dee2e6;
        font-size: 9px;
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
      .totals-section {
        display: flex;
        justify-content: space-between;
        margin: 15px 0;
        gap: 20px;
      }
      .totals-left {
        flex: 1;
      }
      .totals-right {
        width: 280px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 8px;
      }
      .totals-right h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 3px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 10px;
      }
      .total-line.final {
        font-weight: bold;
        font-size: 12px;
        color: #2c3e50;
        border-top: 1px solid #495057;
        padding-top: 6px;
        margin-top: 6px;
      }
      .status-section {
        display: flex;
        gap: 15px;
        margin: 15px 0;
      }
      .status-box {
        flex: 1;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .status-box h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 3px;
      }
      .status-info {
        margin-bottom: 4px;
        font-size: 10px;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-left: 6px;
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
      .badge-unpaid {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      .badge-delivered {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .badge-pending {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      .highlight-messages {
        margin: 12px 0;
      }
      .message-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 6px;
        margin: 4px 0;
        font-size: 9px;
        color: #856404;
        display: flex;
        align-items: center;
      }
      .message-box::before {
        content: "ℹ️";
        margin-right: 6px;
        font-size: 12px;
      }
      .observations-section {
        margin: 12px 0;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        border-left: 3px solid #6c757d;
      }
      .observations-section h4 {
        margin: 0 0 4px 0;
        font-size: 11px;
        color: #495057;
        font-weight: 600;
      }
      .legal-mention {
        margin-top: 15px;
        padding: 8px;
        background: #e9ecef;
        border-radius: 4px;
        text-align: center;
        font-size: 10px;
        font-weight: 500;
        color: #495057;
        font-style: italic;
        border: 1px dashed #adb5bd;
      }
      @media print {
        body { margin: 0; padding: 5px; }
        .no-print { display: none !important; }
        .invoice-container { max-width: none; padding: 0; }
      }
    </style>
  `;
};
