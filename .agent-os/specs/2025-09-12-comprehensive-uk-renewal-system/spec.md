# Spec Requirements Document

> Spec: Comprehensive UK Household Renewal System
> Created: 2025-09-12
> Status: Planning

## Overview

Implement a comprehensive UK household renewal reminder system that covers the full spectrum of financial products, contracts, and obligations with terms, end dates, or renewal requirements. This system will support everything from 25-year mortgage renewals to 12-month MOT reminders to 2-year mobile contract end dates, with intelligent categorization, UK-specific terminology, and sophisticated notification patterns.

## User Stories

### Comprehensive UK Product Coverage

As a UK household finance manager, I want to track renewal dates for ALL my household financial obligations - from car finance and mobile contracts to TV licences and mortgage deals - so that I never miss important deadlines that could affect my finances or legal compliance.

**Detailed Workflow:**
- User can add renewal tracking to any entry type based on comprehensive UK product categories
- System automatically suggests appropriate renewal patterns based on product type
- User sees UK-specific terminology and validation for each product category
- System provides category-specific reminder schedules (e.g., MOT gets different reminders than insurance)
- User can override default settings for any product while maintaining smart defaults

### Category-Specific Intelligence

As a user managing diverse UK financial products, I want the system to understand the different nature of my commitments - that a mortgage fixed rate review is different from a gym membership renewal - so that I get appropriate reminders and terminology for each type.

**Detailed Workflow:**
- System recognizes 15+ major UK product categories with subcategories
- Each category has specific reminder patterns (e.g., Government obligations get longer notice periods)
- Terminology adapts to product type (renewal vs expiry vs review vs end date)
- Smart defaults consider UK regulatory requirements (e.g., MOT cannot be early)
- User gets contextual help and validation for each product type

### Flexible End Date Management

As a household manager with various commitments, I want to handle different types of "end dates" - some that auto-renew, some that require action, some that are fixed terms - so that the system matches how these products actually work in the UK market.

**Detailed Workflow:**
- System supports multiple end date types: renewal, expiry, review, termination
- Auto-renewal products get different reminder patterns than manual renewals
- Fixed-term products (like car finance) show countdown to final payment
- Review dates (like mortgage rates) trigger comparison shopping reminders
- Government obligations show legal compliance implications

## Spec Scope

1. **Comprehensive UK Product Categories** - Expand category system to cover 100+ UK household financial products across 15+ major categories
2. **Category-Specific Reminder Logic** - Implement intelligent reminder patterns tailored to each product type with UK regulatory awareness
3. **UK Financial Terminology Engine** - Proper terminology, validation, and help text for each UK product category
4. **Flexible End Date Types** - Support for renewal, expiry, review, termination, and completion date types with different behaviours
5. **Smart Default Settings** - Category-specific default reminder schedules based on UK market norms and regulatory requirements
6. **Enhanced Entry Forms** - Dynamic form fields that adapt based on product category selection with contextual help
7. **Advanced Notification Engine** - Multi-tier reminder system with escalation patterns and category-specific messaging

## Out of Scope

- Price comparison integration or shopping recommendations
- Automatic contract renewal functionality
- Integration with provider systems for automatic updates
- Advanced analytics beyond basic reminder effectiveness
- SMS or mobile app notifications (email and web only)

## Expected Deliverable

1. **Complete UK Product Coverage** - Users can track renewal dates for any UK household financial product with appropriate categorization and terminology
2. **Intelligent Reminder System** - Users receive category-appropriate reminders (e.g., 6-month notice for mortgage reviews, 1-month for MOT reminders)
3. **Enhanced User Experience** - Forms and interfaces that understand UK financial products and guide users with appropriate terminology and validation