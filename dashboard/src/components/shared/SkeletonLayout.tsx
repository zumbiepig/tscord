import { Skeleton } from '@chakra-ui/react';
import React from 'react';

interface SkeletonLayoutProps {
	children: React.ReactNode[] | React.ReactNode;
	enabled: boolean;
}

const CustomSkeleton: React.FC<{ children: React.ReactNode; key: number }> = ({ children }) => {
	return (
		<>
			<Skeleton borderRadius="12px" opacity="0.2">
				{children}
			</Skeleton>
		</>
	);
};

export const SkeletonLayout: React.FC<SkeletonLayoutProps> = ({ children, enabled }) => {
	if (!Array.isArray(children)) children = [children];

	return (
		<>
			{(children as React.ReactNode[]).map((child, index) => (
				<>{enabled ? <CustomSkeleton key={index}>{child}</CustomSkeleton> : child}</>
			))}
		</>
	);
};
