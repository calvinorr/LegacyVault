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
        color: '#ef4444'
      }}>
        Employment ID not found
      </div>
    );
  }

  return <ParentEntityDetail domain="employments" parentId={id} />;
};
