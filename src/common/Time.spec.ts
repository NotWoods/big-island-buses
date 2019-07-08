import { toTime, toDate, toDuration } from './Time';

describe('TimeData', () => {
    test('toTime', () => {
        expect(toTime(new Date(Date.UTC(1970, 0, 1, 13, 30, 27)))).toEqual({
            iso: '13:30:27Z',
            formatted: '5:30 AM',
        });
    });

    test('toDate', () => {
        expect(toDate(new Date(1970, 0, 1))).toEqual({
            iso: '1970-01-01',
            formatted: '1/1/1970',
        });
    });

    test('toDuration', () => {
        expect(toDuration({ minute: 35 })).toEqual({
            iso: 'PT35M',
            formatted: '35 minutes',
        });
    });
});
