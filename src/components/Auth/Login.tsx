'use client';
import Style from "./login.module.css";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { userLogin } from '@/services/apiUsers';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface LoginFormInputs {
    email: string;
    password: string;
}

export default function Login() {
    
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);

    const mutation = useMutation({
        mutationFn: userLogin,
        onSuccess: () => {
            toast.success("Login successfully");
            queryClient.invalidateQueries({
                queryKey: ["users"]
            });
            reset();

            const timer = setTimeout(() => {
                router.replace('/');
            }, 3000);

            return () => clearTimeout(timer);
        },
        onError: (err: any) => toast.error(err.message)
    });

    const { register, handleSubmit, reset, formState: {errors} } = useForm<LoginFormInputs>();

    
    const submitLogin: SubmitHandler<LoginFormInputs> = (data) => {
        mutation.mutate(data);
    };

    const isLoading = mutation.status === 'pending';

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

  return (
    <div className={Style.loginArea}>
    <div className={Style.loginFormArea}>
        <h2>LOGIN</h2>
        <form className={Style.loginForm} onSubmit={handleSubmit(submitLogin)}>
            <div className={Style.formInputGroup}>
                <label htmlFor="email">Email:</label>
                <input 
                    disabled={isLoading} 
                    type="email" 
                    id="email" 
                    placeholder="you@example.com"
                    {...register("email", { required: "This field is required." })}
                />
                <p className={Style.errorText}>{errors?.email?.message}</p>
            </div>
            <div className={Style.formInputGroup}>
                <label htmlFor="password">Password:</label>
                <div className={Style.passInput}>
                    <input 
                        disabled={isLoading} 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        placeholder="********"
                        className={Style.inputTypePass}
                        {...register("password", {
                            required: "This field is required.",
                            minLength: {
                                value: 8,
                                message: "Password should be at least 8 characters long"
                            }
                        })}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={Style.toggleButton}
                    >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>
                <p className={Style.errorText}>{errors?.password?.message}</p>
            </div>
            <button className={Style.btn} disabled={isLoading}>Login</button>
            <Link href={'/register'} className={Style.link}>Register Now</Link>
        </form>
    </div>
</div>
  )
}