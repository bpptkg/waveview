import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../../views/login/Login';

describe('Login', () => {
  test('renders Login component', () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    expect(screen.getByText('Login to continue')).toBeInTheDocument();
  });
});
