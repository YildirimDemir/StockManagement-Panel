'use client';

import React, { useState } from 'react'
import Style from './accountsettings.module.css'
import AccountName from './Settings/AccountName';
import AccountPlan from './Settings/AccountPlan';
import AccountManagers from './Settings/AccountManagers';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import DeleteAccount from './Settings/DeleteAccount';

export default function AccountSettings() {
  const [selectedSetting, setSelectedSetting] = useState<string>('name');
  const { accountId } = useParams() as { accountId: string };

  return (
    <div className={Style.settingsPage}>
      <Link href={`/accounts/${accountId}`} className={Style.backLink}><FaArrowLeft /></Link>
       <div className={Style.settingsArea}>

       <div className={Style.settingsSidebar}>
            <button
              className={Style.chooseBtn}
              onClick={() => setSelectedSetting('name')}
            >
                Name
            </button>
            <button
              className={Style.chooseBtn}
              onClick={() => setSelectedSetting('plan')}
            >
                Plan
            </button>
            <button
              className={Style.chooseBtn}
              onClick={() => setSelectedSetting('managers')}
            >
                Managers
            </button>
            <button
              className={Style.chooseBtn}
              onClick={() => setSelectedSetting('delete')}
            >
                Delete
            </button>
        </div>
        <div className={Style.selectedSettingArea}>
            {selectedSetting === 'name' && <AccountName />}
            {selectedSetting === 'plan' && <AccountPlan />}
            {selectedSetting === 'managers' && <AccountManagers />}
            {selectedSetting === 'delete' && <DeleteAccount />}
        </div>

       </div>
    </div>
  )
}
