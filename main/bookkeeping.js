'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TYPES = new Set(['income', 'expense']);
const PAYMENT = new Set(['private', 'business', 'cash', 'other']);
const euro = n => Math.round((Number(n) + Number.EPSILON) * 100);
function validDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}
function validate(x) {
  if (!x || typeof x !== 'object' || !TYPES.has(x.type)) throw Error('Invalid transaction type');
  if (!validDate(x.date)) throw Error('Invalid ISO date');
  if (typeof x.description !== 'string' || !x.description.trim() || x.description.length > 500) throw Error('Description required (max 500)');
  if (typeof x.amount !== 'number' || !Number.isFinite(x.amount) || x.amount <= 0 || euro(x.amount) <= 0 || Math.abs(x.amount * 100 - Math.round(x.amount * 100)) > 1e-7) throw Error('Amount must be positive EUR with two decimals');
  if (!PAYMENT.has(x.paymentSource)) throw Error('Invalid payment source');
  if (x.businessPercent === undefined || !Number.isInteger(x.businessPercent) || x.businessPercent < 0 || x.businessPercent > 100) throw Error('Business share must be 0–100');
  for (const key of ['project','category','documentReference','notes']) {
    if (x[key] !== undefined && (typeof x[key] !== 'string' || x[key].length > 500)) throw Error('Invalid '+key);
  }
}
class Ledger {
  constructor(directory) {
    this.directory = directory;
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    this.file = path.join(directory, 'ledger.jsonl');
    this.receipts = path.join(directory, 'receipts');
    fs.mkdirSync(this.receipts, {recursive:true});
  }
  events() {
    if (!fs.existsSync(this.file)) return [];
    return fs.readFileSync(this.file, 'utf8').split('\n').filter(Boolean).map((line, i) => {
      try { return JSON.parse(line); } catch { throw Error('Corrupt ledger at line '+(i+1)); }
    });
  }
  list() {
    const active = new Map();
    const receiptEvents = new Map();
    for (const e of this.events()) {
      if (e.action === 'add') active.set(e.id, e);
      else if (e.action === 'void') active.delete(e.target);
      else if (e.action === 'receipt') receiptEvents.set(e.target, e);
      else throw Error('Unknown ledger event');
    }
    return [...active.values()].map(e => ({...e, receipt:receiptEvents.get(e.id) || null}));
  }
  add(input) {
    validate(input);
    const entry = {
      id: crypto.randomUUID(), action: 'add', recordedAt: new Date().toISOString(),
      date: input.date, type: input.type, description: input.description.trim(),
      amountCents: euro(input.amount), paymentSource: input.paymentSource,
      businessPercent: input.businessPercent, project: input.project || '',
      category: input.category || '', documentReference: input.documentReference || '',
      notes: input.notes || '', taxReviewRequired: true
    };
    fs.appendFileSync(this.file, JSON.stringify(entry)+'\n', { encoding: 'utf8', mode: 0o600 });
    return entry;
  }
  void(id, reason) {
    if (!this.list().some(e => e.id === id)) throw Error('Entry not found');
    if (typeof reason !== 'string' || !reason.trim()) throw Error('Correction reason required');
    const event = { action:'void', id:crypto.randomUUID(), target:id, reason:reason.trim(), recordedAt:new Date().toISOString() };
    fs.appendFileSync(this.file, JSON.stringify(event)+'\n', 'utf8');
    return event;
  }
  summary(year) {
    if (!Number.isInteger(year) || year < 2000 || year > 2200) throw Error('Invalid year');
    const entries = this.list().filter(e => e.date.startsWith(year+'-'));
    const incomeCents = entries.filter(e => e.type === 'income').reduce((s,e) => s + e.amountCents, 0);
    const expenseCents = entries.filter(e => e.type === 'expense').reduce((s,e) => s + Math.round(e.amountCents * e.businessPercent / 100), 0);
    return { year, incomeCents, potentialBusinessExpenseCents: expenseCents, provisionalDifferenceCents: incomeCents-expenseCents, requiresTaxReview:true, count:entries.length };
  }
  csv(year) {
    const fields = ['date','type','description','amountCents','paymentSource','businessPercent','project','category','documentReference','notes','taxReviewRequired','id'];
    const quote = v => '"'+String(v ?? '').replace(/"/g,'""')+'"';
    return '\uFEFF'+fields.join(';')+'\r\n'+this.list().filter(e => e.date.startsWith(year+'-')).map(e => fields.map(k => quote(e[k])).join(';')).join('\r\n');
  }
}
module.exports = { Ledger, validate };
