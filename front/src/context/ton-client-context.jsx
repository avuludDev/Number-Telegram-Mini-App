import { createContext, useState, useContext } from 'react';
import { TonClient } from '@ton/ton';
import { useTonConnect } from '../hooks/useTonConnect';
import { useAsyncInitialize } from '../hooks/useAsyncInitialize';
import PropTypes from 'prop-types';

const TonClientContext = createContext({tonClient: undefined});

export const TonClientProvider = ({ children }) => {
  const { network } = useTonConnect();
  const [client, setClient] = useState();

  useAsyncInitialize(async () => {
    if (!network) return;
    const tonClient = new TonClient({endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: 'afe3796906edbca388eccbf03e05fc85164cbecd9a6e8ab5adc0a8276b85777f'});
    setClient(tonClient);
  }, [network]);


  return (
    <TonClientContext.Provider value={{ tonClient: client }}>
      {children}
    </TonClientContext.Provider>
  );
};

export const useTonClient = () => useContext(TonClientContext);

TonClientProvider.propTypes = {
    children: PropTypes.element.isRequired,
  };