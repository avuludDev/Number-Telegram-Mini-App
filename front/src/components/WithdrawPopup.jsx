import { useCallback, useState, useEffect } from "react";
import { handleUpdateUser, useUser } from "../context/userProvider";
import { axiosInstance } from "../libs/axios";
import WaitPopup from "../popups/WaitPopup";
import ErrorPopup from "../popups/ErrorPopup";
import { InputNumber } from "./InputNumber";
import { useTranslation } from "react-i18next";

/* eslint-disable react/prop-types */
export function WithdrawPopup({ isVisible, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState();
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsKeyboardOpen(window.innerHeight < screen.height * 0.8);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const handleWithdraw = useCallback(async () => {
    if (inputValue > user.balance) {
      setError(
        `${t("no_balance")} ${user.balance}, ${t("need")} ${inputValue}`
      );
      return;
    }
    if (inputValue < 0.1) {
      setError(`${t("min_with")} 0.10 USDT`);
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post(`/tx/withdraw/${user.wallet_address}`, {
        value: inputValue,
      });
    } catch (error) {
      setError(error?.message);
    }
    try {
      const result = await handleUpdateUser(user, setUser);
      console.debug(result);
    } catch (error) {
      setError(error?.message);
    }
    setIsLoading(false);
    onClose();
  }, [inputValue, user, onClose, setUser]);

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div
      className="popupBuy"
      style={{
        display: isVisible ? "flex" : "none",
        alignItems: isKeyboardOpen ? "flex-start" : "center",
        paddingTop: isKeyboardOpen ? "20vh" : "0",
      }}
    >
      <div className="popupBuy_frame">
        <p className="popupBuy_close" onClick={onClose}>
          +
        </p>
        <div className="popupBuy_deposit">
          <p className="popupBuy_deposit_p">
            USDT&nbsp;&nbsp;<span>TON</span>
          </p>
          <p className="popupBuy_deposit_bal">
            {t("bal").toUpperCase()}:
            <span className="pd_bal">{user.balance.toFixed(2)}</span>
          </p>
        </div>
        <div className="pBf_price">
          <div className="pBf_price_wrap">
            <InputNumber
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
            <p>USDT</p>
            <button onClick={() => setInputValue(Number(user.balance))}>
              MAX
            </button>
          </div>
        </div>
        <button
          className="popupBuy_frame_buy withdrawButton"
          onClick={handleWithdraw}
        >
          {t("withdraw").toUpperCase()}
        </button>
      </div>
      <div className="popupBuy_bg" onClick={onClose}></div>
      {isLoading && <WaitPopup message={t("wait_confirm")} />}
      {error && <ErrorPopup message={error} onClose={handleCloseError} />}
    </div>
  );
}
