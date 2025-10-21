// web/src/pages/FinanceDetail.tsx
// Finance detail page - view and manage a specific finance category and its child records

import React from 'react';
import { useParams } from 'react-router-dom';
import { ParentEntityDetail } from '../components/parent-entities/ParentEntityDetail';

export const FinanceDetail: React.FC = () => {
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
        Finance ID not found
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
      <ParentEntityDetail domain="finance" parentId={id} />
    </div>
  );
};
