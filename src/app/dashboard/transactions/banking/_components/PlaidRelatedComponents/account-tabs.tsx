import { FiCreditCard, FiDollarSign, FiHome, FiBook, FiPieChart, FiBarChart2 } from 'react-icons/fi'
import { Account } from './account'

interface AccountTabsProps {
  accounts: Account[]
  activeIndex: number
  onTabChange: (index: number) => void
}

export default function AccountTabs({ accounts, activeIndex, onTabChange }: AccountTabsProps) {
  // Function to get the appropriate icon based on account type
  const getAccountIcon = (type: string, subtype: string) => {
    switch (type) {
      case 'depository':
        return subtype === 'checking' ? <FiDollarSign className="mr-2" /> : <FiPieChart className="mr-2" />
      case 'investment':
        return <FiBarChart2 className="mr-2" />
      case 'loan':
        return subtype === 'mortgage' ? <FiHome className="mr-2" /> : <FiBook className="mr-2" />
      case 'credit':
        return <FiCreditCard className="mr-2" />
      default:
        return <FiDollarSign className="mr-2" />
    }
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto">
        {accounts.map((account, index) => (
          <button
            key={account.account_id}
            onClick={() => onTabChange(index)}
            className={`
              flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
              ${activeIndex === index 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {getAccountIcon(account.type, account.subtype || '')}
            {account.name}
          </button>
        ))}
      </div>
    </div>
  )
}
