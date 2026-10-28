import { render, screen } from '@testing-library/react';
import AutoclassResult from '../components/Catalog/AutoclassResult';

describe('AutoclassResult', () => {
  test('shows pending work without inventing a score', () => {
    render(<AutoclassResult value={{ state: 'pending', input_time: '2026-10-26T03:00:00Z' }} />);
    expect(screen.getByText(/Waiting for waveform data/)).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  test('keeps CNN score distinct from the combined APRF label and visual evidence', () => {
    render(<AutoclassResult value={{ state: 'succeeded', result: {
      jenis: 'RF', prob_jenis: 0.93, kelas: 'APRF_1', kelas_10: 'RF_1', arah: 'kiri',
      tanda_awan_panas: 'kemungkinan awan panas', saran: ['Check waveform'],
    } }} />);
    expect(screen.getByText(/Model type: RF/)).toBeInTheDocument();
    expect(screen.getByText(/Model score: 93%/)).toBeInTheDocument();
    expect(screen.getByText(/Combined label: APRF_1/)).toBeInTheDocument();
    expect(screen.getByText(/requires operator verification/i)).toBeInTheDocument();
  });

  test('shows old-input result as stale and null score as unavailable', () => {
    render(<AutoclassResult time={Date.parse('2026-10-26T03:01:00Z')} value={{
      state: 'succeeded', input_time: '2026-10-26T03:00:00Z',
      result: { jenis: 'VTB', prob_jenis: null },
    }} />);
    expect(screen.getByText(/different event time/i)).toBeInTheDocument();
    expect(screen.getByText(/Model score: Not available/)).toBeInTheDocument();
  });

  test('shows original model direction separately from final direction and the UTC processing time', () => {
    const result = { jenis: 'RF', arah: 'kanan', arah_model: 'kiri',
      diproses_utc: '2026-10-26 03:02:35' };
    render(<AutoclassResult value={{ state: 'succeeded', result }} />);
    expect(screen.getByText(/Direction: kanan/)).toBeInTheDocument();
    expect(screen.getByText('Model direction: kiri')).toBeInTheDocument();
    expect(screen.getByText('Processed at (UTC): 2026-10-26 03:02:35')).toBeInTheDocument();
  });

  test('marks missing model direction and processing time as unavailable', () => {
    render(<AutoclassResult value={{ state: 'succeeded', result: { jenis: 'RF', arah: 'kanan' } }} />);
    expect(screen.getByText('Model direction: Not available')).toBeInTheDocument();
    expect(screen.getByText('Processed at (UTC): Not available')).toBeInTheDocument();
  });
});
