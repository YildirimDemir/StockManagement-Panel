'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useEffect, useState } from 'react';
import Style from '../accountsettings.module.css';
import { FaCube, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { createUser, deleteUserById } from '@/services/apiUsers';
import { useSession } from 'next-auth/react';
import { fetchAccountById } from '@/services/apiAccounts';
import { IAccount } from '@/models/accountModel';
import { IUser } from '@/models/userModel';
import Link from "next/link";
import Loader from "@/components/ui/Loader";

interface RegisterForm {
  username: string;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  userRole: 'manager';
  accountId: string;
}

export default function AccountManagers() {
  const { data: session } = useSession();
  const { accountId } = useParams() as { accountId: string };
  const [account, setAccount] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ password: false, passwordConfirm: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<IUser[]>([]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RegisterForm>();

  useEffect(() => {
    const getAccount = async () => {
      try {
        const fetchedAccount = await fetchAccountById(accountId);
        setAccount(fetchedAccount);
        setManagers(fetchedAccount.managers)
        console.log(fetchedAccount.managers)
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      getAccount();
    }
  }, [accountId]);

  const togglePasswordVisibility = (field: 'password' | 'passwordConfirm') => {
    setShowPassword(prevState => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await createUser({ ...data, accountId: accountId });
      alert("User Created!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className={Style.createUserArea}>
      <h3>Create Manager</h3>
      {session?.user?.role === 'owner' ? (
        <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={Style.inputGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username..."
              {...register("username", { required: "Username is required." })}
            />
            <p className={Style.errorText}>{errors?.username?.message}</p>
          </div>

          <div className={Style.inputGroup}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              placeholder="Enter name..."
              {...register("name", { required: "Name is required." })}
            />
            <p className={Style.errorText}>{errors?.name?.message}</p>
          </div>

          <div className={Style.inputGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email..."
              {...register("email", {
                required: "Email is required.",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address." }
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
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Password should be at least 8 characters long" }
                })}
              />
              <button type="button" onClick={() => togglePasswordVisibility('password')} className={Style.toggleButton}>
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
                type={showPassword.passwordConfirm ? "text" : "password"}
                id="password-confirm"
                placeholder="********"
                {...register("passwordConfirm", {
                  required: "Please confirm your password.",
                  validate: value => value === getValues().password || "Passwords must match"
                })}
              />
              <button type="button" onClick={() => togglePasswordVisibility('passwordConfirm')} className={Style.toggleButton}>
                {showPassword.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <p className={Style.errorText}>{errors?.passwordConfirm?.message}</p>
          </div>

          <button className={Style.btn} type="submit" disabled={isLoading}>Create User</button>
        </form>

        <div className={Style.managersTable}>
          <h3>Managers</h3>
          {managers.length > 0 ? (
            <Table className={Style.table}>
            <TableCaption className={Style.tableCaption}>Managers</TableCaption>
            <TableHeader>
                <TableRow className={Style.tableRow}>
                    <TableHead className={Style.tableHead}>Username</TableHead>
                    <TableHead className={Style.tableHead}>Name</TableHead>
                    <TableHead className={Style.tableHead}>Email</TableHead>
                    <TableHead className={Style.tableHead}>Manage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {managers.map((manager) => (
                    <TableRow key={manager?._id?.toString()} className={Style.tableRowItems}>
                        <TableCell className={Style.tableCell}>{manager?.username}</TableCell>
                        <TableCell className={Style.tableCell}>{manager?.name}</TableCell>
                        <TableCell className={Style.tableCell}>{manager?.email}</TableCell>
                        <TableCell className={Style.tableCell}>
                        <button
                           className={Style.deleteButton}
                           onClick={async () => {
                             try {
                               if (manager?._id) {
                                 await deleteUserById(manager._id.toString());
                                 setManagers((prevManagers) =>
                                   prevManagers.filter((m) => m._id !== manager._id)
                                 );
                                 alert("Manager deleted successfully");
                               }
                             } catch (error) {
                               console.error("Error deleting manager:", error);
                               alert("Failed to delete manager. Please try again.");
                             }
                           }}
                          >
                           Delete
                        </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        // <h1>YES</h1>
          ) : (
            <h4 className="text-white">You have never created a manager</h4>
          )}
        </div>
        </>
      ) : (
        <h4 className='text-white'>You do not have the authority to do this</h4>
      )}
    </div>
  );
}
