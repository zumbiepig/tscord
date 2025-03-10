import { authorizationCache } from '@core/utils/cache';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	authorizationCache.invalidate();

	res.status(200).send('Authorization cache invalidated');
};

export default handler;
