'use client';

import React, { useState } from 'react';
import Style from './updatepassword.module.css';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updatePassword } from '@/services/apiUsers';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FormValues {
  passwordCurrent: string;
  newPassword: string;
  passwordConfirm: string;
}

export default function UpdatePassword() {
  const { data: session } = useSession();
  const user = session?.user;

  const [showPassword, setShowPassword] = useState({
    passwordCurrent: false,
    newPassword: false,
    passwordConfirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!user?.id) {
        throw new Error('User ID is missing.');
      }
      return updatePassword(user.id, data.passwordCurrent, data.newPassword, data.passwordConfirm);
    },
    onError: (err: any) => toast.error(err.message),
    onSuccess: () => {
      toast.success('Password updated successfully!');
      reset();
    },
  });

  const dataSubmit: SubmitHandler<FormValues> = (data) => {
    if (data.newPassword !== data.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className={Style.passwordArea}>
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit(dataSubmit)}>
        <div className={Style.inputBox}>
          <label htmlFor="passwordCurrent">Current Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.passwordCurrent ? 'text' : 'password'}
              id="passwordCurrent"
              placeholder="Type your current password"
              {...register('passwordCurrent', { required: 'Current password is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('passwordCurrent')}
              className={Style.toggleButton}
            >
              {showPassword.passwordCurrent ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.passwordCurrent && <p>{errors.passwordCurrent.message}</p>}
        </div>

        <div className={Style.inputBox}>
          <label htmlFor="newPassword">New Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.newPassword ? 'text' : 'password'}
              id="newPassword"
              placeholder="Type your new password"
              {...register('newPassword', { required: 'New password is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('newPassword')}
              className={Style.toggleButton}
            >
              {showPassword.newPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.newPassword && <p>{errors.newPassword.message}</p>}
        </div>

        <div className={Style.inputBox}>
          <label htmlFor="passwordConfirm">Confirm New Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.passwordConfirm ? 'text' : 'password'}
              id="passwordConfirm"
              placeholder="Confirm your new password"
              {...register('passwordConfirm', { required: 'Password confirmation is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('passwordConfirm')}
              className={Style.toggleButton}
            >
              {showPassword.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.passwordConfirm && <p>{errors.passwordConfirm.message}</p>}
        </div>

        <button type="submit" className={Style.btn} disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Updating...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
