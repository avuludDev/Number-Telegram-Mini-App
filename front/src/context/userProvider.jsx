/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import { login } from "../libs/login";
import { axiosInstance } from "../libs/axios";
import { generateReferralCode } from "../helpers/common-helpers";
import i18n from "../i18";

// Create a context for the user
const UserContext = createContext(null);

export const handleUpdateUser = async (user, setUser) => {
  await axiosInstance.get(`users/${user.tgId}`).then((res) => {
    setUser(res.data); // Store user data in state
  });
};


// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: "Null",
    tgId: 0,
    locale: "en",
    wallet_address: "",
    balance: 0,
    refferalCode: [],
    refferals: {},
    refferedBy: null,
  });
  const [loading, setLoading] = useState(true); // Handle loading state
  const [error, setError] = useState(null); // Handle errors

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userFromApp = JSON.parse(
          new URLSearchParams(window.Telegram?.WebApp?.initData).get("user")
        );
        const refferer = window.Telegram.WebApp.initDataUnsafe.start_param;
        if (!userFromApp && !userFromApp?.id) {
          setUser({
            username: "Null",
            tgId: 0,
            locale: "en",
            wallet_address: "",
            balance: 0,
            refferalCode: [],
            refferals: [],
            refferedBy: refferer ?? null,
          });
          setLoading(false);
        } else {
          i18n.changeLanguage(userFromApp.language_code);          
          await login(userFromApp.id);
          await axiosInstance
            .get(`users/${userFromApp.id}`)
            .then((res) => {
              setUser(res.data); // Store user data in state
              setLoading(false);
            })
            .catch(async (res) => {
              if (res.status === 404) {
                await axiosInstance.post(`/users`, {
                  username: userFromApp.username,
                  tgId: userFromApp.id,
                  locale: userFromApp.language_code,
                  wallet_address: "",
                  balance: 0,
                  refferalCode: [generateReferralCode()],
                  refferals: {},
                  refferedBy: refferer ?? null,
                }),
                  setUser({
                    username: userFromApp.username,
                    tgId: userFromApp.id,
                    locale: userFromApp.language_code,
                    wallet_address: "",
                    balance: 0,
                    refferalCode: [generateReferralCode()],
                    refferals: {},
                    refferedBy: refferer ?? null,
                  });
                setLoading(false);
              } else console.error(res.error);
            });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch user");
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array means this will run once when the component mounts

  if (loading) return <div>Loading...</div>; // Show a loading spinner or message

  if (error) return <div>Error: {error}</div>; // Show error message

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

// Create a hook for easy access to the user context
export const useUser = () => useContext(UserContext);
