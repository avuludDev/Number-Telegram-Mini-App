import axios from 'axios';

interface SendEventRequest {
  userId: number;
  questId: string;
}

export async function sendEventToBaboon(tg_id: number): Promise<void> {
  const apiUrl = 'https://baboon-tg-1bj8.onrender.com/quests/approve';
  const data: SendEventRequest = {
     "userId": tg_id,
    "questId": "Test partner validation"
  }
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'sdfsdfsdfsdfsdfdssdfsdf'
      },
    });

    if (response.status === 201) {
      console.log('Request Baboon successful:', response.status);
    } else {
      console.log('Unexpected Baboon response status:', response.status);
    }
  } catch (error) {
    console.error('Error sending Baboon request:', error);
  }
}
