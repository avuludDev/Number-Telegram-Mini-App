import { useEffect, useState } from "react";
import story from "../img/history.svg";
import { DepositPopup } from "./DepositPopup";
import { WithdrawPopup } from "./WithdrawPopup";
import { History } from "./History";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { handleUpdateUser, useUser } from "../context/userProvider";
import { axiosInstance } from "../libs/axios";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Wallet() {
  const location = useLocation();
  const showDeposit = location.state?.showDeposit;
  const showWithdraw = location.state?.showWithdraw;
  const [isDepositVisible, setDepositVisible] = useState(showDeposit ?? false); // Відповідає за попап поповнення
  const [isWithdrawVisible, setWithdrawVisible] = useState(
    showWithdraw ?? false
  ); // Відповідає за попап виведення
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const userAddress = useTonAddress();
  const { user, setUser } = useUser(); // Access user context
  const {t} = useTranslation();
  // Показати/сховати попапи
  const handleTopUp = () => setDepositVisible(true);
  const handleWithdraw = () => setWithdrawVisible(true);
  const handleHistory = () => setHistoryVisible(true);
  const closePopups = () => {
    setDepositVisible(false);
    setWithdrawVisible(false);
    setHistoryVisible(false);
  };

  useEffect(() => {
    handleUpdateUser(user, setUser);
  }, []);

  useEffect(() => {
    if (userAddress !== "" && user.tgId) {
      axiosInstance.put(`/users/${user.tgId}`, { wallet_address: userAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, user.tgId]);
  return (
    <div className="wallet" id="divwallet">
      <h1 className="wallet_title">{t('balance').toUpperCase()}</h1>
      <div className="wallet_price">
        <p className="wallet_price_num">
          {" "}
          <img
            className="wallet_price_img"
            onClick={handleHistory}
            src={story}
            alt="Transaction History"
          />
          {user.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? 0} $
        </p>
      </div>
      <div className="wallet_price_buttons">
          <button className="btn_topup" onClick={handleTopUp}>
          {t('top_up').toUpperCase()}
          </button>
          <button className="btn_withdraw" onClick={handleWithdraw}>
          {t('withdraw').toUpperCase()}
          </button>
        </div>
      <div
        style={{
          justifyContent: "center",
          display: "flex",
          width: "90%",
        }}
      >
        <button
          style={{
            fontSize: "5vw",
            padding: "20px 0px",
            width: "90%",
            fontWeight: "bold",
            borderRadius: "50px",
            border: "3px solid black",
            color: 'black',
            backgroundColor: 'white' 
          }}
          onClick={() =>
            tonConnectUI.account
              ? tonConnectUI.disconnect()
              : tonConnectUI.openModal()
          }
        >
          {tonConnectUI.account ? t('disconnect').toUpperCase() : t('connect').toUpperCase()}
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: "15px", margin: "10px" }}>
        {tonConnectUI.account
          ? userAddress.slice(0, 7) + "..." + userAddress.slice(-7)
          : ""}
      </p>
      {/* Попапи */}
      <DepositPopup isVisible={isDepositVisible} onClose={closePopups} />
      <WithdrawPopup isVisible={isWithdrawVisible} onClose={closePopups} />
      <History isVisible={isHistoryVisible} onClose={closePopups} />
    </div>
  );
}
