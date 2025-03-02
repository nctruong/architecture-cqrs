
``` 
npm run dev:write
npm run dev:read
curl -X POST http://localhost:4000/orders -H "Content-Type: application/json" -d '{"product": "Laptop", "quantity": 2}'
curl -X GET http://localhost:5001/orders/\{67c42e774cb767c6b6fa6c4e\}
```
