# Spec Requirements Document

> Spec: Category Management Foundation
> Created: 2025-09-09
> Status: Planning

## Overview

Implement a hierarchical category management system that allows users to organize and categorize their financial entries (bank accounts, utilities, policies, etc.) with support for multi-level categorization and future transaction-to-entry conversion workflows.

## User Stories

### Category Management for Financial Organization

As a LegacyLock user, I want to create and manage categories for my financial entries, so that I can organize my household finances more effectively and prepare for automated transaction categorization.

**Detailed Workflow:**
1. User navigates to Settings page and accesses Category Management section
2. User can create new categories with names, descriptions, and parent categories
3. User can view categories in a hierarchical tree structure
4. User can edit existing categories (name, description, parent relationship)
5. User can delete categories (with appropriate warnings if entries are linked)
6. Categories are immediately available for assignment to new or existing entries

### Admin Category System Setup

As a LegacyLock admin, I want to set up foundational categories for the system, so that all users have a consistent categorization structure to build upon.

**Detailed Workflow:**
1. Admin creates standard UK financial categories (e.g., "Banking", "Utilities", "Insurance")
2. Admin can create sub-categories within main categories (e.g., "Banking > Current Accounts", "Utilities > Council Tax")
3. System supports unlimited nesting levels for future expansion
4. Admin can mark certain categories as "system" categories that regular users cannot delete

## Spec Scope

1. **Category Data Model** - MongoDB schema with hierarchical structure supporting parent-child relationships
2. **Category API Endpoints** - REST API for CRUD operations on categories with proper validation
3. **Category Management UI** - React components integrated into Settings page for category administration
4. **Category Assignment Foundation** - Basic infrastructure to link categories to entries (without full implementation)
5. **UK Financial Category Seeding** - Default categories relevant to UK household finances

## Out of Scope

- Assignment of categories to existing entries (Stage 2)
- Transaction parsing and auto-categorization (Stage 3)
- Category-based reporting and analytics (Stage 4)
- Bulk category operations
- Category import/export functionality
- Advanced permissions beyond admin/user distinction

## Expected Deliverable

1. **Functional Category Management**: Users can create, edit, and delete categories through the Settings page
2. **Hierarchical Category Display**: Categories appear in a tree structure showing parent-child relationships
3. **API Integration**: All category operations work through proper REST endpoints with error handling