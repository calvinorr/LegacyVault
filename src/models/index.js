// src/models/index.js
// Central export file for all models to simplify imports

const User = require('./user');
const Entry = require('./entry');
const Category = require('./category');
const ReminderPreference = require('./reminderPreference');
const ReminderLog = require('./reminderLog');
const Document = require('./document');
const Contact = require('./contact');
const ImportSession = require('./ImportSession');
const RecurringDetectionRules = require('./RecurringDetectionRules');

module.exports = {
  User,
  Entry,
  Category,
  ReminderPreference,
  ReminderLog,
  Document,
  Contact,
  ImportSession,
  RecurringDetectionRules
};