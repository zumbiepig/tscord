import dynamic from 'next/dynamic';
import React from 'react';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { Box } from '@chakra-ui/react';
import { barChartOptions } from '@config/charts';
import { type ApexOptions } from 'apexcharts';
import _ from 'lodash';

interface Props {
	series: ApexAxisChartSeries;
	options?: ApexOptions;
}

export const BarChart: React.FC<Props> = ({ series, options }) => {
	// deep merge default bar chart options with additionnal options if provided
	options = _.merge({}, barChartOptions, options);

	return (
		<>
			<Box minH="300px" minW="100%" mt="auto">
				<ApexChart type="bar" series={series} options={options} width="100%" height="100%" />
			</Box>
		</>
	);
};
