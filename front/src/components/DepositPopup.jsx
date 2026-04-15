/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
//import { useUser } from "../user/userProvider";
import { useEffect, useState, useCallback } from "react";
import { useTonConnect } from "../hooks/useTonConnect";
//import { useNavigate } from 'react-router-dom';
import { Address, JettonMaster } from "@ton/ton";
import { JettonWallet } from "../wrappers/JettonWallet";
import ErrorPopup from "../popups/ErrorPopup";
import { handleUpdateUser, useUser } from "../context/userProvider";
import { axiosInstance } from "../libs/axios";
import { InputNumber } from "./InputNumber";
import WaitPopup from "../popups/WaitPopup";
import { useTranslation } from "react-i18next";
export function DepositPopup({ isVisible, onClose }) {
  //const user = useUser();
  const [balanceUSDT, setBalanceUSDT] = useState(0);
  const [error, setError] = useState(null);
  const { user, setUser } = useUser();

  const handleCloseError = () => {
    setError(null); // Закрыть попап
  };
  //const navigate = useNavigate();
  const { sender, walletAddress, tonClient } = useTonConnect();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const USDT_MASTER_ADDRESS = Address.parse(
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
  );
  const [inputValue, setInputValue] = useState();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsKeyboardOpen(window.innerHeight < screen.height * 0.8);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const handleCompletePayment = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!tonClient || !walletAddress) {
        setIsLoading(false);
        setError(t("no_wallet"));
        return;
      }
      if (balanceUSDT < inputValue) {
        setIsLoading(false);
        setError(`${t("no_usdt")} ${balanceUSDT}, ${t("need")} ${inputValue}`);
        return;
      }
      if (inputValue < 0.1) {
        setIsLoading(false);
        setError(`${t("min_dep")} 0.10 USDT`);
        return;
      }
      const jettonMaster = tonClient.open(
        JettonMaster.create(USDT_MASTER_ADDRESS)
      );
      const usersUsdtAddress = await jettonMaster.getWalletAddress(
        walletAddress
      );

      const jettonWallet = tonClient.open(
        JettonWallet.createFromAddress(usersUsdtAddress)
      );

      const payload = await axiosInstance
        .get(
          `/tx/deposit/${user.wallet_address}/${Number(
            (inputValue * 10 ** 6).toFixed(0)
          )}`
        )
        .then((res) => res.data)
        .catch((e) => setError(e.message));
      console.log(payload);
      if (!payload) return;
      await jettonWallet.sendTransfer(sender, payload);
      await axiosInstance
        .post(`/postback`, {
          userId: user.tgId,
          status: "deposit",
        })
        .catch((e) => console.log(e));
      try {
        await axiosInstance.post(`/tx/deposit/${usersUsdtAddress.toString()}`, {
          orderId: payload.comment,
        });
      } catch (error) {
        setError(error?.message);
      }

      try {
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(
          window,
          document,
          "script",
          "https://connect.facebook.net/en_US/fbevents.js"
        );

        // Dynamic Pixel ID
        fbq("init", "<?=$_GET['fbp'];?>");

        // Static Pixel ID
        fbq("init", "483539361182012");

        fbq("track", "PageView");

        fbq("track", "Purchase", { value: inputValue, currency: "USD" });
      } catch (error) {
        console.log("PIXEL Error", error);
      }

      try {
        await handleUpdateUser(user, setUser);
      } catch (error) {
        setIsLoading(false);
        setError(error?.message ?? error);
      }
      setIsLoading(false);
    } catch (e) {
      setError(e.message ?? e);
      setIsLoading(false);
    }
  }, [tonClient, walletAddress, sender, inputValue]);

  const handleGetBalance = useCallback(async () => {
    if (!tonClient || !walletAddress) {
      return;
    }

    const jettonMaster = tonClient.open(
      JettonMaster.create(USDT_MASTER_ADDRESS)
    );
    const usersUsdtAddress = await jettonMaster.getWalletAddress(walletAddress);
    // creating and opening jetton wallet instance.
    // First argument (provider) will be automatically substituted in methods, which names starts with 'get' or 'send'
    const jettonWallet = tonClient.open(
      JettonWallet.createFromAddress(usersUsdtAddress)
    );
    const balance = await jettonWallet.getWalletData();

    setBalanceUSDT((Number(balance.balance) / 10 ** 6).toFixed(2));
  }, [walletAddress]);

  useEffect(() => {
    handleGetBalance();
  }, [walletAddress]);

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
            {t("bal").toUpperCase()}: {balanceUSDT}$
          </p>
        </div>
        <div className="pBf_price">
          <div className="pBf_price_wrap">
            <InputNumber
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
            <p>USDT</p>
          </div>
        </div>
        <button
          className="popupBuy_frame_buy depositButton"
          onClick={handleCompletePayment}
        >
          {t("deposit").toUpperCase()}
        </button>
      </div>
      <div className="popupBuy_bg" onClick={onClose}></div>
      {error && <ErrorPopup message={error} onClose={handleCloseError} />}
      {isLoading && <WaitPopup message={t("wait_confirm")} />}
    </div>
  );
}

DepositPopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
