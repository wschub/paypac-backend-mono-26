import { prisma } from '../prisma/client';
import { DEFAULT_COUNTRY_ID } from '../config/constants';

export class CityService {
  async getPublicCities(countryId?: number) {
    const targetCountryId = countryId || DEFAULT_COUNTRY_ID;

    // Ciudades activas del país habilitado (con al menos un evento)
    const cities = await prisma.cities.findMany({
      where: {
        country_id: targetCountryId,
        filters_active: 1,
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
