import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the API module
jest.mock('../services/api', () => ({
  authAPI: {
    getMe: jest.fn(),
  },
  tasksAPI: {
    getTasks: jest.fn(),
  },
  calendarAPI: {
    getNotes: jest.fn(),
  },
}))

const MockedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

describe('App', () => {
  test('renders without crashing', () => {
    render(<MockedApp />)
    expect(screen.getByText('TodoWeb')).toBeInTheDocument()
  })
})
