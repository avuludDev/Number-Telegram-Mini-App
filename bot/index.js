import { Telegraf, Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import axios from 'axios'
import fs from 'fs'

const token = '7600157289:AAFzDuM4TLXGQnvz5DPnKw0VoCKSgEtyI8c'
const webAppUrl = 'https://www.numbers-app.tech/'

const bot = new Telegraf(token)

export const generateReferralCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }
  return referralCode;
}

bot.command('start', async (ctx) => {
  const startParam = String(ctx.payload);
  if (startParam.startsWith('sub1_')) {
    try {
      await axios.post('https://numbers-app.tech/api/click', { clickId: startParam.replace('sub1_', ''), userId: ctx.from.id, status: 'start' });
    } 
    catch (e) {
      console.log(e);
    }
  }

  const userLocale = ctx.from.language_code || 'en';
  try {
    const user = {
      username: ctx.from.username,
      tgId: ctx.from.id,
      locale: userLocale,
      wallet_address: "",
      balance: 0,
      refferalCode: [generateReferralCode()],
      refferals: [],
      refferedBy: ctx.payload === '' ? null : startParam,
    }
    await axios.post('https://numbers-app.tech/api/users', user);
  } catch (error) {
    console.log(error);
  }
  let message = '';
  let message1 = '';
  let message2 = '';
  let message3 = '';

  if (userLocale === 'ru') {
    message = `Добро пожаловать в “Number” — ваш новый способ зарабатывать легко и быстро! 💵
Здесь вы можете превратить даже 1$ в ощутимую прибыль, следуя простым шагам.  

⁉️ КАК ЭТО РАБОТАЕТ  ⁉️
В нашем приложении прибыль формируется за счёт новых пользователей, которые приобретают номера и продвигают очередь. Вы оформляется номер , а когда очередь доходит до него, средства с прибылью +50% зачисляются на ваш баланс, который вы можете вывести. 💰 Всё просто и понятно! 

Ваш путь к доходу в 3 шага: 🚀
1. Приобретаете номер — это ваш вклад в систему.  
2. Получаете прибыль — 50% от вложенной суммы в короткие сроки.  
   ⏱  Средний срок ожидания выплат — от 5 минут до 2 дней. 
3. Расширяйте свой доход — покупайте неограниченное количество номеров и увеличивайте свои выплаты.  

💡 Пример:  
Вы приобретаете номер за 1$. Через несколько часов ваша очередь подходит, и вы получаете 1.50$. Вы уже в плюсе!   
Приобрели на 100$ — получили 150$. 💵

Почему “Number” — это выгодно? 🏆
- 🔍 Прозрачность и контроль: вы всегда видите свою позицию в очереди и понимаете , откуда идут выплаты.  
-  😱 Доступно для всех: начать можно с 1$, а дальше — только ваш выбор.  
- ⚡ Простой процесс: без сложных бирж и риска от волатильных криптовалют.  

Почему вам стоит попробовать прямо сейчас? 🌟
- Это быстро, выгодно и просто — идеальный инструмент для тех, кто хочет зарабатывать без лишних усилий.  
- С каждым новым номером ваши шансы на рост дохода увеличиваются. 💵
💡  Не упустите возможность изменить свою финансовую реальность уже сегодня!*  

🚀 Присоединяйтесь к “Number” — инвестируйте, зарабатывайте, вдохновляйтесь! 💻
`;
    message1 = ` • Как создать и пополнить кошелек?
https://fsr-develop.ru/blog_cscalp/tpost/kak-sozdat-koshelek-v-telegram
`
    message2 = ` • Как пользоваться приложением ?
https://youtube.com/shorts/KIm-FbiXIo4?si=NTEEPNNNyCK9sM8n
`

    message3 = `Также обязательно подпишитесь на наш Telegram-канал, чтобы не пропустить важные обновления и эксклюзивные предложения! 📢
Telegram:https://t.me/NumberBot_officcial/12`
  } else if (userLocale === 'hi') {
    message = `“Number” में आपका स्वागत है — कमाने का एक नया, आसान और तेज़ तरीका! 💵
यहाँ, आप केवल $1 से भी अच्छी कमाई कर सकते हैं, बस कुछ आसान कदमों का पालन करें।

⁉️ यह कैसे काम करता है ⁉️
हमारे ऐप में, लाभ नए उपयोगकर्ताओं द्वारा नंबर खरीदने और कतार को आगे बढ़ाने से उत्पन्न होता है। आप एक नंबर पंजीकृत करते हैं, और जब कतार उस तक पहुँचती है, तो +50% लाभ के साथ राशि आपके बैलेंस में जमा हो जाती है, जिसे आप निकाल सकते हैं। 💰 यह सरल और स्पष्ट है!

कमाई का आपका 3-स्टेप प्लान 🚀
 1. नंबर खरीदें — यह आपका निवेश है।
 2. मुनाफा कमाएं — अपनी राशि का 50% थोड़े समय में पाएं।
⏱ औसत प्रतीक्षा समय: 5 मिनट से 2 दिन।
 3. अपनी कमाई बढ़ाएं — असीमित संख्या में नंबर खरीदें और अपनी कमाई बढ़ाएं।

💡 उदाहरण:

आप $1 का नंबर खरीदते हैं। कुछ घंटों बाद, आपकी बारी आती है और आपको $1.50 मिलते हैं। आप पहले से ही लाभ में हैं!
अगर $100 निवेश करते हैं, तो आपको $150 मिलेंगे। 💵

“Number” क्यों फायदेमंद है?
 • 🔍 पारदर्शिता और नियंत्रण — आप हमेशा अपनी कतार में स्थिति देख सकते हैं और भुगतान की प्रक्रिया समझ सकते हैं।
 • 😱 सबके लिए आसान — सिर्फ $1 से शुरू करें और फिर अपनी मर्ज़ी से बढ़ाएँ।
 • ⚡ सरल प्रक्रिया — कोई जटिल ट्रेडिंग या अस्थिर क्रिप्टो का जोखिम नहीं।

अभी इसे आज़माने की ज़रूरत क्यों है? 🌟
 • यह तेज़, लाभदायक और सरल है — बिना मेहनत के कमाने का बेहतरीन तरीका।
 • जितने अधिक नंबर आप खरीदते हैं, आपकी कमाई बढ़ने के मौके उतने ही अधिक होते हैं। 💵

💡 आज ही अपनी वित्तीय स्थिति बदलने का मौका न गंवाएं!

🚀 “Number” से जुड़ें — निवेश करें, कमाएँ, और प्रेरित हों! 💻
`;
    message1 = `• Telegram वॉलेट कैसे बनाएं और इसे टॉप अप करें
https://peiko.space/blog/article/telegram-crypto-wallet-development-guide#
`
    message2 = ` • Telegram वॉलेट कैसे बनाएं और इसे टॉप अप करें
 • एप्लिकेशन का उपयोग कैसे करें
https://youtube.com/shorts/6bT61on8HKI?si=-TaEUglToObz6b_F
`

    message3 = `इसके अलावा, हमारे टेलीग्राम चैनल को सब्सक्राइब करना न भूलें ताकि आप महत्वपूर्ण अपडेट और विशेष ऑफ़र मिस न करें! 📢
Telegram : https://t.me/NumberBot_officcial/12
`
  }
  else {
    message = `Welcome to “Number” — your new way to earn easily and quickly! 💵
Here, you can turn even $1 into a significant profit by following simple steps.

⁉️ HOW DOES IT WORK ⁉️
In our app, profit is generated through new users who purchase numbers and advance the queue. You register a number, and when the queue reaches it, funds with a +50% profit are credited to your balance, which you can withdraw. 💰 It’s simple and clear!

Your path to earnings in 3 steps: 🚀
 1. Purchase a number — this is your investment in the system.
 2. Earn a profit — get 50% on top of your initial amount in a short time.
⏱ Average waiting time for payouts: 5 minutes to 2 days.
 3. Increase your earnings — buy unlimited numbers and boost your payouts.

💡 Example:

You buy a number for $1. In a few hours, your turn comes, and you receive $1.50. You’re already in profit!
Invest $100 — get $150. 💵

Why is “Number” a great choice?
 • 🔍 Transparency & control — you always see your position in the queue and understand where the payouts come from.
 • 😱 Affordable for everyone — start with just $1, and the rest is up to you.
 • ⚡ Simple process — no complicated exchanges or risks from volatile cryptocurrencies.

Why should you try it right now? 🌟
 • It’s fast, profitable, and easy — a perfect tool for those who want to earn effortlessly.
 • With each new number, your chances of increasing your income grow. 💵

💡 Don’t miss your chance to change your financial reality today!

🚀 Join “Number” — invest, earn, get inspired! 💻
`;
    message1 = `• How to create and top up a Telegram wallet
https://peiko.space/blog/article/telegram-crypto-wallet-development-guide#
`
    message2 = `• How to use the application
https://youtube.com/shorts/CblQLik75hU?si=8o-ZrkjPhLmXVMYs
`

    message3 = `Also, make sure to subscribe to our Telegram channel so you don’t miss out on important updates and exclusive offers! 📢
Telegram : https://t.me/NumberBot_officcial/12
`
  }

  await ctx.reply(message);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.reply(message1);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.reply(message2);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.reply(message3);

})


bot.launch()