import { useTranslation } from "react-i18next";
import { useUser } from "../context/userProvider";
import { axiosInstance } from "../libs/axios";
import { useCallback, useEffect, useState } from "react";

function formatTimestampToDDMMM(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

/* eslint-disable react/prop-types */
export function History({ isVisible, onClose }) {
  // Масив транзакцій для прикладу (його можна отримувати з пропсів або API)
  const [transactions, setTransactions] = useState([]);
  const { user } = useUser();
  const { t } = useTranslation();

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axiosInstance
        .get(`/tx/${user.wallet_address}`)
        .then((res) => res.data.txs)
        .catch(() => []);
      console.log(response);
      setTransactions(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [user]);

  const handleCheckDeposit = async(orderId) => {
    try {
      await axiosInstance.post(
       `/tx/deposit/${user.wallet_address}`,
       {
         orderId: orderId,
       }
     );
    } catch (error) {
     console.log(error)
    }
  }

  useEffect(() => {
    fetchTransactions(); // Fetch transactions when component mounts
  }, [fetchTransactions, user.balance]);

  return (
    <div
      className="popupBuy"
      id="popUp_transactionHistory"
      style={{ display: isVisible ? "flex" : "none" }}
    >
      <div className="popupBuy_frame">
        <p className="popupBuy_close" onClick={onClose}>
          +
        </p>
        <div className="transactionHistory">
          {transactions.length !== 0 ? (
            transactions.map((transaction) => (
              <div key={transaction._id} style={{cursor: 'pointer'}} className="transactionHistory_item" onClick={()=>transaction.status === 'Create' && handleCheckDeposit(transaction.orderId)}>
                <div className="tH_i_row1">
                  <p className="tH_i_row1_topup">
                    {transaction.deposit ? t('top_up') : t('withdraw')}
                  </p>
                  <p
                    className={`tH_i_row1_${
                      transaction.deposit ? "topupNum" : "withdrawNum"
                    }`}
                  >
                    {transaction.amount / 10 ** 6}
                  </p>
                </div>
                <div className="tH_i_row2">
                  <p>{formatTimestampToDDMMM(transaction.timestamp)}</p>
                  {transaction.hash ? (
                    <a
                      style={{ color: "white" }}
                      href={`https://tonviewer.com/transaction/${transaction.hash}`}
                      target="_blank"
                    >
                      {t(transaction.status)}
                    </a>
                  ) : (
                    <p style={{cursor: 'pointer'}}> {t(transaction.status)}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {t('no_transaction')}
            </p>
          )}
        </div>
      </div>
      <div className="popupBuy_bg" onClick={onClose}></div>
    </div>
  );
}
