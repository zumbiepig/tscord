export interface DatabaseSize {
	db: number | null;
	backups: number | null;
}

export interface DataType {
	maintenance: boolean;
	lastMaintenance: number;
	lastStartup: number;
}
