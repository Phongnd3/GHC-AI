import { getActiveVisits } from '../patients';
import { apiClient } from '../client';
import type { Visit } from '@/types/visit';

jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockVisit: Visit = {
  uuid: 'visit-uuid-1',
  display: 'Test Visit',
  patient: {
    uuid: 'patient-uuid-1',
    identifiers: [
      {
        uuid: 'id-uuid-1',
        identifier: 'MRN-001',
        identifierType: { uuid: 'type-uuid', display: 'OpenMRS ID' },
        preferred: true,
      },
    ],
    person: {
      uuid: 'person-uuid-1',
      names: [
        {
          uuid: 'name-uuid-1',
          preferred: true,
          givenName: 'John',
          familyName: 'Doe',
        },
      ],
      gender: 'M',
      birthdate: '1980-01-01',
      birthdateEstimated: false,
      dead: false,
      attributes: [],
      addresses: [],
    },
    voided: false,
  },
  visitType: { uuid: 'vt-uuid', display: 'Outpatient' },
  location: { uuid: 'loc-uuid', display: 'Ward A' },
  startDatetime: '2024-01-01T08:00:00',
  stopDatetime: null,
  encounters: [],
  attributes: [],
  voided: false,
};

describe('patients service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveVisits', () => {
    it('should GET the correct endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { results: [mockVisit] },
      });

      await getActiveVisits();

      expect(apiClient.get).toHaveBeenCalledWith('/visit?includeInactive=false&v=full');
    });

    it('should return the results array from the response', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { results: [mockVisit] },
      });

      const result = await getActiveVisits();

      expect(result).toHaveLength(1);
      expect(result[0].uuid).toBe('visit-uuid-1');
      expect(result[0].stopDatetime).toBeNull();
    });

    it('should return empty array when no active visits', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { results: [] },
      });

      const result = await getActiveVisits();

      expect(result).toHaveLength(0);
    });

    it('should propagate errors from apiClient', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(getActiveVisits()).rejects.toThrow('Network Error');
    });
  });
});
