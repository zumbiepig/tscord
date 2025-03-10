import { isUserAuthorizedForBot } from '@core/utils/functions';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId, botId } = req.query as {
			userId: string;
			botId: string;
		};

	if (!userId) {
		res.status(401).send('Unauthorized');
		return;
	}

	// first, we check in the cache
	const isAuthorized = await isUserAuthorizedForBot(userId, botId);

	if (isAuthorized) {res.status(200).send('Authorized');}
	else {res.status(401).send('Unauthorized');}
};

export default handler;
