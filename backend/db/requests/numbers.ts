import { Collection, Db, InsertOneResult, MongoClient, ObjectId, WithId } from "mongodb";
import { Numbers } from "../models/numbers";

export class NumbersInstance {
    database: Db;
    collection: Collection<Numbers>;
    nullNumber: Numbers = {
        number: 0,
        closedBy: null,
        payoutTo: new ObjectId()
    };

    constructor(client: MongoClient) {
        this.database = client.db("Numbers");
        this.collection = this.database.collection("numbers");
    }

    async openNumber(userId: ObjectId) {
        const number: Numbers =
        {
            number: (await this.getLastNumber())?.number + 1,
            closedBy: null,
            payoutTo: userId
        }
        const result = await this.collection.insertOne(number);
        await this.closeNumber(number, userId);
        return result;
    }

    async openMultipleNumbers(userId: ObjectId, count: number) {
        const lastNumber = (await this.getLastNumber())?.number ?? 0;
        const numbers: Numbers[] = [];
        for (let i = 0; i < count; i++) {
            const number: Numbers = {
                number: lastNumber + i + 1,
                closedBy: null,
                payoutTo: userId
            };
            numbers.push(number);
        }

        const result = await this.collection.insertMany(numbers);
        const closed = await this.closeMultipleNumbers(numbers, userId);

        return closed;
    }


    async closeNumber(openNumber: Numbers, userId: ObjectId) {
        if ((openNumber.number - 1) % 2 == 0 && openNumber.number !== 1) {
            const result = await this.collection.updateOne(
                { number: openNumber.number / 2 - 1 },
                { $set: { closedBy: userId } }
            );
        }
    }

    async closeMultipleNumbers(numbers: Numbers[], userId: ObjectId) {
        // Сформируем массив номеров, которые нужно закрыть
        const numbersToClose = numbers
            .filter(number => (number.number - 1) % 2 === 0 && number.number !== 1)
            .map(number => (number.number - 1) / 2);
        // Если есть номера для закрытия, выполним массовое обновление
        if (numbersToClose.length > 0) {
            const result = await this.collection.updateMany(
                { number: { $in: numbersToClose } },
                { $set: { closedBy: userId } }
            );
            return numbersToClose;
        }

        return [];
    }

    async getLastNumber(): Promise<Numbers> {
        const lastNumber = await this.collection.findOne({}, { sort: { _id: -1 } });
        return lastNumber ?? this.nullNumber;
    }

    async getUsersByNumbers(numbers: number[]) {
        const users = await this.collection.find({
            "number": { $in: numbers },
            
        }, { projection: { payoutTo: 1, _id: 0 } })
        .toArray()
        return users
    }
    // Получить последние 10 номеров
    async getLastTenNumbers() {
        const lastTenNumbers = await this.collection
            .find({})
            .sort({ _id: -1 })
            .limit(10)
            .toArray();
        return lastTenNumbers;
    }

    // Получить номера, которые относятся к указанному юзеру (payoutTo)
    async getNumbersByUser(userId: ObjectId, limit: number, offset: number) {
        const userNumbers = await this.collection
            .find({ "payoutTo": userId })
            .skip(offset)
            .limit(limit)
            .toArray();
        
        return userNumbers;
    }

    async getCountByUser(userId:ObjectId) {
        const count =  await this.collection.countDocuments({ "payoutTo": userId });
        const countClosed = await  this.collection.countDocuments({ "payoutTo": userId, "closedBy": null });
        return {total: count, open: countClosed, closed: count - countClosed};
      }

    
}
