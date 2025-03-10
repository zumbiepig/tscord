import React from 'react';
import { AiFillPieChart } from 'react-icons/ai';
import { BiStats } from 'react-icons/bi';
import { SiClubhouse } from 'react-icons/si';
import { TbDatabase } from 'react-icons/tb';

interface SidebarConfigType {
	tabs: {
		name: string;
		href: string;
		icon: React.ReactNode;
	}[];
}

export const sidebarConfig: SidebarConfigType = {
	tabs: [
		{
			name: 'Monitoring',
			href: 'monitoring',
			icon: <AiFillPieChart />,
		},
		{
			name: 'Statistics',
			href: 'statistics',
			icon: <BiStats />,
		},
		// {
		//     name: 'Users',
		//     href: 'users',
		//     icon: <FaUserFriends />,
		// },
		{
			name: 'Guilds',
			href: 'guilds',
			icon: <SiClubhouse />,
		},
		{
			name: 'Database',
			href: 'database',
			icon: <TbDatabase />,
		},
	],
};
