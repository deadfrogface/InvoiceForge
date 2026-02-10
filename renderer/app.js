(function () {
  'use strict';

  const api = window.invoiceForge;
  if (!api) {
    console.error('invoiceForge API nicht verfügbar (Preload).');
    return;
  }

  const ids = {
    companyName: 'companyName',
    companyAddress: 'companyAddress',
    companyVatId: 'companyVatId',
    taxRate: 'taxRate',
    companyBank: 'companyBank',
    customerName: 'customerName',
    customerAddress: 'customerAddress',
    invoiceNumber: 'invoiceNumber',
    invoiceDate: 'invoiceDate',
    dueDate: 'dueDate',
    positionsBody: 'positionsBody',
    subtotal: 'subtotal',
    taxAmount: 'taxAmount',
    grandTotal: 'grandTotal',
  };

  const btnSaveCompany = document.getElementById('btnSaveCompany');
  const btnAddPosition = document.getElementById('btnAddPosition');
  const btnCreatePdf = document.getElementById('btnCreatePdf');

  let rowIndex = 0;

  let messageTimeoutId = null;

  function showMessage(text, type) {
    const bar = document.getElementById('messageBar');
    if (!bar) {
      // Fallback, falls das Element nicht existiert
      alert(text);
      return;
    }

    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
      messageTimeoutId = null;
    }

    bar.textContent = text;
    bar.className = 'message' + (type ? ' ' + type : '');
    bar.classList.remove('hidden');

    messageTimeoutId = setTimeout(() => {
      bar.classList.add('hidden');
    }, 8000);
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  function addPositionRow(desc = '', qty = 1, price = 0) {
    const tbody = getEl(ids.positionsBody);
    const tr = document.createElement('tr');
    tr.dataset.rowIndex = String(rowIndex++);
    tr.innerHTML =
      '<td><input type="text" class="input-desc" placeholder="Beschreibung" value="' + escapeHtml(desc) + '"></td>' +
      '<td><input type="number" class="input-qty" min="0" step="1" value="' + Number(qty) + '"></td>' +
      '<td><input type="number" class="input-price" min="0" step="0.01" value="' + Number(price) + '"></td>' +
      '<td class="cell-total">0,00</td>' +
      '<td><button type="button" class="btn-remove" title="Entfernen">×</button></td>';
    tbody.appendChild(tr);

    tr.querySelector('.input-qty').addEventListener('input', recalc);
    tr.querySelector('.input-price').addEventListener('input', recalc);
    tr.querySelector('.btn-remove').addEventListener('click', () => {
      tr.remove();
      recalc();
    });
    recalc();
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function recalc() {
    const rows = getEl(ids.positionsBody).querySelectorAll('tr');
    let sub = 0;
    rows.forEach((tr) => {
      const qty = parseFloat(tr.querySelector('.input-qty').value) || 0;
      const price = parseFloat(tr.querySelector('.input-price').value) || 0;
      const total = qty * price;
      sub += total;
      tr.querySelector('.cell-total').textContent = formatMoney(total);
    });

    const taxRate = parseFloat(getEl(ids.taxRate).value) || 0;
    const tax = sub * (taxRate / 100);
    const grand = sub + tax;

    getEl(ids.subtotal).textContent = formatMoney(sub);
    getEl(ids.taxAmount).textContent = formatMoney(tax);
    getEl(ids.grandTotal).textContent = formatMoney(grand);
  }

  function formatMoney(n) {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
  }

  function getFormData() {
    const rows = [];
    getEl(ids.positionsBody).querySelectorAll('tr').forEach((tr) => {
      rows.push({
        description: tr.querySelector('.input-desc').value.trim(),
        qty: parseFloat(tr.querySelector('.input-qty').value) || 0,
        price: parseFloat(tr.querySelector('.input-price').value) || 0,
      });
    });
    return {
      company: {
        name: getEl(ids.companyName).value.trim(),
        address: getEl(ids.companyAddress).value.trim(),
        vatId: getEl(ids.companyVatId).value.trim(),
        taxRate: parseFloat(getEl(ids.taxRate).value) || 0,
        bank: getEl(ids.companyBank).value.trim(),
      },
      customer: {
        name: getEl(ids.customerName).value.trim(),
        address: getEl(ids.customerAddress).value.trim(),
      },
      invoice: {
        number: getEl(ids.invoiceNumber).value.trim(),
        date: getEl(ids.invoiceDate).value,
        dueDate: getEl(ids.dueDate).value,
      },
      positions: rows,
    };
  }

  function validate(data) {
    if (!data.company.name) return 'Bitte Firmennamen angeben.';
    if (!data.customer.name) return 'Bitte Kundennamen angeben.';
    if (!data.invoice.number) return 'Bitte Rechnungsnummer angeben.';
    if (!data.invoice.date) return 'Bitte Rechnungsdatum angeben.';
    if (data.positions.length === 0) return 'Mindestens eine Position erforderlich.';
    const invalid = data.positions.some((p) => !p.description || p.qty <= 0 || p.price < 0);
    if (invalid) return 'Alle Positionen müssen Beschreibung, Menge > 0 und Einzelpreis haben.';
    return null;
  }

  function buildPdf(data) {
    const JsPDF = (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default || window.jspdf)) || window.jspdf;
    if (!JsPDF) throw new Error('jsPDF nicht geladen.');
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 20;
    let y = margin;

    doc.setFontSize(14);
    doc.text(data.company.name, margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(data.company.address.split('\n').join(' | '), margin, y);
    y += 5;
    if (data.company.vatId) {
      doc.text('USt-ID: ' + data.company.vatId, margin, y);
      y += 6;
    }
    y += 5;

    doc.setFontSize(10);
    doc.text('Kunde: ' + data.customer.name, 110, margin);
    doc.text(data.customer.address.split('\n').join(' | '), 110, margin + 5);

    y += 5;
    doc.text('Rechnung Nr. ' + data.invoice.number + '  |  Datum: ' + data.invoice.date + (data.invoice.dueDate ? '  |  Fällig: ' + data.invoice.dueDate : ''), margin, y);
    y += 12;

    const tableBody = data.positions.map((p) => [
      p.description,
      String(p.qty),
      formatMoney(p.price),
      formatMoney(p.qty * p.price),
    ]);
    const headers = ['Beschreibung', 'Menge', 'Einzelpreis (€)', 'Gesamt (€)'];

    doc.autoTable({
      startY: y,
      head: [headers],
      body: tableBody,
      theme: 'grid',
      margin: { left: margin },
      columnStyles: { 0: { cellWidth: 75 }, 1: { cellWidth: 22 }, 2: { cellWidth: 35 }, 3: { cellWidth: 35 } },
    });
    y = doc.lastAutoTable.finalY + 10;

    const sub = data.positions.reduce((s, p) => s + p.qty * p.price, 0);
    const tax = sub * (data.company.taxRate / 100);
    const grand = sub + tax;

    doc.setFontSize(10);
    doc.text('Zwischensumme (netto): ' + formatMoney(sub), margin, y);
    y += 6;
    doc.text('Steuer (' + data.company.taxRate + '%): ' + formatMoney(tax), margin, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Gesamtbetrag (brutto): ' + formatMoney(grand), margin, y);

    if (data.company.bank) {
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Bankverbindung: ' + data.company.bank.replace(/\n/g, ' | '), margin, y);
    }

    return doc;
  }

  async function createPdf() {
    const data = getFormData();
    const err = validate(data);
    if (err) {
      showMessage(err, 'error');
      return;
    }
    const doc = buildPdf(data);
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    const defaultName = 'Rechnung_' + (data.invoice.number || 'Nr') + '_' + (data.customer.name || 'Kunde').replace(/[^a-zA-Z0-9äöüÄÖÜß\-]/g, '_') + '.pdf';
    const result = await api.saveFile({ content: pdfBase64, defaultName });
    if (result.ok) {
      const num = parseInt(data.invoice.number, 10);
      if (!isNaN(num)) await api.saveLastInvoiceNumber(num);
      showMessage('PDF gespeichert: ' + result.filePath, 'success');
    }
  }

  function initDates() {
    const today = new Date().toISOString().slice(0, 10);
    getEl(ids.invoiceDate).value = today;
    const due = new Date();
    due.setDate(due.getDate() + 14);
    getEl(ids.dueDate).value = due.toISOString().slice(0, 10);
  }

  async function loadStored() {
    try {
      const company = await api.getCompanyData();
      if (company.name !== undefined) getEl(ids.companyName).value = company.name;
      if (company.address !== undefined) getEl(ids.companyAddress).value = company.address;
      if (company.vatId !== undefined) getEl(ids.companyVatId).value = company.vatId;
      if (company.taxRate !== undefined) getEl(ids.taxRate).value = company.taxRate;
      if (company.bank !== undefined) getEl(ids.companyBank).value = company.bank;

      const lastNum = await api.getLastInvoiceNumber();
      if (lastNum > 0) getEl(ids.invoiceNumber).value = String(lastNum + 1);
    } catch (e) {
      console.error('Laden der gespeicherten Daten:', e);
    }
  }

  getEl(ids.taxRate).addEventListener('input', recalc);

  btnSaveCompany.addEventListener('click', async () => {
    const data = getFormData();
    await api.saveCompanyData(data.company);
    showMessage('Firmendaten gespeichert.', 'success');
  });

  btnAddPosition.addEventListener('click', () => addPositionRow());
  btnCreatePdf.addEventListener('click', createPdf);

  addPositionRow();
  initDates();
  loadStored();
  recalc();
})();
