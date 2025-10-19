// web/src/pages/EmploymentDetail.tsx
// Employment detail page - view and manage a specific employment and its child records

import React from 'react';
import { useParams } from 'react-router-dom';
import { ParentEntityDetail } from '../components/parent-entities/ParentEntityDetail';

export const EmploymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#0f172a',
        color: '#ef4444'
      }}>
        Employment ID not found
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <ParentEntityDetail domain="employments" parentId={id} />
    </div>
  );
};
