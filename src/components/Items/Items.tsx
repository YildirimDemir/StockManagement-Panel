'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IItem } from '@/models/itemModel';
import { IStock } from '@/models/stockModel';
import { createItem, getFilteredItems, getItemsByStockId } from '@/services/apiItems';
import { deleteStock, fetchStockById } from '@/services/apiStocks';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import Style from './items.module.css';
import Image from "next/image";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import toast, { LoaderIcon } from "react-hot-toast";
import { FaSearch, FaTimes } from "react-icons/fa";
import StoxIcon from '../../../public/images/stox-icon.png'
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../ui/Loader";
import { debounce } from "lodash";

export default function Items() {
  const router = useRouter();
  const { stockId } = useParams() as { stockId: string };
  const [stock, setStock] = useState<IStock | null>(null);
  const [items, setItems] = useState<IItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const accountId = stock?.account

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageUrlDeleting, setImageUrlDeleting] = useState(false)

  const [newItem, setNewItem] = useState<Partial<IItem>>({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    wholesalePrice: 0,
    status: 'in stock',
    supplier: '',
  });

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);
  
  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return filteredItems;
  
    const sorted = [...filteredItems];
  
    sorted.sort((a, b) => {
      if (
        sortConfig.key === 'name' ||
        sortConfig.key === 'sku' ||
        sortConfig.key === 'category' ||
        sortConfig.key === 'status' ||
        sortConfig.key === 'supplier'
      ) {
        const valueA = a[sortConfig.key]?.toString() || '';
        const valueB = b[sortConfig.key]?.toString() || '';
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
  
      if (
        sortConfig.key === 'quantity' ||
        sortConfig.key === 'unitPrice' ||
        sortConfig.key === 'wholesalePrice'
      ) {
        const valueA = a[sortConfig.key] || 0;
        const valueB = b[sortConfig.key] || 0;
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
  
      return 0;
    });
  
    return sorted;
  }, [filteredItems, sortConfig]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };  
  
  useEffect(() => {
    const getStock = async () => {
      try {
        const fetchedStock = await fetchStockById(stockId);
        setStock(fetchedStock);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (stockId) {
      getStock();
    }
  }, [stockId]);

  useEffect(() => {
    const getItems = async () => {
      if (stockId) {
        try {
          const fetchedItems = await getItemsByStockId(stockId);
          setItems(fetchedItems);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    };

    if (stockId) {
      getItems();
    }
  }, [stockId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "unitPrice" || name === "wholesalePrice"
        ? Number(value) 
        : value,
    }));
  };
  

  const handleCreateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!newItem.name || !newItem.sku || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }
  
    try {
      const createdItem = await createItem({
        ...newItem,
        image: imageUrl, 
        stockId, 
      } as { 
        name: string;
        sku: string;
        category: string;
        quantity: number;
        unitPrice?: number;
        wholesalePrice?: number;
        status: 'in stock' | 'out of stock';
        supplier?: string;
        image?: string;
        stockId: string;
      });
  
      setItems((prev) => [...prev, createdItem]);
      setNewItem({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        unitPrice: 0,
        wholesalePrice: 0,
        status: 'in stock',
        supplier: '',
      });
      setImageUrl(undefined);
      toast.success('Item created successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating item');
    }
  };

  const formatStorage = (storage: number) => {
    if (storage < 1024) {
      return `${storage} KB`;
    } else if (storage < 1024 * 1024) {
      return `${(storage / 1024).toFixed(2)} MB`;
    } else if (storage < 1024 * 1024 * 1024) {
      return `${(storage / (1024 * 1024)).toFixed(2)} GB`;
    } else {
      return `${(storage / (1024 * 1024 * 1024)).toFixed(2)} TB`;
    }
  };

const handleImageDelete = async (imageUrl: string) => {
  setImageUrlDeleting(true); 
  
  const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

  try {
    const res = await fetch('/api/uploadthing/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageKey }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setImageUrl(''); 
        toast.success('Image removed');
      } else {
        throw new Error('Deletion failed');
      }
    } else {
      throw new Error('Request failed');
    }
  } catch (error) {
    toast.error('Something going wrong');
  } finally {
    setImageUrlDeleting(false); 
  }
};

const handleSort = (key: string) => {
  setSortConfig((prevConfig) => {
    if (prevConfig && prevConfig.key === key) {
      return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
    }
    return { key, direction: 'asc' };
  });
};

const handleDeleteStock = async (stockId: string) => {
  try {
    await deleteStock(stockId);
    toast.success('Stock deleted successfully');
    router.push(`/accounts/${accountId}`)
  } catch (error) {
    toast.error((error as Error).message || 'Failed to delete item');
  }
}

if (loading) return <Loader />;

  return (
    <div className={Style.itemsPage}>
       <Link href={`/accounts/${accountId}`} className={Style.backLink}><FiArrowLeft /> Back to all stocks</Link>
      <button className={Style.deleteStockBtn} onClick={() => handleDeleteStock(stockId)}>Delete Stock</button>
      <div className={Style.stockInfo}>
        <h1>{stock?.name} | {stock?.items.length || 0} Items | {formatStorage(stock?.storageUsed || 0)}</h1>
      </div>

      <div className={Style.createItems}>
        <h2>Create Item</h2>
        <div className={Style.createItemForm}>
          <form onSubmit={handleCreateItem}>
            <div className={Style.itemImageUpload}>
              {imageUrl ? <>
              <Image src={imageUrl} alt="" height={100} width={100}/>
              <button onClick={() => handleImageDelete(imageUrl)} type="button" className="text-white">
                {imageUrlDeleting ? <LoaderIcon /> : <FaTimes />}
              </button>
              </> : <>
              <div className={Style.imgUpload}>
              <UploadButton
                 appearance={{
                  button: {
                    background: '#e76c0e',
                    width: 90,
                    fontSize: 14
                  }
                 }}
                 endpoint="imageUploader"
                 onClientUploadComplete={(res) => {
                   console.log("Files: ", res);
                   setImageUrl(res[0].url)
                   alert("Upload Completed");
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                 }}
               />
              </div>
              </>}
            </div>
            <div className={Style.itemData}>
            <div className={Style.valueBox}>
              <label>Name</label>
              <input type="text" name="name" value={newItem.name} onChange={handleInputChange} required placeholder="Item Name..."/>
            </div>
            <div className={Style.valueBox}>
              <label>SKU</label>
              <input type="text" name="sku" value={newItem.sku} onChange={handleInputChange} required placeholder="Item SKU..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Category</label>
              <input type="text" name="category" value={newItem.category} onChange={handleInputChange} required placeholder="Item Category..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Quantity</label>
              <input type="number" name="quantity" onChange={handleInputChange} required placeholder="Item Quantity..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Unit Price ($)</label>
              <input type="number" name="unitPrice" onChange={handleInputChange} placeholder="Item Unit Price ..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Wholesale Price ($)</label>
              <input type="number" name="wholesalePrice" onChange={handleInputChange} placeholder="Item Wholesale Price..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Supplier</label>
              <input type="text" name="supplier" value={newItem.supplier} onChange={handleInputChange} placeholder="Item Supplier..."/>
            </div>
            <div className={Style.valueBox}>
              <label>Status</label>
              <select name="status" value={newItem.status} onChange={handleInputChange}>
                <option value="in stock">In Stock</option>
                <option value="out of stock">Out of Stock</option>
              </select>
            </div>
            </div>
            <button type="submit" className={Style.submitButton}>Create Item</button>
          </form>
        </div>
      </div>

      <div className={Style.items}>
        <div className={Style.itemsHeader}>
          <div className={Style.searchInput}>
            <span><FaSearch /></span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
         </div>
        <h2>Items</h2>
        </div>
        {items.length > 0 ? (
          <Table className={Style.table}>
            <TableCaption className={Style.tableCaption}>Your Items</TableCaption>
            <TableHeader>
              <TableRow className={Style.tableRow}>
                <TableHead className={Style.tableHead}>Image</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('name')}>Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('sku')}>SKU {sortConfig?.key === 'sku' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('category')}>Category {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('quantity')}>QTY {sortConfig?.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('unitPrice')}>UP {sortConfig?.key === 'unitPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('wholesalePrice')}>WSP {sortConfig?.key === 'wholesalePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('supplier')}>Supplier {sortConfig?.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead} onClick={() => handleSort('status')}>Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className={Style.tableHead}>Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => (
                <TableRow key={item._id?.toString()} className={`${Style.tableRowItems} ${index % 2 !== 0 ? Style.bgStyle : ''}`}>
                  <TableCell className={Style.tableCell}>
                    <Image src={item.image || StoxIcon.src} alt={item.name || 'Item'} width={60} height={60} />
                  </TableCell>
                  <TableCell className={Style.tableCell}>{item.name}</TableCell>
                  <TableCell className={Style.tableCell}>{item.sku}</TableCell>
                  <TableCell className={Style.tableCell}>{item.category}</TableCell>
                  <TableCell className={Style.tableCell}>{item.quantity}</TableCell>
                  <TableCell className={Style.tableCell}>${item.unitPrice}</TableCell>
                  <TableCell className={Style.tableCell}>${item.wholesalePrice}</TableCell>
                  <TableCell className={Style.tableCell}>{item.supplier}</TableCell>
                  <TableCell className={`${Style.tableCell} ${item.status === 'in stock' ? Style.inStock : Style.outOfStock}`}>{item.status}</TableCell>
                  <TableCell className={Style.tableCell}>
                    <Link href={`/items/${item._id}`}>Manage</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-white">No items found</p>
        )}
      </div>
    </div>
  );
}