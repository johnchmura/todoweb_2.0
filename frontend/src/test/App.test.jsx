import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App'

// Mock the API module
vi.mock('../services/api', () => ({
  authAPI: {
    getMe: vi.fn(),
  },
  tasksAPI: {
    getTasks: vi.fn(),
  },
  calendarAPI: {
    getNotes: vi.fn(),
  },
}))

// Mock canvas for testing
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setTransform: vi.fn(),
    getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  })),
})

// Mock canvas dimensions
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 800,
  writable: true,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 600,
  writable: true,
})

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('TodoWeb')).toBeInTheDocument()
  })
})
