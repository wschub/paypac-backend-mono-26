import { prisma } from '../prisma/client';
import { DEFAULT_COUNTRY_ID } from '../config/constants';

export class CityService {
  async getPublicCities(countryId?: number) {
    const targetCountryId = countryId || DEFAULT_COUNTRY_ID;

    // Obtener ciudades únicas de eventos públicos activos
    const events = await prisma.event.findMany({
      where: {
        status: { in: ['APPROVED', 'ACTIVE'] },
        event_type: 'PUBLICO',
        city: { not: '' },
      },
      select: { city: true },
      distinct: ['city'],
    });

    const cityNames = events.map(e => e.city);

    const cities = await prisma.cities.findMany({
      where: {
        country_id: targetCountryId,
        name_city: { in: cityNames },
      },
      select: {
        id: true,
        name_city: true,
        country_id: true,
      },
      orderBy: { name_city: 'asc' },
    });

    return {
      data: cities,
      total: cities.length,
    };
  }
}
