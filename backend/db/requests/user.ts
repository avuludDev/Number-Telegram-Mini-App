import { ClientSession, Collection, Condition, Db, MongoClient, ObjectId, WithId } from 'mongodb';
import { User } from '../models/user';
import { Refferal } from '../models/refferals';

export class UserInstance {
  database: Db;
  collection: Collection<User>;

  constructor(client: MongoClient) {
    this.database = client.db("Numbers");
    this.collection = this.database.collection("users");
  }

  async addUser(user: User): Promise<any> {
    const result = await this.collection.insertOne(user);
    return result;
  }

  async updateUser(tgId: number, updateData: Partial<User>) {
    if (updateData.wallet_address) {
      const user = await this.getUserByTelegramId(tgId);
      if (user?.wallet_address !== "") return;
    }
    const result = await this.collection.updateOne(
      { tgId: tgId },
      { $set: updateData }
    );
    return result
  }

  async updateRefferals(user: User, refferal: Refferal, tgId: number) {
    const result = await this.collection.updateOne(
      { tgId: user.tgId },
      { $set: { refferals: { ...user.refferals, [tgId]: refferal } } }
    );
    return result;
  }

  async updateBal(wallet_address: string, value: number, isDeposit: boolean, session?: ClientSession) {
    const user = await this.getUserByWallet(wallet_address, session);
    console.log(`Update User Balance ${user?.username} | ${user?.balance} | ${value} | ${isDeposit ? 'Deposit' : 'Withdraw'}`);
    if (user) {
      const balance = isDeposit ? user.balance + value : user.balance - value;
      if (balance >= 0) {
        const result = await this.collection.updateOne(
          { wallet_address },
          { $set: { balance: balance } },
          { session }
        );
        return result
      } else {
        throw new Error('Not enough balance');
      }
    }
  }

  async updateBalMultiple(userIds: ObjectId[]) {
    const results = []

    // Сначала подсчитываем количество вхождений
    const counts = userIds.reduce<Record<string, number>>((acc, id) => {
      const idStr = id.toString(); // Приводим ObjectId к строке
      acc[idStr] = (acc[idStr] || 0) + 1;
      return acc;
    }, {});

    // Преобразуем результат в массив объектов
    const result = Object.entries(counts).map(([id, count]) => ({
      id: new ObjectId(id),
      count
    }));

    for (const userId of result) {
      const result = await this.collection.updateOne(
        { _id: userId.id },         // Find users by matching `_id`
        { $inc: { balance: 1.5 * userId.count } }          // Increment balance by 1.5 for each user
      );
      results.push(result);
    };

    return results;
  }

  async updateRefMultiple(userIds: ObjectId[]) {
    const results = [];
    for (const id of userIds) {
      const user = await this.getUserById(id);
      if (user && user.refferedBy && user.refferedBy !== null) {
        const result = await this.collection.updateOne(
          { referralCode: { $in: [user.refferedBy] } },
          {
            $inc: {
              balance: 0.15,
              [`refferals.${user.tgId}.rewards`]: 0.15
            }
          }
        );
        results.push(result);

      }
    };
    return results;
  }

  async getUserByTelegramId(tgId: number): Promise<User | null> {
    const user = await this.collection.findOne({ tgId: Number(tgId) });
    return user as User;
  }

  async getUsersByIds(_ids: ObjectId[]): Promise<User[]> {
    const users = await this.collection.find({ "_id": { $in: _ids } })
      .toArray();
    return users as User[];
  }

  async getUserById(_id: ObjectId): Promise<User> {
    const user = await this.collection.findOne({ "_id": _id });
    return user as User;
  }

  async getUserByWallet(wallet_address: string, session?: ClientSession): Promise<User | null> {
    const user = await this.collection.findOne({ wallet_address }, { session });

    return user as User;
  }

  async getUserByRefferalCode(refferalCode: string): Promise<User | null> {
    const user = await this.collection.findOne({ refferalCode });
    return user as User;
  }

  async addRefferal(refferedBy: string, name: string, tgId: number) {
    const refferer = await this.getUserByRefferalCode(refferedBy);
    if (refferer && refferer._id) {
      const refferal: Refferal = {
        name, rewards: 0, refferedBy: refferer._id
      }
      await this.updateRefferals(refferer, refferal, tgId);
    }
  }

  async changeReferralCodesToArray(){
    try {
      // Find all documents where referralCode is a string
      const users = await this.collection.find({}).toArray();
      const updates = [];
      for(let user of users) {
        if(user && typeof user.refferalCode === 'string'){
          const result = await this.updateUser(user.tgId, {refferalCode: [user.refferalCode]})
          updates.push(result);
        }
      }
     
      console.log(`Updated ${updates.length} documents.`);
      return updates;
    } catch (error) {
      console.error("Error updating referral codes:", error);
      throw error;
    }
  };
  
}



