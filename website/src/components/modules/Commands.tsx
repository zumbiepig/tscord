import { Box, Code, Heading, Table, Tbody, Td, Text, Th as ChakraTh, Thead, Tr } from '@chakra-ui/react';
import { variants } from '@components/shared';
import { motion, useAnimation } from 'framer-motion';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const MotionTr = motion(Tr);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<ChakraTh
			textTransform="none"
			fontSize="1.2em"
			letterSpacing="normal"
			fontWeight="600"
			fontFamily="Inter var,Inter,sans-serif"
			color="gray.200"
		>
			{children}
		</ChakraTh>
	);
};

const CommandRow: React.FC<{ command: any; index: number }> = ({ command, index }) => {
	const controls = useAnimation();
	const { ref: viewRef, inView } = useInView({
		threshold: 0.2,
		delay: 1 * index,
		triggerOnce: false,
	});

	useEffect(() => {
		if (inView) {
			controls.start('visible');
		} else {
			controls.start('hidden');
		}
	}, [inView]);

	return (
		<>
			<MotionTr initial="hidden" animate={controls} variants={variants} ref={viewRef}>
				<Td>
					<Code p=".25em .4em" borderRadius="8px" fontSize="1.2em" bg="tertiary">
						/{command.name}
					</Code>
				</Td>
				<Td fontSize="1.2em" fontFamily="Inter var,Inter,sans-serif">
					{command.description}
				</Td>
			</MotionTr>
		</>
	);
};

interface CommandsProps {
	commands: any[];
}

export const Commands: React.FC<CommandsProps> = ({ commands }) => {
	return (
		<>
			<Box maxW="95vw" m="50px auto" bg="primary" borderRadius="8px" boxShadow="var(--chakra-shadows-xl)">
				<Table>
					<Thead>
						<Tr h="4em">
							<Th>Command</Th>
							<Th>Description</Th>
						</Tr>
					</Thead>

					<Tbody>
						{commands.map((command, i) => (
							<CommandRow key={i} index={i} command={command} />
						))}
					</Tbody>
				</Table>
			</Box>
		</>
	);
};
