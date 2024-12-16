import { IUser } from "@/models/userModel";
import { signIn, signOut } from "next-auth/react";

export const getAllUsers = async (): Promise<IUser[]> => {
    try {
      const response = await fetch("/api/users", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
  
      const users: IUser[] = await response.json();
  
      if (!users) {
        throw new Error('No users found.');
      }
  
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
};

export const getUserById = async (userId: string): Promise<IUser> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }
  
      const user: IUser = await response.json();
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  };
  

  

export async function userLogin(data: { email: string, password: string }) {
    const { email, password } = data;

    const result = await signIn("credentials", {
        redirect: false,
        email,
        password
    });

    if (result?.error) throw new Error("Email or password wrong...");
}


export async function userLogout() {
    await signOut();
}

export async function userSignup(newUser: { username: string, name: string, email: string, password: string, passwordConfirm: string, role?: string}) {
    try {
        const role = newUser.role || 'owner';

        const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                passwordConfirm: newUser.passwordConfirm,
                role,
            }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create a user");
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export const updateUserSettings = async (userId: string, username: string, name: string, email: string): Promise<IUser> => {
    try {
      const response = await fetch(`/api/users/${userId}/user-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, name, email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user settings');
      }
  
      const updatedUser: IUser = await response.json();
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  };

export const updatePassword = async ( userId: string, passwordCurrent: string, newPassword: string, passwordConfirm: string ): Promise<string> => {
    try {
      const response = await fetch(`/api/users/${userId}/update-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passwordCurrent, newPassword, passwordConfirm }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
  
      const data = await response.json();
      return data.message;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
};
  

export const deleteSessionAccount = async (): Promise<{ message: string }> => {
    try {
        const res = await fetch(`/api/auth/delete-session-account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to delete account');
        }

        return data;
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
};

export const deleteUserById = async (userId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
  
      return;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  };

export async function createUser(newUser: { username: string, name: string, email: string, password: string, passwordConfirm: string, role?: string, accountId: string}) {
    try {
        const role = newUser.role || 'manager';

        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify({
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                passwordConfirm: newUser.passwordConfirm,
                role,
                accountId: newUser.accountId
            }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create a user");
        }

        return data;
    } catch (error) {
        throw error;
    }
}