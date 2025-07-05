
export const generateFactureVenteStyles = (): string => {
  return `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 20px;
        background: white;
        color: #333;
        line-height: 1.4;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border: 1px solid #ddd;
      }
      
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 20px;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-logo img {
        width: 80px;
        height: 80px;
        margin-bottom: 10px;
      }
      
      .company-name {
        font-size: 24px;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 10px;
      }
      
      .company-details {
        font-size: 14px;
        line-height: 1.6;
        color: #666;
      }
      
      .invoice-info {
        text-align: right;
        flex: 1;
      }
      
      .invoice-details {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #0066cc;
      }
      
      .invoice-details h3 {
        margin: 0 0 15px 0;
        color: #0066cc;
        font-size: 16px;
      }
      
      .invoice-details p {
        margin: 8px 0;
        font-size: 14px;
      }
      
      .invoice-title {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        color: #0066cc;
        margin: 30px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .client-section {
        margin-bottom: 30px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
      }
      
      .client-section h3 {
        margin: 0 0 15px 0;
        color: #0066cc;
        font-size: 16px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
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
        font-weight: bold;
        margin-right: 10px;
        min-width: 80px;
        color: #555;
      }
      
      .client-field span {
        color: #333;
      }
      
      .articles-section {
        margin-bottom: 30px;
      }
      
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .articles-table th {
        background: #0066cc;
        color: white;
        padding: 12px 8px;
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
      }
      
      .articles-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #eee;
        text-align: center;
        font-size: 13px;
      }
      
      .articles-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .articles-table tr:hover {
        background: #e3f2fd;
      }
      
      .product-name {
        text-align: left !important;
        font-weight: 500;
        color: #333;
      }
      
      .discount-amount {
        color: #f57c00 !important;
        font-weight: bold;
      }
      
      .quantity-delivered {
        color: #4caf50;
        font-weight: bold;
      }
      
      .quantity-remaining {
        color: #ff9800;
        font-weight: bold;
      }
      
      .totals-section {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 30px;
      }
      
      .totals-right {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #0066cc;
        min-width: 300px;
      }
      
      .totals-right h4 {
        margin: 0 0 15px 0;
        color: #0066cc;
        font-size: 16px;
        text-align: center;
      }
      
      .total-line {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        padding: 8px 0;
        font-size: 14px;
      }
      
      .total-line.discount-line {
        color: #f57c00;
        font-weight: bold;
        border-top: 1px dashed #f57c00;
        border-bottom: 1px dashed #f57c00;
      }
      
      .total-line.final {
        border-top: 2px solid #0066cc;
        font-weight: bold;
        font-size: 16px;
        color: #0066cc;
        margin-top: 15px;
        padding-top: 15px;
      }
      
      .status-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .status-box {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .status-box h4 {
        margin: 0 0 15px 0;
        color: #0066cc;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .status-info {
        margin: 10px 0;
        font-size: 13px;
      }
      
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-badge.paid {
        background: #e8f5e8;
        color: #2e7d32;
      }
      
      .status-badge.partial {
        background: #fff3e0;
        color: #f57c00;
      }
      
      .status-badge.unpaid {
        background: #ffebee;
        color: #d32f2f;
      }
      
      .status-badge.delivered {
        background: #e8f5e8;
        color: #2e7d32;
      }
      
      .status-badge.partial-delivery {
        background: #fff3e0;
        color: #f57c00;
      }
      
      .status-badge.pending {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      .observations-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        border-left: 4px solid #0066cc;
      }
      
      .observations-section h4 {
        margin: 0 0 10px 0;
        color: #0066cc;
        font-size: 16px;
      }
      
      .observations-section p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #555;
      }
      
      .legal-mention {
        text-align: center;
        font-style: italic;
        color: #666;
        font-size: 13px;
        padding: 20px;
        border-top: 1px solid #ddd;
        margin-top: 30px;
      }
      
      @media print {
        body {
          padding: 0;
          background: white;
        }
        
        .invoice-container {
          max-width: none;
          border: none;
          box-shadow: none;
          padding: 20px;
        }
        
        .status-section {
          page-break-inside: avoid;
        }
        
        .articles-table {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
};
