import dynamic from 'next/dynamic';
import React from 'react';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { Box, Flex } from '@chakra-ui/react';
import { pieChartOptions } from '@config/charts';
import { type ApexOptions } from 'apexcharts';
import _ from 'lodash';

interface PieChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries;
	options?: ApexOptions;
	children?: React.ReactNode;
}

export const PieChart: React.FC<PieChartProps> = ({ series, options, children }) => {
	// deep merge default line chart options with additionnal options if provided
	options = _.merge({}, pieChartOptions, options);

	return (
		<>
			<Flex flexDir="column" justifyContent="space-around" alignItems="center" minH="300px" minW="100%" mt="auto">
				<ApexChart type="pie" series={series} options={options} width="100%" height="55%" />

				{children}
			</Flex>
		</>
	);
};
