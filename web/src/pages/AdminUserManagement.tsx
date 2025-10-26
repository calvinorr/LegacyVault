// web/src/pages/AdminUserManagement.tsx
// Admin user management page - approve users and manage roles

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Shield, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  approved: boolean;
  createdAt: string;
}

interface UserListResponse {
  users: User[];
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UserListResponse = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setApproving(userId);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve user');
      }

      // Refresh user list
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to approve user');
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#1e293b'
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="#ffffff" strokeWidth={1.5} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
              User Management
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
            Approve new users and manage access
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #0f172a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '500' }}>
            Total Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: '600', color: '#0f172a' }}>
            {users.length}
          </div>
        </div>

        <div style={{
          backgroundColor: pendingUsers.length > 0 ? '#fef3c7' : '#ffffff',
          border: `1px solid ${pendingUsers.length > 0 ? '#fbbf24' : '#0f172a'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '500' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '32px', fontWeight: '600', color: pendingUsers.length > 0 ? '#d97706' : '#0f172a' }}>
            {pendingUsers.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #0f172a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '500' }}>
            Approved Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: '600', color: '#10b981' }}>
            {approvedUsers.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #0f172a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '500' }}>
            Admins
          </div>
          <div style={{ fontSize: '32px', fontWeight: '600', color: '#6366f1' }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #0f172a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={20} color="#d97706" />
            Pending Approval ({pendingUsers.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Registered</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#0f172a' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{user.displayName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{formatDate(user.createdAt)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => approveUser(user._id)}
                        disabled={approving === user._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: approving === user._id ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: approving === user._id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {approving === user._id ? (
                          <>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            Approve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Users Section */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #0f172a',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#0f172a',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} color="#10b981" />
          Approved Users ({approvedUsers.length})
        </h2>

        {approvedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>
            No approved users yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {approvedUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: user.role === 'admin' ? '600' : '400' }}>
                      {user.displayName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.role === 'admin' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          backgroundColor: '#eef2ff',
                          color: '#6366f1',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 12px',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          User
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
