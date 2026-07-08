import { prisma } from '../prisma/client';
import { DEFAULT_COUNTRY_ID } from '../config/constants';

export class CityService {
  async getPublicCities(countryId?: number) {
    const targetCountryId = countryId || DEFAULT_COUNTRY_ID;

    // Todas las ciudades del país habilitado
    const cities = await prisma.cities.findMany({
      where: {
        country_id: targetCountryId,
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
