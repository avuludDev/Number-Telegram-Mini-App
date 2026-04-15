import * as Queue from 'bull'

// Создаем очередь
export const transactionQueue = new Queue.default('transactions', {
    redis: { host: '127.0.0.1', port: 6379 },
});

// Обработчик ошибок
transactionQueue.on('failed', (job: { id: any; }, err: any) => {
    console.error(`Job ${job.id} failed:`, err);
});

transactionQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully!`);
  });
