'use client';

import React, { useState } from 'react';
import Style from './register.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { userSignup } from '@/services/apiUsers'; 
import Link from 'next/link';

interface RegisterForm {
  username: string;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  userRole: 'owner' | 'manager';
}

export default function Register() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RegisterForm>();
  const [showPassword, setShowPassword] = useState({ password: false, passwordConfirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = (field: 'password' | 'passwordConfirm') => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field]
    }));
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await userSignup(data);
      router.push('/login');
    } catch (error) {
      // Hata yönetimi
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={Style.createUserArea}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Register</h2>

        <div className={Style.inputGroup}>
          <label htmlFor="username">Username:</label>
          <input 
            type="text" 
            id="username"
            placeholder='Enter username...'
            {...register("username", {
              required: "Username is required."
            })}
          />
          <p className={Style.errorText}>{errors?.username?.message}</p>
        </div>

        <div className={Style.inputGroup}>
          <label htmlFor="name">Name:</label>
          <input 
            type="text" 
            id="name"
            placeholder='Enter name...'
            {...register("name", {
              required: "Name is required."
            })}
          />
          <p className={Style.errorText}>{errors?.name?.message}</p>
        </div>

        <div className={Style.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email"
            placeholder='Enter email...'
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address."
              }
            })}
          />
          <p className={Style.errorText}>{errors?.email?.message}</p>
        </div>

        <div className={Style.inputGroup}>
           <label htmlFor="password">Password:</label>
          <div className={Style.passInput}>
            <input 
              disabled={isLoading} 
              type={showPassword.password ? "text" : "password"} 
              id="password" 
              placeholder="********"
              className={Style.inputTypePass}
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password should be at least 8 characters long"
                }
              })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className={Style.toggleButton}
            >
              {showPassword.password ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <p className={Style.errorText}>{errors?.password?.message}</p>
        </div>

        <div className={Style.inputGroup}>
          <label htmlFor="password-confirm">Confirm Password:</label>
          <div className={Style.passInput}>
            <input 
              disabled={isLoading} 
              className={Style.inputTypePass}
              type={showPassword.passwordConfirm ? "text" : "password"} 
              id="password-confirm" 
              placeholder="********"
              {...register("passwordConfirm", {
                required: "Please confirm your password.",
                validate: value => value === getValues().password || "Passwords must match"
              })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('passwordConfirm')}
              className={Style.toggleButton}
            >
              {showPassword.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <p className={Style.errorText}>{errors?.passwordConfirm?.message}</p>
        </div>

        <button className={Style.btn} type="submit" disabled={isLoading}>Register</button>
        <Link href={'/login '} className={Style.link}>Have an account?</Link>
      </form>
    </div>
  );
}
