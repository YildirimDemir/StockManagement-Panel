import { IItem } from "@/models/itemModel";

export const getItemsByStockId = async (stockId: string) => {
    try {
      const response = await fetch(`/api/items?stockId=${stockId}`, {
        method: 'GET',
        credentials: 'same-origin',
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch items');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  export const createItem = async (newItem: {
    name: string;
    sku: string;
    image?: string;
    category?: string;
    quantity?: number;
    unitPrice?: number;
    wholesalePrice?: number;
    status: 'in stock' | 'out of stock';
    supplier?: string;
    stockId: string;
  }) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
        }),
        credentials: 'same-origin',
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create item');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  

export const getItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch item');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
};
  

export const updateItem = async (
  itemId: string,
  updatedItem: {
    name?: string;
    price?: number;
    quantity?: number;
    status?: 'in stock' | 'out of stock';
    category?: string;
    image?: string;
    supplier?: string;
    unitPrice?: number;
    wholesalePrice?: number;
  }
) => {
  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update item');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};


export const deleteItem = async (itemId: string) => {
  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete item');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};


export const getFilteredItems = async (query: string): Promise<IItem[]> => {
  try {
      const response = await fetch(`/api/items/search?query=${query}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch filtered items');
      }

      const items: IItem[] = await response.json();
      return items;
  } catch (error) {
      if (error instanceof Error) {
          throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
  }
};