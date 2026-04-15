import axios from 'axios';

interface SendEventRequest {
  token: string;
  tg_id: number;
  task_id: number;
  buyer_id: number;
  checkpoint_id: number;
}

export async function sendEventToBcoin(tg_id: number): Promise<void> {
  const apiUrl = 'https://api.bcoin2048.com/api/v2/tasks/send-event';
  const data: SendEventRequest = {
    "token": "132b17b11ce63fca7d20cfd4824fe61ce0e6a77d7b1b2f4e730dba508cd7bc5a",
    "tg_id": tg_id,
    "task_id": 395,
    "buyer_id":  63,
    "checkpoint_id": 483
  }
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 202) {
      console.log('Request BCoin successful:', response.status);
    } else {
      console.log('Unexpected BCoin response status:', response.status);
    }
  } catch (error) {
    console.error('Error sending BCoin request:', error);
  }
}
