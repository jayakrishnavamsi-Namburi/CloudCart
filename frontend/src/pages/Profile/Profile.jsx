import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize form values from auth user state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim()
        }
      };

      await updateProfile(updateData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Page Header */}
        <div className="profile-header">
          <div className="profile-avatar-circle">
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="profile-header-text">
            <h1 className="profile-title">Account Settings</h1>
            <p className="profile-subtitle">
              Manage your personal information and default delivery address.
            </p>
            {user?.role === 'admin' && (
              <span className="badge badge-primary admin-role-badge">
                <FiShield /> Administrator
              </span>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="profile-form-layout" noValidate>
          {/* Section 1: Personal Information */}
          <div className="profile-card">
            <div className="profile-card-header">
              <FiUser className="card-header-icon" />
              <div>
                <h2 className="profile-card-title">Personal Information</h2>
                <p className="profile-card-desc">
                  Your primary account identity details used across CloudCart.
                </p>
              </div>
            </div>

            <div className="profile-card-body">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="req-star">*</span>
                </label>
                <div className="profile-input-wrapper">
                  <FiUser className="input-glyph" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input with-glyph ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g. John Doe"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address <span className="req-star">*</span>
                </label>
                <div className="profile-input-wrapper">
                  <FiMail className="input-glyph" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input with-glyph ${errors.email ? 'input-error' : ''}`}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Default Shipping Address */}
          <div className="profile-card">
            <div className="profile-card-header">
              <FiMapPin className="card-header-icon" />
              <div>
                <h2 className="profile-card-title">Default Shipping Address</h2>
                <p className="profile-card-desc">
                  Pre-populates your delivery destination at checkout.
                </p>
              </div>
            </div>

            <div className="profile-card-body address-grid">
              {/* Street Address */}
              <div className="form-group span-2">
                <label htmlFor="street" className="form-label">
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="123 Shopping Way, Suite 100"
                  disabled={isSubmitting}
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Seattle"
                  disabled={isSubmitting}
                />
              </div>

              {/* State */}
              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State / Province
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="WA"
                  disabled={isSubmitting}
                />
              </div>

              {/* Zip Code */}
              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">
                  ZIP / Postal Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="98101"
                  disabled={isSubmitting}
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="United States"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="profile-actions-bar">
            <button
              type="submit"
              className="btn btn-primary btn-lg save-profile-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
