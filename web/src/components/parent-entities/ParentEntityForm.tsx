import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { DomainType, ParentEntity, CreateParentEntityData, uploadEntityImage, getEntityImageUrl } from '../../services/api/parentEntities';
import { useCreateParentEntity, useUpdateParentEntity } from '../../hooks/useParentEntities';

interface ParentEntityFormProps {
  domain: DomainType;
  entity?: ParentEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pendingImage?: File | null;
  onImageProcessed?: () => void;
}

interface FormData {
  name: string;
  // Vehicle fields
  make?: string;
  model?: string;
  year?: number;
  registration?: string;
  vin?: string;
  purchaseDate?: string;
  currentOwner?: string;
  location?: string;
  // Property fields
  address?: string;
  postcode?: string;
  propertyType?: string;
  ownershipStatus?: string;
  propertyPurchaseDate?: string;
  // Employment fields
  employerName?: string;
  jobTitle?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  primaryContact?: string;
  // Services fields
  businessName?: string;
  serviceType?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  serviceAddress?: string;
  paymentMethod?: string;
  // Finance fields
  institution?: string;
  accountType?: string;
  accountNumber?: string;
  sortCode?: string;
  accountHolder?: string;
  openedDate?: string;
  // Common
  notes?: string;
}

const getDomainTitle = (domain: DomainType, isEdit: boolean): string => {
  const titles: Record<DomainType, string> = {
    vehicles: isEdit ? 'Edit Vehicle' : 'Add New Vehicle',
    properties: isEdit ? 'Edit Property' : 'Add New Property',
    employments: isEdit ? 'Edit Employment' : 'Add New Employment',
    services: isEdit ? 'Edit Service Provider' : 'Add New Service Provider',
    finance: isEdit ? 'Edit Financial Account' : 'Add New Financial Account'
  };
  return titles[domain];
};

const ParentEntityForm: React.FC<ParentEntityFormProps> = ({
  domain,
  entity,
  isOpen,
  onClose,
  onSuccess,
  pendingImage,
  onImageProcessed
}) => {
  const isEditMode = !!entity;
  const createMutation = useCreateParentEntity(domain);
  const updateMutation = useUpdateParentEntity(domain);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    getValues
  } = useForm<FormData>({
    // Set default values on mount based on whether we have an entity
    defaultValues: entity ? {
      name: entity.name,
      ...entity.fields
    } : {},
    mode: 'onChange'
  });

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { name, notes, ...fields } = data;

      // Remove undefined values
      const cleanFields = Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== undefined && v !== '')
      );

      const payload: CreateParentEntityData = {
        name,
        fields: cleanFields
      };

      let createdEntity: ParentEntity;
      if (isEditMode && entity) {
        await updateMutation.mutateAsync({
          id: entity._id,
          data: payload
        });
        createdEntity = entity;
      } else {
        createdEntity = await createMutation.mutateAsync(payload);
      }

      // Upload image if pendingImage or selectedImageFile exists
      const imageToUpload = pendingImage || selectedImageFile;
      if (imageToUpload && createdEntity && imageToUpload instanceof File) {
        try {
          setIsUploadingImage(true);
          await uploadEntityImage(domain, createdEntity._id, imageToUpload);
          onImageProcessed?.();
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Don't fail the form submission, image upload is optional
        } finally {
          setIsUploadingImage(false);
        }
      } else if (onImageProcessed && !pendingImage && !selectedImageFile) {
        // Clear the pending image even if no upload
        onImageProcessed?.();
      }

      onSuccess();
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    color: '#0f172a', // Dark text color for visibility
    backgroundColor: '#ffffff'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '4px'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              margin: 0,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            {getDomainTitle(domain, isEditMode)}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              color: '#1e293b'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div
            style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}
          >
            {/* Common: Name field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  maxLength: { value: 100, message: 'Name must be 100 characters or less' }
                })}
                style={inputStyle}
                placeholder={
                  domain === 'vehicles'
                    ? '2019 Honda Civic'
                    : domain === 'properties'
                    ? 'Primary Residence'
                    : domain === 'employments'
                    ? 'Acme Corp - Software Engineer'
                    : domain === 'services'
                    ? 'Tradespeople'
                    : domain === 'finance'
                    ? 'Current Accounts'
                    : 'Name'
                }
              />
              {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
            </div>

            {/* Image Upload Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Image (Optional)</label>
              {!imagePreview && !entity?.image && (
                <div
                  style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <Upload size={40} color="#334155" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#1e293b', margin: '0 0 4px 0', fontWeight: '500' }}>
                    Click to upload image
                  </p>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              {(imagePreview || entity?.image) && (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img
                    src={imagePreview || (entity ? getEntityImageUrl(domain, entity._id) : '')}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    <ImageIcon size={16} />
                    Change
                  </button>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Vehicle-specific fields */}
            {domain === 'vehicles' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Make</label>
                    <input type="text" {...register('make')} style={inputStyle} placeholder="Honda" />
                  </div>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input type="text" {...register('model')} style={inputStyle} placeholder="Civic" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Year</label>
                    <input
                      type="number"
                      {...register('year', {
                        min: { value: 1900, message: 'Year must be 1900 or later' },
                        max: { value: 2030, message: 'Year must be 2030 or earlier' }
                      })}
                      style={inputStyle}
                      placeholder="2019"
                    />
                    {errors.year && <p style={errorStyle}>{errors.year.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Registration</label>
                    <input type="text" {...register('registration')} style={inputStyle} placeholder="ABC-1234" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>VIN (Vehicle Identification Number)</label>
                  <input
                    type="text"
                    {...register('vin', {
                      maxLength: { value: 17, message: 'VIN must be 17 characters or less' }
                    })}
                    style={inputStyle}
                    placeholder="1HGBH41JXMN109186"
                  />
                  {errors.vin && <p style={errorStyle}>{errors.vin.message}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Purchase Date</label>
                    <input type="date" {...register('purchaseDate')} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Current Owner</label>
                    <input type="text" {...register('currentOwner')} style={inputStyle} placeholder="John Doe" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Location</label>
                  <input type="text" {...register('location')} style={inputStyle} placeholder="Garage at Primary Residence" />
                </div>
              </>
            )}

            {/* Property-specific fields */}
            {domain === 'properties' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>
                    Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    {...register('address', {
                      required: 'Address is required',
                      maxLength: { value: 200, message: 'Address must be 200 characters or less' }
                    })}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="123 Main Street&#10;Belfast&#10;County Antrim"
                    rows={3}
                  />
                  {errors.address && <p style={errorStyle}>{errors.address.message}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Postcode</label>
                    <input
                      type="text"
                      {...register('postcode', {
                        pattern: {
                          value: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
                          message: 'Invalid UK postcode format'
                        }
                      })}
                      style={inputStyle}
                      placeholder="BT1 1AA"
                    />
                    {errors.postcode && <p style={errorStyle}>{errors.postcode.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Property Type</label>
                    <select {...register('propertyType')} style={inputStyle}>
                      <option value="">Select type</option>
                      <option value="House">House</option>
                      <option value="Flat">Flat</option>
                      <option value="Bungalow">Bungalow</option>
                      <option value="Terraced">Terraced</option>
                      <option value="Semi-Detached">Semi-Detached</option>
                      <option value="Detached">Detached</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Ownership Status</label>
                    <select {...register('ownershipStatus')} style={inputStyle}>
                      <option value="">Select status</option>
                      <option value="Owned">Owned</option>
                      <option value="Mortgaged">Mortgaged</option>
                      <option value="Rented">Rented</option>
                      <option value="Leased">Leased</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Purchase Date</label>
                    <input type="date" {...register('propertyPurchaseDate')} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            {/* Employment-specific fields */}
            {domain === 'employments' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Employer Name</label>
                    <input type="text" {...register('employerName')} style={inputStyle} placeholder="Acme Corporation" />
                  </div>
                  <div>
                    <label style={labelStyle}>Job Title</label>
                    <input type="text" {...register('jobTitle')} style={inputStyle} placeholder="Software Engineer" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Employment Type</label>
                  <select {...register('employmentType')} style={inputStyle}>
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" {...register('startDate')} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" {...register('endDate')} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Primary Contact</label>
                  <input type="text" {...register('primaryContact')} style={inputStyle} placeholder="HR: hr@acme.com" />
                </div>
              </>
            )}

            {/* Services-specific fields */}
            {domain === 'services' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Service Category</label>
                  <select {...register('serviceCategory')} style={inputStyle}>
                    <option value="">Select category</option>
                    <option value="Tradespeople">Tradespeople</option>
                    <option value="Home Services">Home Services</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Garden & Outdoor">Garden & Outdoor</option>
                    <option value="Automotive Services">Automotive Services</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Other">Other</option>
                  </select>
                  <p style={{
                    fontSize: '13px',
                    color: '#1e293b',
                    marginTop: '6px',
                    fontStyle: 'italic'
                  }}>
                    Choose the category for the services you'll track (e.g., "Tradespeople" will contain all your plumbers, electricians, etc.)
                  </p>
                </div>
              </>
            )}

            {/* Finance-specific fields */}
            {domain === 'finance' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Account Type Category</label>
                  <select {...register('accountType')} style={inputStyle}>
                    <option value="">Select type</option>
                    <option value="Current Accounts">Current Accounts</option>
                    <option value="Savings Accounts">Savings Accounts</option>
                    <option value="ISAs">ISAs</option>
                    <option value="Credit Cards">Credit Cards</option>
                    <option value="Pensions">Pensions</option>
                    <option value="Investments">Investments</option>
                    <option value="Mortgages">Mortgages</option>
                    <option value="Loans">Loans</option>
                    <option value="Other">Other</option>
                  </select>
                  <p style={{
                    fontSize: '13px',
                    color: '#1e293b',
                    marginTop: '6px',
                    fontStyle: 'italic'
                  }}>
                    Choose the type of accounts you'll track in this category (e.g., "Current Accounts" will contain all your current accounts from different banks)
                  </p>
                </div>
              </>
            )}

            {/* Common: Notes field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                {...register('notes', {
                  maxLength: { value: 500, message: 'Notes must be 500 characters or less' }
                })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Additional notes..."
                rows={3}
              />
              {errors.notes && <p style={errorStyle}>{errors.notes.message}</p>}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: isSubmitting || isUploadingImage ? '#334155' : '#0f172a',
                color: '#ffffff',
                cursor: isSubmitting || isUploadingImage ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              {isUploadingImage ? 'Uploading image...' : isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentEntityForm;
