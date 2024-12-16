'use client';

import React, { useEffect, useState } from 'react';
import Style from './singleitem.module.css';
import { useParams, useRouter } from 'next/navigation';
import { IItem } from '@/models/itemModel';
import { deleteItem, getItem, updateItem } from '@/services/apiItems';
import { FaTimes } from "react-icons/fa";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import toast, { LoaderIcon } from "react-hot-toast";
import Link from 'next/link';
import mongoose, { Types } from 'mongoose';
import { fetchStockById } from '@/services/apiStocks';
import { FiArrowLeft } from 'react-icons/fi';
import Loader from '../ui/Loader';

export default function SingleItem() {
  const router = useRouter();
  const { itemId } = useParams() as { itemId: string };
  const [item, setItem] = useState<IItem | null>(null);
  const [formValues, setFormValues] = useState<IItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageUrlDeleting, setImageUrlDeleting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const stockId = (item?.stock?._id?.toString())

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await getItem(itemId);
        setItem(fetchedItem);
        console.log(fetchedItem)
        setFormValues(fetchedItem); 
        setImageUrl(fetchedItem.image); 
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValues = { ...formValues, [name]: value } as IItem;
    setFormValues(updatedValues);
    setIsUpdated(JSON.stringify(updatedValues) !== JSON.stringify(item));
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
          setIsUpdated(true); 
        } else {
          throw new Error('Deletion failed');
        }
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setImageUrlDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues || !itemId) return;

    try {
      await updateItem(itemId, { ...formValues, image: imageUrl });
      toast.success('Item updated successfully');
      setIsUpdated(false); 
    } catch (error) {
      alert((error as Error).message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      toast.success('Item deleted successfully');
      router.push(`/stocks/${stockId}`)
    } catch (error) {
      alert((error as Error).message || 'Failed to delete item');
    }
  }

  if (loading) return <Loader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={Style.singleItemPage}>
      <Link href={`/stocks/${stockId}`} className={Style.backLink}><FiArrowLeft /> Back to all items</Link>
      <button className={Style.deleteItemBtn} onClick={() => handleDeleteItem(itemId)}>Delete Item</button>
      <h2>Manage Item</h2>
      <div className={Style.createItemForm}>
        <form onSubmit={handleSubmit}>
          <div className={Style.itemImageUpload}>
            {imageUrl ? (
              <>
                <Image src={imageUrl} alt="Item Image" height={100} width={100} />
                <button onClick={() => handleImageDelete(imageUrl)} type="button" className="text-white">
                  {imageUrlDeleting ? <LoaderIcon /> : <FaTimes />}
                </button>
              </>
            ) : (
              <div className={Style.imgUpload}>
                <UploadButton
                  appearance={{
                    button: {
                      background: '#e76c0e',
                      width: 90,
                      fontSize: 14,
                    },
                  }}
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImageUrl(res[0].url);
                    setIsUpdated(true); // Butonu etkinleştir
                    alert('Upload Completed');
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
            )}
          </div>
          <div className={Style.itemData}>
            <div className={Style.valueBox}>
              <label>Name</label>
              <input type="text" name="name" value={formValues?.name || ''} onChange={handleChange} required placeholder="Item Name..." />
            </div>
            <div className={Style.valueBox}>
              <label>SKU</label>
              <input type="text" name="sku" value={formValues?.sku || ''} onChange={handleChange} required placeholder="Item SKU..." />
            </div>
            <div className={Style.valueBox}>
              <label>Category</label>
              <input type="text" name="category" value={formValues?.category || ''} onChange={handleChange} required placeholder="Item Category..." />
            </div>
            <div className={Style.valueBox}>
              <label>Quantity</label>
              <input type="number" name="quantity" value={formValues?.quantity || ''} onChange={handleChange} required placeholder="Item Quantity..." />
            </div>
            <div className={Style.valueBox}>
              <label>Unit Price ($)</label>
              <input type="number" name="unitPrice" value={formValues?.unitPrice || ''} onChange={handleChange} placeholder="Item Unit Price ..." />
            </div>
            <div className={Style.valueBox}>
              <label>Wholesale Price ($)</label>
              <input type="number" name="wholesalePrice" value={formValues?.wholesalePrice || ''} onChange={handleChange} placeholder="Item Wholesale Price..." />
            </div>
            <div className={Style.valueBox}>
              <label>Supplier</label>
              <input type="text" name="supplier" value={formValues?.supplier || ''} onChange={handleChange} placeholder="Item Supplier..." />
            </div>
            <div className={Style.valueBox}>
              <label>Status</label>
              <select name="status" value={formValues?.status || ''} onChange={handleChange}>
                <option value="in stock">In Stock</option>
                <option value="out of stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <button type="submit" className={`${Style.submitButton} ${isUpdated ? Style.updated : ''}`} disabled={!isUpdated}>
            Update Item
          </button>
        </form>
      </div>
    </div>
  );
}