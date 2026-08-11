import { ConfiguracionDB } from '@/lib/db';

export async function getConfiguracion() {
	return ConfiguracionDB.findFirst();
}
