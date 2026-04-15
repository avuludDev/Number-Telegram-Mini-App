/* eslint-disable react/prop-types */
import { useCallback, useState, useEffect} from "react";
import { handleUpdateUser, useUser } from "../context/userProvider";
import { useNavigate } from "react-router-dom";
import WaitPopup from "../popups/WaitPopup";
import ErrorPopup from "../popups/ErrorPopup";
import { axiosInstance } from "../libs/axios";
import { InputNumber } from "./InputNumber";
import SuccessPopup from "../popups/SuccessPopup";
import { useTranslation } from "react-i18next";

export function BuyPopup({ isVisible, onClose }) {
  const [inputValue, setInputValue] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsKeyboardOpen(window.innerHeight < screen.height * 0.8);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const handleBuyNumbers = useCallback(async () => {
    setIsLoading(true);
    if (inputValue > user.balance) {
      setError(
        `${t("no_balance_1")} ${user.balance.toFixed(2)}, ${t(
          "need"
        )} ${inputValue}`
      );
      setIsLoading(false);
      return;
    }
    if (inputValue < 1) {
      setError(`${t("min_buy")} 1 NUM - 1$`);
      setIsLoading(false);
      return;
    }
    if (inputValue % 1 !== 0) {
      setError(t("buy_int"));
      setIsLoading(false);
      return;
    }
    try {
      const result = await axiosInstance.post(`/numbers/buy/${user.tgId}`, {
        amount: inputValue,
      });
      await axiosInstance
        .post(`/postback`, {
          userId: user.tgId,
          status: "buy",
        })
        .catch((e) => console.log(e));
      console.debug(result);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
    try {
      const result = await handleUpdateUser(user, setUser);
      console.debug(result);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
    setSuccess(`${t("success_buy")} ${inputValue} ${t("numbers")}`);
    setIsLoading(false);
    onClose();
  }, [inputValue, onClose, setUser, user]);

  return (
    <>
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
          <p className="popupBuy_frame_p">{t("numbers_choose")}</p>
          <div className="pBf_price">
            <div className="pBf_price_wrap">
              <InputNumber
                inputValue={inputValue}
                setInputValue={setInputValue}
              />
              <p>NUMS</p>
              <button
                id="pBf_price_wrap_max"
                onClick={() => {
                  setInputValue(Math.floor(user.balance / 1));
                }}
              >
                MAX
              </button>
            </div>
            <p className="pBf_price_p1">1$ = 1 NUM</p>
            <p className="pBf_price_p2">
              {t("you_pay")}: {inputValue} USDT
            </p>
          </div>
          <button
            className="popupBuy_frame_buy depositButton"
            onClick={handleBuyNumbers}
          >
            {(t("buy") + " " + t("numbers")).toUpperCase()}
          </button>
          <div className="pBf_balance">
            <p>
              {t("bal")}: <span id="pBf_balance_bal">{user.balance}$</span>
            </p>
            <button
              className="popUp_dep"
              onClick={() =>
                navigate("/wallet", { state: { showDeposit: true } })
              }
            >
              {t("deposit").toUpperCase()}
            </button>
          </div>
        </div>
        <div className="popupBuy_bg" onClick={onClose}></div>
      </div>
      {isLoading && <WaitPopup message={t("wait_confirm")} />}
      {error && <ErrorPopup message={error} onClose={handleCloseError} />}
      {success && (
        <SuccessPopup message={success} onClose={handleCloseSuccess} />
      )}
    </>
  );
}
