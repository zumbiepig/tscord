import dayjs from 'dayjs';
import { Paste, RentryClient } from 'rentry-pastebin';

import { Pastebin as PastebinEntity } from '@/entities';
import { Database } from '@/services';
import { Schedule, Service } from '@/utils/decorators';

@Service()
export class Pastebin {
	private client: RentryClient = new RentryClient();

	constructor(private db: Database) {
		void this.client.createToken();
	}

	private async waitForToken(): Promise<void> {
		while (!this.client.getToken())
			await new Promise((resolve) => setTimeout(resolve, 100));
	}

	async createPaste(
		content: string,
		lifetime?: number,
	): Promise<Paste | undefined> {
		await this.waitForToken();

		const paste = await this.client.createPaste({ content });

		const pasteEntity = new PastebinEntity();
		pasteEntity.id = paste.url;
		pasteEntity.editCode = paste.editCode;
		if (lifetime) pasteEntity.lifetime = Math.floor(lifetime);

		await this.db.em.persistAndFlush(pasteEntity);

		return paste.paste;
	}

	async deletePaste(id: string): Promise<void> {
		await this.waitForToken();

		const paste = await this.db.get(PastebinEntity).findOne({ id });

		if (!paste) return;

		this.client.deletePaste(id, paste.editCode);
		await this.db.get(PastebinEntity).nativeDelete(paste);
	}

	@Schedule('*/30 * * * *')
	// @ts-expect-error - method has the @Schedule decorator
	private async autoDelete(): Promise<void> {
		const pastes = await this.db
			.get(PastebinEntity)
			.find({ lifetime: { $gt: 0 } });

		for (const paste of pastes) {
			const diff = dayjs().diff(dayjs(paste.createdAt), 'day');

			if (diff >= paste.lifetime)
				this.client.deletePaste(paste.id, paste.editCode);
		}
	}
}
