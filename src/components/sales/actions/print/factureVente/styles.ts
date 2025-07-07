
export const generateFactureVenteStyles = (): string => {
  return `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 10px;
        background: white;
        color: #333;
        line-height: 1.2;
        font-size: 12px;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 15px;
        border: 1px solid #ddd;
        min-height: 100vh;
        box-sizing: border-box;
      }
      
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 12px;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-logo img {
        width: 50px;
        height: 50px;
        margin-bottom: 6px;
      }
      
      .company-name {
        font-size: 18px;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 6px;
      }
      
      .company-details {
        font-size: 11px;
        line-height: 1.3;
        color: #666;
      }
      
      .invoice-info {
        text-align: right;
        flex: 1;
      }
      
      .invoice-details {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 5px;
        border-left: 3px solid #0066cc;
      }
      
      .invoice-details h3 {
        margin: 0 0 8px 0;
        color: #0066cc;
        font-size: 13px;
      }
      
      .invoice-details p {
        margin: 4px 0;
        font-size: 11px;
      }
      
      .invoice-title {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: #0066cc;
        margin: 15px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .client-section {
        margin-bottom: 15px;
        background: #f8f9fa;
        padding: 12px;
        border-radius: 5px;
      }
      
      .client-section h3 {
        margin: 0 0 8px 0;
        color: #0066cc;
        font-size: 13px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 6px;
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
        margin-right: 6px;
        min-width: 60px;
        color: #555;
      }
      
      .client-field span {
        color: #333;
      }
      
      .articles-section {
        margin-bottom: 15px;
      }
      
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 10px;
      }
      
      .articles-table th {
        background: #0066cc;
        color: white;
        padding: 6px 4px;
        text-align: center;
        font-weight: bold;
        font-size: 9px;
        text-transform: uppercase;
      }
      
      .articles-table td {
        padding: 6px 4px;
        border-bottom: 1px solid #eee;
        text-align: center;
        font-size: 10px;
      }
      
      .articles-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .product-name {
        text-align: left !important;
        font-weight: 500;
        color: #333;
        max-width: 100px;
        word-wrap: break-word;
      }
      
      .remise-amount {
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
        margin-bottom: 15px;
      }
      
      .totals-right {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        border-left: 3px solid #0066cc;
        min-width: 220px;
        max-width: 260px;
      }
      
      .totals-right h4 {
        margin: 0 0 8px 0;
        color: #0066cc;
        font-size: 12px;
        text-align: center;
      }
      
      .total-line {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        padding: 4px 0;
        font-size: 11px;
      }
      
      .total-line.remise-line {
        color: #f57c00;
        font-weight: bold;
        border-top: 1px dashed #f57c00;
        border-bottom: 1px dashed #f57c00;
        background: rgba(245, 124, 0, 0.05);
      }
      
      .total-line.final {
        border-top: 2px solid #0066cc;
        font-weight: bold;
        font-size: 13px;
        color: #0066cc;
        margin-top: 8px;
        padding-top: 8px;
      }
      
      .status-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 15px;
      }
      
      .status-box {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        padding: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      .status-box h4 {
        margin: 0 0 8px 0;
        color: #0066cc;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-info {
        margin: 6px 0;
        font-size: 10px;
      }
      
      .status-badge {
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 9px;
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
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 15px;
        border-left: 3px solid #0066cc;
      }
      
      .observations-section h4 {
        margin: 0 0 6px 0;
        color: #0066cc;
        font-size: 12px;
      }
      
      .observations-section p {
        margin: 0;
        font-size: 11px;
        line-height: 1.3;
        color: #555;
      }
      
      .legal-mention {
        text-align: center;
        font-style: italic;
        color: #666;
        font-size: 10px;
        padding: 10px;
        border-top: 1px solid #ddd;
        margin-top: 15px;
      }
      
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          padding: 0;
          background: white;
          font-size: 11px;
        }
        
        .invoice-container {
          max-width: none;
          border: none;
          box-shadow: none;
          padding: 10px;
          min-height: auto;
        }
        
        .articles-table {
          font-size: 9px;
        }
        
        .articles-table th {
          font-size: 8px;
        }
        
        .articles-table td {
          font-size: 9px;
        }
        
        .status-section {
          page-break-inside: avoid;
        }
        
        .totals-section {
          page-break-inside: avoid;
        }
        
        .legal-mention {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
};
