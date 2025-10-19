// web/src/pages/ServiceDetail.tsx
// Service provider detail page - view and manage a specific service provider and its child records

import React from 'react';
import { useParams } from 'react-router-dom';
import { ParentEntityDetail } from '../components/parent-entities/ParentEntityDetail';

export const ServiceDetail: React.FC = () => {
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
        Service Provider ID not found
      </div>
    );
  }

  return <ParentEntityDetail domain="services" parentId={id} />;
};
