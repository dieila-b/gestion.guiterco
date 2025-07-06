
export const generateFactureVenteStyles = (): string => {
  return `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 15px;
        background: white;
        color: #333;
        line-height: 1.3;
        font-size: 13px;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border: 1px solid #ddd;
      }
      
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 15px;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-logo img {
        width: 60px;
        height: 60px;
        margin-bottom: 8px;
      }
      
      .company-name {
        font-size: 20px;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 8px;
      }
      
      .company-details {
        font-size: 12px;
        line-height: 1.4;
        color: #666;
      }
      
      .invoice-info {
        text-align: right;
        flex: 1;
      }
      
      .invoice-details {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        border-left: 3px solid #0066cc;
      }
      
      .invoice-details h3 {
        margin: 0 0 10px 0;
        color: #0066cc;
        font-size: 14px;
      }
      
      .invoice-details p {
        margin: 5px 0;
        font-size: 12px;
      }
      
      .invoice-title {
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        color: #0066cc;
        margin: 20px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .client-section {
        margin-bottom: 20px;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
      }
      
      .client-section h3 {
        margin: 0 0 12px 0;
        color: #0066cc;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
      }
      
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      
      .client-field {
        display: flex;
        align-items: center;
        font-size: 12px;
      }
      
      .client-field label {
        font-weight: bold;
        margin-right: 8px;
        min-width: 70px;
        color: #555;
      }
      
      .client-field span {
        color: #333;
      }
      
      .articles-section {
        margin-bottom: 20px;
      }
      
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 11px;
      }
      
      .articles-table th {
        background: #0066cc;
        color: white;
        padding: 8px 6px;
        text-align: center;
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
      }
      
      .articles-table td {
        padding: 8px 6px;
        border-bottom: 1px solid #eee;
        text-align: center;
        font-size: 11px;
      }
      
      .articles-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .product-name {
        text-align: left !important;
        font-weight: 500;
        color: #333;
        max-width: 120px;
        word-wrap: break-word;
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
        margin-bottom: 20px;
      }
      
      .totals-right {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        border-left: 3px solid #0066cc;
        min-width: 280px;
      }
      
      .totals-right h4 {
        margin: 0 0 12px 0;
        color: #0066cc;
        font-size: 14px;
        text-align: center;
      }
      
      .total-line {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        padding: 6px 0;
        font-size: 12px;
      }
      
      .total-line.discount-line {
        color: #f57c00;
        font-weight: bold;
        border-top: 1px dashed #f57c00;
        border-bottom: 1px dashed #f57c00;
        background: rgba(245, 124, 0, 0.05);
      }
      
      .total-line.final {
        border-top: 2px solid #0066cc;
        font-weight: bold;
        font-size: 14px;
        color: #0066cc;
        margin-top: 12px;
        padding-top: 12px;
      }
      
      .total-line.economics {
        font-size: 11px;
        color: #f57c00;
        font-style: italic;
        border-top: 1px dotted #f57c00;
        margin-top: 8px;
        padding-top: 6px;
      }
      
      .status-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .status-box {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      .status-box h4 {
        margin: 0 0 10px 0;
        color: #0066cc;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-info {
        margin: 8px 0;
        font-size: 11px;
      }
      
      .status-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.3px;
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
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        border-left: 3px solid #0066cc;
      }
      
      .observations-section h4 {
        margin: 0 0 8px 0;
        color: #0066cc;
        font-size: 14px;
      }
      
      .observations-section p {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        color: #555;
      }
      
      .legal-mention {
        text-align: center;
        font-style: italic;
        color: #666;
        font-size: 11px;
        padding: 15px;
        border-top: 1px solid #ddd;
        margin-top: 20px;
      }
      
      @media print {
        body {
          padding: 0;
          background: white;
          font-size: 12px;
        }
        
        .invoice-container {
          max-width: none;
          border: none;
          box-shadow: none;
          padding: 15px;
        }
        
        .articles-table {
          font-size: 10px;
        }
        
        .articles-table th {
          font-size: 9px;
        }
        
        .articles-table td {
          font-size: 10px;
        }
        
        .status-section {
          page-break-inside: avoid;
        }
        
        .totals-section {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
};
