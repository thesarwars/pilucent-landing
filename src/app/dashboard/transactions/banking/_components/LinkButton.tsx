// APP COMPONENT

import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import { baseURL } from '@/app/helpers/api';
import { fetchPlaidTransactions, getLinkToken, getPublicToken } from '@/app/helpers/backend';
import MainLoader from '@/components/MainLoader/MainLoader';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import AccountMatchVerification from './PlaidRelatedComponents/AccountMatchVerification';
import TransactionsPreview from './PlaidRelatedComponents/TransactionsPreview';
import ImportCompleted from './Success';
import { useSelector } from 'react-redux';
import { toast } from '@/lib/ToastService';

const LinkButton = ({
  className = '',
  btnText = 'Link Account',
  isLinkBank = false,
  setIsLinkBank,
}: {
  setIsLinkBank?: any;
  isLinkBank?: boolean;
  className?: any;
  btnText?: string;
}) => {
  const [linkToken, setLinkToken] = useState(null);
  const { UserData } = useSelector((state: any) => state.userData);
  const generateToken = async () => {
    const data = await getLinkToken();
    setLinkToken(data.link_token);
  };
  useEffect(() => {
    generateToken();
  }, []);
  return linkToken != null && UserData?.is_2fa_enabled ? (
    <Link
      linkToken={linkToken}
      className={className}
      btnText={btnText}
      isLinkBank={isLinkBank}
      setIsLinkBank={setIsLinkBank}
    />
  ) : (
    <></>
  );
};

interface LinkProps {
  linkToken: string | null;
  className: any;
  btnText?: string;
  setIsLinkBank?: any;
  isLinkBank?: boolean;
}
const Link: React.FC<LinkProps> = (props: LinkProps) => {
  const onSuccess = React.useCallback(async (public_token: any, metadata: any) => {
    setIsLoading(true);
    !props?.isLinkBank && setIsOpen(true);
    // send public_token to server
    const response = await getPublicToken({ public_token });
    if (props?.isLinkBank) {
      props.setIsLinkBank(true);
    } else {
      handleFetchTransactions(response);
    }
  }, []);
  const { UserData } = useSelector((state: any) => state.userData);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [accounts, setAccounts] = useState<any[]>([]);

  const handleFetchTransactions = async (response: any) => {
    try {
      setIsLoading(true);
      setIsOpen(true);
      const res = await fetchPlaidTransactions({
        access_token: response?.access_token,
      });
      const data = res?.accounts?.map((account: any) => {
        const transactions = res?.transactions
          ?.filter((transaction: any) => transaction?.account_id === account?.account_id)
          ?.map((transaction: any) => {
            if (transaction?.amount > 0) {
              return {
                ...transaction,
                received: Math.abs(transaction?.amount),
                spent: '0',
              };
            } else {
              return {
                ...transaction,
                spent: Math.abs(transaction?.amount),
                received: '0',
              };
            }
          });

        return { ...account, transaction_value: 'original', transactions };
      });
      setAccounts(data);
    } catch (error) {
      //error handling
    } finally {
      setIsLoading(false);
    }
  };

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);

  return (
    <>
      <button className={`${props.className} px-4`} onClick={() => open()} disabled={!ready}>
        {props?.btnText || 'Link Account'}
      </button>
      <PDFModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={'Verify information'}>
        {isLoading ? (
          <MainLoader />
        ) : (
          <>
            {step == 1 && (
              <AccountMatchVerification
                setStep={setStep}
                accounts={accounts}
                setAccounts={setAccounts}
              />
            )}
            {step == 2 && (
              <TransactionsPreview
                setAccounts={setAccounts}
                setStep={setStep}
                accounts={accounts}
              />
            )}
            {step == 3 && <ImportCompleted onClose={() => setIsOpen(false)} />}
          </>
        )}
      </PDFModal>
    </>
  );
};
export default LinkButton;
