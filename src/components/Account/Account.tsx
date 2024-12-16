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
import Style from './account.module.css';
import { useParams } from 'next/navigation';
import { fetchAccountById } from '@/services/apiAccounts';
import { IAccount } from '@/models/accountModel';
import { IUser } from '@/models/userModel';
import { getUserById } from '@/services/apiUsers';
import { FaBoxes, FaClipboardList, FaCube, FaDatabase, FaPencilAlt, FaUsers, FaCar, FaLaptop, FaBreadSlice, FaGamepad, FaFootballBall, FaTshirt, FaShoePrints, FaTree, FaPen, FaBriefcase, FaClock, FaTabletAlt, FaMobileAlt, FaTv, FaTable, FaChair, FaBed, FaCouch } from 'react-icons/fa';
import { fetchStocksByAccountId } from '@/services/apiStocks';  
import { IStock } from '@/models/stockModel';
import Link from "next/link";
import CreateStock from "../CreateStockModal/CreateStock";
import { FiSettings } from "react-icons/fi";
import Loader from "../ui/Loader";

const iconMap: { [key: string]: React.ComponentType } = {
  FaCube: FaCube,
  FaCar: FaCar,
  FaLaptop: FaLaptop,
  FaBreadSlice: FaBreadSlice,
  FaGamepad: FaGamepad,
  FaFootballBall: FaFootballBall,
  FaTshirt: FaTshirt,
  FaShoePrints: FaShoePrints,
  FaTree: FaTree,
  FaPen: FaPen,
  FaBriefcase: FaBriefcase,
  FaClock: FaClock,
  FaTabletAlt: FaTabletAlt,
  FaMobileAlt: FaMobileAlt,
  FaTv: FaTv,
  FaTable: FaTable,
  FaChair: FaChair,
  FaBed: FaBed,
  FaCouch: FaCouch
};

export default function Account() {
  const { accountId } = useParams() as { accountId: string };
  const [account, setAccount] = useState<IAccount | null>(null);
  const [owner, setOwner] = useState<IUser | null>(null);
  const [stocks, setStocks] = useState<IStock[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateStock, setOpenCreateStock] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedStocks = React.useMemo(() => {
    if (!sortConfig) return stocks;
  
    const sorted = [...stocks];
    sorted.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortConfig.key === 'items') {
        return sortConfig.direction === 'asc'
          ? a.items.length - b.items.length
          : b.items.length - a.items.length;
      } else if (sortConfig.key === 'storage') {
        return sortConfig.direction === 'asc'
          ? (a.storageUsed || 0) - (b.storageUsed || 0)
          : (b.storageUsed || 0) - (a.storageUsed || 0);
      }
      return 0;
    });
  
    return sorted;
  }, [stocks, sortConfig]);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const fetchedAccount = await fetchAccountById(accountId);
        setAccount(fetchedAccount);
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

  useEffect(() => {
    const getOwner = async () => {
      if (account?.owner?._id) {
        const ownerId = account.owner._id.toString();
        const fetchedOwner = await getUserById(ownerId);
        setOwner(fetchedOwner);
      }
    };

    if (account) {
      getOwner();
    }
  }, [account]);

  useEffect(() => {
    const getStocks = async () => {
      if (accountId) {
        try {
          const fetchedStocks = await fetchStocksByAccountId(accountId);
          setStocks(fetchedStocks);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    };

    if (accountId) {
      getStocks();
    }
  }, [accountId]);

  const totalItems = account?.stocks.reduce(
    (acc, stock) => acc + ((stock as any).items.length || 0),
    0
  );

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


  const toggleCreatePost = () => {
    setOpenCreateStock(!openCreateStock)
  }

const handleSort = (key: string) => {
  setSortConfig((prevConfig) => {
    if (prevConfig && prevConfig.key === key) {
      return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
    }
    return { key, direction: 'asc' };
  });
};

if (loading) return <Loader />;
if (error) return <div className={Style.error}>Error: {error}</div>;

  return (
    <div className={Style.accountPage}>
      <Link href={`/accounts/${accountId}/settings`} className={Style.settingsIcon}><FiSettings /></Link>
      <CreateStock isOpen={openCreateStock} onClose={toggleCreatePost} accountId={accountId} />
      <div className={Style.accountDataArea}>
        <h2>Account Data</h2>
        <div className={Style.accountData}>
          <div className={Style.dataBox}>
            <FaClipboardList />
            <p className={Style.textP}>{account?.plan} <br /> Plan</p>
          </div>
          <div className={Style.dataBox}>
            <FaPencilAlt />
            <p className={Style.textP}>{account?.name}</p>
          </div>
          <div className={Style.dataBox}>
            <FaDatabase />
            <p className={Style.textP}>{formatStorage(account?.storageUsed || 0)}</p>
          </div>
          <div className={Style.dataBox}>
            <FaBoxes />
            <p>{account?.stocks.length}</p>
          </div>
          <div className={Style.dataBox}>
            <FaCube />
            <p>{totalItems}</p>
          </div>
          <div className={Style.dataBox}>
            <FaUsers />
            <p>{account?.managers?.length}</p>
          </div>
        </div>
      </div>
      <div className={Style.accountStocksArea}>
        <h2>Stocks</h2>
        <button onClick={toggleCreatePost} className={Style.createStock}>Create Stock</button>
        <div className={Style.stocksList}>
          {stocks.length > 0 ? (
            <Table className={Style.table}>
            <TableCaption className={Style.tableCaption}>Your Stocks</TableCaption>
            <TableHeader>
               <TableRow className={Style.tableRow}>
                 <TableHead className={Style.tableHead}>Icon</TableHead>
                 <TableHead className={Style.tableHead} onClick={() => handleSort('name')}>
                   Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </TableHead>
                 <TableHead className={Style.tableHead} onClick={() => handleSort('items')}>
                   Items {sortConfig?.key === 'items' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </TableHead>
                 <TableHead className={Style.tableHead} onClick={() => handleSort('storage')}>
                   Storage {sortConfig?.key === 'storage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </TableHead>
                 <TableHead className={Style.tableHead}>Manage</TableHead>
               </TableRow>
             </TableHeader>

             <TableBody>
               {sortedStocks.map((stock) => (
                 <TableRow key={stock._id?.toString()} className={Style.tableRowItems}>
                   <TableCell className={Style.tableCell}>
                     {stock.icon && iconMap[stock.icon] ? React.createElement(iconMap[stock.icon]) : <FaCube />}
                   </TableCell>
                   <TableCell className={Style.tableCell}>{stock.name}</TableCell>
                   <TableCell className={Style.tableCell}>{stock.items.length}</TableCell>
                   <TableCell className={Style.tableCell}>{formatStorage(account?.storageUsed || 0)}</TableCell>
                   <TableCell className={Style.tableCell}>
                     <Link href={`/stocks/${stock?._id?.toString()}`} className={Style.manageBtn}>
                       Manage
                     </Link>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
        </Table>
          ) : (
            <h1 className="text-white">No Stocks</h1>
          )}
        </div>
      </div>
    </div>
  );
}
