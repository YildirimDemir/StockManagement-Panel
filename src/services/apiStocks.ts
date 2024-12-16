import { IStock } from '@/models/stockModel';

export const fetchStocksByAccountId = async (accountId: string): Promise<IStock[]> => {
  try {
    const response = await fetch(`/api/stocks?accountId=${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stocks');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

export const createStock = async (newStock: { accountId: string; name: string; icon?: string} ) => {
  try {
    const response = await fetch('/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newStock 
      }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to create stock');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating stock:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

  export const fetchStockById = async (stockId: string): Promise<IStock> => {
    try {
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch stock');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  export const updateStock = async (
    stockId: string,
    name: string,
    icon?: string  
  ): Promise<IStock> => {
    try {
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          icon: icon, 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  

  export const deleteStock = async (stockId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete stock');
      }
  
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };