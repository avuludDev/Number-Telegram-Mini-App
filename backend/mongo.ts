import express from 'express';
import { ClientSession, MongoClient, ObjectId } from 'mongodb';
import { User } from './db/models/user'; // Импортируйте ваш класс UserObject
import { UserInstance } from './db/requests/user';
import { authenticateToken, generateToken } from './jwt';
import cors from 'cors';
import { NumbersInstance } from './db/requests/numbers';
import { generateTx, orderId } from './ton/generateTx';
import { error } from 'console';
import { TransactionInstance } from './db/requests/transactions';
import { WalletsInstance } from './db/requests/wallets';
import { sendUSDT } from './ton/sendTransaction';
import { transactionQueue } from './queue';
import { sendEventToBcoin } from './refs/bcoin2048';
import { AdsInstance } from './db/requests/ads';
import axios from 'axios';
import { sendEventToBaboon } from './refs/baboon';
const app = express();
const PORT = process.env.PORT || 3000;
const PRICE = 1;
const PAYOUT = 1.5;

app.use(express.json());

const uri = "mongodb://dev:Sv2Tm7j3A9@127.0.0.1:27017/?authSource=Numbers";
const uriMongo = "mongodb://devs:Hvz93EbN72@127.0.0.1:27017/?authSource=Wallets";
const client = new MongoClient(uri);
const clientWal = new MongoClient(uriMongo);
const allowedOrigins = ['https://www.numbers-app.tech'];
const userObject = new UserInstance(client);
const numbersObject = new NumbersInstance(client);
const walletObject = new WalletsInstance(clientWal);
const txObject = new TransactionInstance(client);
const adsObject = new AdsInstance(client);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // specify allowed methods
  credentials: true // enable set cookies and Authorization headers
}));
// Подключение к базе данных
async function connectToDatabase() {
  await client.connect();
}

app.post('/init', async (req, res) => {
  try {
    const user: User = req.body;
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при инициализации' });
  }
})

app.post('/users', async (req, res) => {
  try {
    const user: User = req.body;
    const isExist = await userObject.getUserByTelegramId(user.tgId);
    if (isExist && isExist !== null) {
      res.status(200).json({ success: 'User already exist' });
      return;
    }
    const userId = await userObject.addUser(user);

    if (user.refferedBy && user.refferedBy !== null) {
      await userObject.addRefferal(user.refferedBy, user.username, Number(user.tgId));
    }
    const token = generateToken(user);
    res.status(201).json({ userId, token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
  }
});

app.put('/users/:telegramId', authenticateToken, async (req, res) => {
  try {
    const tgId = req.params.telegramId;
    const updateData = req.body;
    const result = await userObject.updateUser(Number(tgId), updateData);
    result ? res.status(200).json({ message: 'Пользователь обновлен' }) :
      res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

app.get('/users/:telegramId', authenticateToken, async (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    const user = await userObject.getUserByTelegramId(Number(telegramId));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

// app.post('/tx/deposit/:wallet_address', authenticateToken, async (req, res) => {
//   try {

//     const orderId: orderId = req.body.orderId;
//     console.log('Request deposit:', orderId);
//     const order = await txObject.getTxByOrderId(orderId);
//     if (order && (order.status === 'Pending' || order.status === 'Confirm')) return;
//     const result = await txObject.updateOrder(orderId, 'Pending');
//     result && res.status(200).json({ message: 'Ордер ожидается' });
//     try {
//       if (result) {
//         const txRes = await txObject.checkOrderSuccess(orderId);
//         if (txRes) {
//           const tx = await txObject.getTxByOrderId(orderId);
//           if (tx) {
//             const user = await userObject.getUserByWallet(tx.from);
//             if (user) {
//               const resultUpd = userObject.updateBal(user.wallet_address, tx.amount / 10 ** 6, true);
//               return;
//             }
//           }
//         }
//       } 
//     }
//     catch (e) {
//       console.log(order , error);
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Ошибка при обновлении ордера' });
//   }
// })

app.post('/tx/deposit/:wallet_address', authenticateToken, async (req, res) => {
  try {
    const session = client.startSession();
    session.startTransaction();
    const orderId: orderId = req.body.orderId;
    console.log('Request deposit:', orderId);

    const order = await txObject.getTxByOrderId(orderId, session);
    if (order && (order.status === 'Pending' || order.status === 'Confirm')) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }
    session.endSession();
    // Добавляем задачу в очередь
    await transactionQueue.add({ orderId },
      {
        attempts: 15, // Максимум 5 попыток
        backoff: 10000 // Задержка между попытками (3 секунды)
      }
    );


    res.status(200).json({ message: 'Order is being processed' });
  } catch (error) {
    console.log('Error in /tx/deposit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

transactionQueue.process(async (job: { data: { orderId: orderId }; }) => {
  const { orderId } = job.data;
  const session = client.startSession();

  try {
    console.log(`Processing transaction for order ${orderId}`);
    session.startTransaction(); // Убедитесь, что транзакция начинается

    // Получение ордера
    const order = await txObject.getTxByOrderId(orderId, session);
    if (!order || order.status === 'Confirm') {
      console.log(`Order ${orderId} already processed or not found`);
      await session.commitTransaction(); // Завершите транзакцию
      return;
    }

    // Проверка статуса транзакции
    const txRes = await txObject.checkOrderSuccess(orderId, session);
    if (!txRes) {
      throw new Error(`Transaction for order ${orderId} was not successful`);
    }

    // Обновление баланса пользователя
    const tx = await txObject.getTxByOrderId(orderId, session);
    if (tx) {
      const user = await userObject.getUserByWallet(tx.from, session);
      if (user) {
        await userObject.updateBal(user.wallet_address, tx.amount / 10 ** 6, true, session);
        console.log(`Balance updated for user: ${user.wallet_address}`);
      }
    }

    // Подтверждение транзакции
    await session.commitTransaction();
    console.log(`Transaction for order ${orderId} committed successfully`);
  } catch (error) {
    // Отмена транзакции только если она была начата
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.error(`Transaction for order ${orderId} aborted due to error:`, error);
    }
    throw error; // Повтор задачи
  } finally {
    session.endSession(); // Завершаем сессию в любом случае
  }
});

app.get('/tx/deposit/:wallet_address/:value', authenticateToken, async (req, res) => {
  const wallet_address = req.params.wallet_address;
  console.log('Request payload:', wallet_address);
  const user = await userObject.getUserByWallet(wallet_address);
  if (!user) {
    res.status(403).json({ error: 'No user' });
  } else {
    const value = req.params.value;
    const receiver = await walletObject.getSafeWallet();
    const payload = generateTx(Number(value), true, receiver);
    const result = await txObject.createOrder(true, payload, user, receiver)
    res.status(200).json(payload);
  }
})

app.get('/tx/:wallet_address', authenticateToken, async (req, res) => {
  const wallet_address = req.params.wallet_address;
  console.log('Request history:', wallet_address);
  const txs = await txObject.getTxsByWalletAddress(wallet_address);
  res.status(200).json({ txs: txs });
  //await txObject.checkWalletOrders(wallet_address, userObject);
})

app.post('/tx/withdraw/:wallet_address', authenticateToken, async (req, res) => {
  const session = client.startSession();

  try {
    session.startTransaction();

    const wallet_address = req.params.wallet_address;
    const value = req.body.value;
    console.log('Request withdraw:', wallet_address, value);

    const payload = generateTx(Number(value), false, wallet_address);
    const user = await userObject.getUserByWallet(wallet_address, session);
    const wallet = await walletObject.getWallet();

    if (!user || !wallet) {
      throw new Error('User or wallet not found');
    }

    if (user.balance < Number(value)) {
      throw new Error('Insufficient balance');
    }

    // Обновляем баланс пользователя
    const balanceUpdated = await userObject.updateBal(wallet_address, value, false, session);
    if (!balanceUpdated) {
      throw new Error('Failed to update balance');
    }

    // Создаём ордер на вывод
    const orderCreated = await txObject.createOrder(false, payload, user, wallet.address, session);
    if (!orderCreated) {
      throw new Error('Failed to create withdrawal order');
    }

    // Отправляем транзакцию
    try {
      const success = await sendUSDT(payload, wallet.mnemonic);
      if (!success) {
        throw new Error('Insufficient wallet balance for transaction');
      }

      // Обновляем статус ордера как успешный
      await txObject.updateOrder(payload.comment, 'Confirm', session);
    } catch (error) {
      // Если отправка USDT не удалась, отменяем вывод и возвращаем баланс
      await txObject.updateOrder(payload.comment, 'Cancel', session);
      await userObject.updateBal(wallet_address, value, true, session);
      throw error;
    }

    // Завершаем транзакцию
    await session.commitTransaction();
    res.status(200).json({ message: 'Баланс обновлен' });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Ошибка при выводе средств' });
  } finally {
    session.endSession();
  }
});


app.post('/numbers/buy/:telegramId', authenticateToken, async (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    const amount = req.body.amount;
    const user = await userObject.getUserByTelegramId(Number(telegramId));
    if (user && user._id) {
      if (amount * PRICE <= user.balance) {
        await userObject.updateBal(user.wallet_address, amount, false);
        const closedNumbers = await numbersObject.openMultipleNumbers(user._id, amount);
        const payTo = await numbersObject.getUsersByNumbers(closedNumbers)
        const userIds = payTo.map(number => number.payoutTo);
        const result = await userObject.updateBalMultiple(userIds);
        const resultRef = await userObject.updateRefMultiple(userIds);
        try {
          if (user.refferedBy === 'from_bcoin') {
            await sendEventToBcoin(Number(telegramId))
            console.log('Bcoin2048 Event Confirmed', user.tgId, user.username)
          }
        } catch (error) {
          console.log('Bcoin2048 Event Failed', error)
        }
        try {
          if (user.refferedBy === 'from_baboon') {
            await sendEventToBaboon(Number(telegramId))
            console.log('Baboon Event Confirmed', user.tgId, user.username)
          }
        } catch (error) {
          console.log('Baboon Event Failed', error)
        }
        if (result) {
          res.status(200).json({ message: 'Успешно добавлены номера' });
        } else {
          res.status(404).json(null);
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
})

app.get('/numbers/:telegramId/:offset', authenticateToken, async (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    const limit = 100; // Default limit is 100
    const offset = parseInt(req.params.offset, 10) || 0; // Default offset is 0
    const user = await userObject.getUserByTelegramId(Number(telegramId));
    if (user && user._id) {
      const numbers = await numbersObject.getNumbersByUser(user._id, limit, offset);
      const total = await numbersObject.getCountByUser(user._id); // Total number of numbers
      res.status(200).json({ numbers, total });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving numbers' });
  }
})

app.get('/numbers', authenticateToken, async (req, res) => {
  try {
    const lastNumber = await numbersObject.getLastNumber();
    res.status(200).json(lastNumber.number);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении номеров' });
  }
})

app.post('/click', async (req, res) => {
  const { clickId, userId, status } = req.body;

  if (!clickId || !userId || !status) {
    return res.status(400).json({ error: '0' });
  }
  try {
    await adsObject.addClick(clickId, Number(userId), status)
    const postbackUrl = `https://kdtrk.net/ru/postback/?data=${clickId}&status=${status}`;
    const response = await axios.get(postbackUrl);
    console.log(`Постбек отправлен: ${clickId},${userId},${status}`);
  } catch (error) {
    console.error(`Ошибка отправки постбека: ${error}`);
    res.status(500).json({ error: 'not ok' });
  }
  res.json({ message: '1' });
})

app.post('/postback', async (req, res) => {
  const { userId, status } = req.body;

  if (!userId || !status) {
    return res.status(400).json({ error: 'userId и status обязательны' });
  }

  const clickId = await adsObject.getClick(Number(userId));

  if (clickId) {
    try {
      await adsObject.addClick(clickId, Number(userId), status);
      const postbackUrl = `https://kdtrk.net/ru/postback/?data=${clickId}&status=${status}`;
      const response = await axios.get(postbackUrl);
      console.log(`Постбек отправлен: ${status},${userId},${status}`);

      res.json({ msg: 'ok' });
    } catch (error) {
      console.error(`Ошибка отправки постбека: ${error}`);
      res.status(500).json({ error: 'not ok' });
    }
  } else {
    res.status(200).json({ msg: 'ok' });
  }
});

// Запуск сервера
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error(err));