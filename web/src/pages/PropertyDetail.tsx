// web/src/pages/PropertyDetail.tsx
// Property detail page - view and manage a specific property and its child records

import React from 'react';
import { useParams } from 'react-router-dom';
import { ParentEntityDetail } from '../components/parent-entities/ParentEntityDetail';

export const PropertyDetail: React.FC = () => {
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
        Property ID not found
      </div>
    );
  }

  return <ParentEntityDetail domain="properties" parentId={id} />;
};
