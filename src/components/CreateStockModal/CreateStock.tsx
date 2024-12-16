'use client';

import React, { useState } from 'react'
import Style from './createstock.module.css'
import { FaBoxes, FaClipboardList, FaCube, FaDatabase, FaPencilAlt, FaUsers, FaCar, FaLaptop, FaBreadSlice, FaGamepad, FaFootballBall, FaTshirt, FaShoePrints, FaTree, FaPen, FaBriefcase, FaClock, FaTabletAlt, FaMobileAlt, FaTv, FaTable, FaChair, FaBed, FaCouch } from 'react-icons/fa';
import { createStock } from '@/services/apiStocks';
import toast from 'react-hot-toast';

interface CreateStockProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

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

const CreateStock: React.FC<CreateStockProps> = ({ isOpen, onClose, accountId }) => {
  const [stockName, setStockName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleIconClick = (iconName: string) => {
    setSelectedIcon(iconName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockName || !selectedIcon) {
      alert('Please fill out all fields');
      return;
    }

    try {
      await createStock({accountId: accountId, name: stockName, icon: selectedIcon});
      toast.success('Stock created successfully');
      onClose(); 
    } catch (error) {
      console.error('Error creating stock:', error);
    }
  };

  return (
    <div className={`${Style.createStockModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.createStockForm}>
        <h2>Create a Stock</h2>
        <form onSubmit={handleSubmit}>
          <div className={Style.stockName}>
            <h3>Stock Name</h3>
            <input
              type="text"
              placeholder="Type stock name"
              required
              maxLength={15}
              minLength={3}
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
            />
          </div>
          <div className={Style.stockIcon}>
            <h3>Select an Icon</h3>
            <div className={Style.iconList}>
              {Object.keys(iconMap).map((iconName) => {
                const IconComponent = iconMap[iconName];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    className={`${Style.iconButton} ${isSelected ? Style.selected : ''}`}
                    onClick={() => handleIconClick(iconName)}
                  >
                    <IconComponent />
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className={Style.submitBtn}>
            Create
          </button>
        </form>
      </div>
      <button className={Style.closeBtn} onClick={onClose}>
        X
      </button>
    </div>
  );
};

export default CreateStock;
