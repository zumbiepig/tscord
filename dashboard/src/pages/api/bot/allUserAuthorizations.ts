import { getAuthorizedBotsForUser } from '@core/utils/functions';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId } = req.query as { userId: string };

	if (!userId) {
		res.status(400).send('Bad request: missing `userId` query parameter');
		return;
	}

	const authorizedBots = await getAuthorizedBotsForUser(userId.replaceAll('"', ''));

	res.status(200).json(authorizedBots);
};

export default handler;
