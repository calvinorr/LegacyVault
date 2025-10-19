// web/src/pages/VehicleDetail.tsx
// Vehicle detail page - view and manage a specific vehicle and its child records

import React from 'react';
import { useParams } from 'react-router-dom';
import { ParentEntityDetail } from '../components/parent-entities/ParentEntityDetail';

export const VehicleDetail: React.FC = () => {
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
        Vehicle ID not found
      </div>
    );
  }

  return <ParentEntityDetail domain="vehicles" parentId={id} />;
};
