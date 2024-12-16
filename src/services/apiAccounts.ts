import { NextResponse } from 'next/server';

export const fetchUserAccounts = async () => {
  try {
    const response = await fetch('/api/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to fetch user accounts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    throw error; 
  }
};

export const createAccount = async (name: string, plan?: string) => {
  try {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, plan }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to create account');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Error creating account:', error);
    throw error; 
  }
};

export const fetchAccountById = async (accountId: string) => {
  try {
    const response = await fetch(`/api/accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to fetch account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};

export const updateAccountById = async (accountId: string, name: string) => {
  try {
    const response = await fetch(`/api/accounts/${accountId}/update-name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to update account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const updateAccountPlanById = async (accountId: string, plan: 'Free' | 'Pro' | 'Business') => {
  try {
    const response = await fetch(`/api/accounts/${accountId}/update-plan`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to update account plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating account plan:', error);
    throw error;
  }
};


export const deleteAccountById = async (accountId: string) => {
  try {
    const response = await fetch(`/api/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Failed to delete account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
