import { http, HttpResponse } from 'msw'

export const handlers = [
  // Products
  http.get('/api/v1/products/', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Description 1',
        price: 100,
        stock_count: 10,
        img_url: 'test1.jpg',
      },
      {
        id: 2,
        name: 'Test Product 2',
        description: 'Description 2',
        price: 200,
        stock_count: 0, // out of stock
        img_url: 'test2.jpg',
      }
    ])
  }),

  http.get('/api/v1/products/:id', ({ params }) => {
    return HttpResponse.json({
        id: Number(params.id),
        name: 'Test Product',
        description: 'Detailed Description',
        price: 99.99,
        stock_count: 5,
        img_url: 'test.jpg'
    })
  }),

  // Reviews
  http.get('/api/v1/reviews/product/:id', () => {
      return HttpResponse.json([
          {
              id: 1,
              comment: 'Great product',
              rating: 5,
              user: { email: 'user@test.com' },
              created_at: new Date().toISOString()
          }
      ])
  }),

  // Auth
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json({
      id: 1,
      email: 'user@example.com',
      is_active: true,
      is_superuser: false,
    })
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      email: 'user@example.com',
      is_active: true,
      is_superuser: false,
    })
  }),

  // Cart
  http.post('/api/v1/coupons/validate', () => {
      return HttpResponse.json({ discount_percent: 10, max_discount_amount: null })
  })
]
