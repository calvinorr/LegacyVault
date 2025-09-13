# Spec Requirements Document

> Spec: Renewal Reminder System
> Created: 2025-09-12
> Status: Planning

## Overview

Implement a comprehensive renewal reminder system that enables LegacyLock users to track policy start/end dates and receive automated email notifications before renewals. This system will support various UK financial products including insurance policies, subscriptions, and other recurring bills while providing flexible notification preferences and smart categorization of renewal types.

## User Stories

### Policy Date Management

As a household finance manager, I want to add start and end dates to my insurance policies and subscriptions, so that I can track when renewals are due and plan ahead for policy changes or shopping for better deals.

**Detailed Workflow:**
- User creates or edits an entry for Car Insurance, Home Insurance, or subscription
- User sees date picker fields for "Start Date" and "End Date" or "Renewal Date"
- System automatically calculates renewal cycle (annual, monthly, quarterly)
- User can set custom renewal reminder preferences (1 week, 2 weeks, 1 month before)
- System validates dates and warns about past renewal dates

### Automated Renewal Notifications

As a LegacyLock user, I want to receive email notifications before my policies expire, so that I don't forget to renew important insurance or subscriptions and can compare prices in advance.

**Detailed Workflow:**
- Background job runs daily to check for upcoming renewals
- System sends email notification at user-configured intervals before renewal
- Email includes entry details, renewal date, and link to edit/update policy
- User can mark renewal as "handled" or snooze for later reminder
- System tracks reminder history and delivery status

### Smart Renewal Categorization

As a user entering various bills and policies, I want the system to automatically identify which entries need renewal tracking, so that I don't have to manually configure every entry type.

**Detailed Workflow:**
- System recognizes renewal-relevant categories (Insurance, Subscriptions, Memberships)
- Automatically shows renewal date fields for applicable entry types
- Hides renewal options for utilities and one-time entries
- Provides suggested renewal cycles based on entry type and UK patterns
- Allows manual override for custom renewal schedules

## Spec Scope

1. **Database Schema Extension** - Add renewal tracking fields to Entry model with flexible date structures
2. **Renewal Date Management** - Frontend date pickers and renewal cycle detection in entry forms
3. **Background Notification System** - Cron job infrastructure for checking and sending renewal reminders
4. **Email Notification Service** - Integration with email provider for automated reminder delivery
5. **User Preference System** - Settings interface for notification timing and frequency preferences
6. **Renewal Dashboard** - Overview page showing upcoming renewals and reminder history
7. **Smart Category Detection** - Logic to identify which entry types require renewal tracking

## Out of Scope

- SMS or push notifications (email only for initial implementation)
- Calendar integration (Google Calendar, Outlook)
- Renewal price comparison or shopping features
- Bulk renewal operations across multiple entries
- Advanced analytics and reporting on renewal patterns

## Expected Deliverable

1. **Enhanced Entry Forms** - Users can add renewal dates to insurance policies and see automatic reminder settings
2. **Working Email Notifications** - Users receive email reminders 1-2 weeks before policy renewals with entry details and action links
3. **Renewal Dashboard** - Users can view upcoming renewals, modify reminder settings, and track notification history