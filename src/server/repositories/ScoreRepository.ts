
import { EntityRepository, QueryOrder } from "@mikro-orm/core";

import { Score } from "../models/Score";
import { IScore } from "../types/abstract";

export type RequestRepo = EntityRepository<Score>;

export class ScoreRepository {
	private static readonly CacheSize = 3000;

	public static async InsertOne(manager: RequestRepo, score: IScore): Promise<Score> {
		try {
			const newScore = new Score();
			newScore.player = score.player;
			newScore.score = score.score;

			await manager.persistAndFlush(newScore);
			return newScore;
		} catch (error) {
			throw Error(error);
		}
	}

	public static async FindTopTen(manager: RequestRepo): Promise<Score[]> {
		try {
			return await manager.find({}, { cache: ScoreRepository.CacheSize, orderBy: { score: QueryOrder.DESC }, limit: 10 });
		} catch (error) {
			throw Error(error);
		}
	}
}
