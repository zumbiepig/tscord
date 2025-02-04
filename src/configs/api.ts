import env from '@/env';
import type { APIConfigType } from '@/utils/types';

export const apiConfig: APIConfigType = {
	enabled: false, // is the API server enabled or not
	port: env.API_PORT, // the port on which the API server should be exposed
};
