import { render, screen } from '@testing-library/react';
import AutoclassPreview from '../components/Catalog/AutoclassPreview';

describe('AutoclassPreview', () => {
  test('shows that the recommendation is not saved and names the suggested type', () => {
    render(<AutoclassPreview preview={{ state: 'ok', result: {
      type_code: 'ROCKFALL', prob_jenis: 0.84, arah: 'kiri', prob_arah: 0.7,
      top3: [{ type_code: 'ROCKFALL', p: 0.84 }, { type_code: 'VTB', p: 0.1 }],
    } }} />);
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
    expect(screen.getByText('Suggested type: ROCKFALL')).toBeInTheDocument();
    expect(screen.getByText(/Model score: 84%/)).toBeInTheDocument();
    expect(screen.getByText(/Direction: kiri/)).toBeInTheDocument();
    expect(screen.getByText('Candidates: ROCKFALL 84%, VTB 10%')).toBeInTheDocument();
  });

  test('omits direction for types that have none', () => {
    render(<AutoclassPreview preview={{ state: 'ok', result: {
      type_code: 'VTB', prob_jenis: 0.9, arah: null, prob_arah: null, top3: [],
    } }} />);
    expect(screen.queryByText(/Direction/)).not.toBeInTheDocument();
  });

  test('shows pending work without a score', () => {
    render(<AutoclassPreview preview={{ state: 'pending' }} />);
    expect(screen.getByText(/Calculating recommendation/)).toBeInTheDocument();
    expect(screen.queryByText(/Model score/)).not.toBeInTheDocument();
  });

  test('explains missing waveform data instead of showing a guess', () => {
    render(<AutoclassPreview preview={{ state: 'data_unavailable' }} />);
    expect(screen.getByText(/No waveform data for this time/)).toBeInTheDocument();
  });
});
