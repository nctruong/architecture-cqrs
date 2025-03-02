Write to mongo
Read from postgres
``` 
npm run dev:command
npm run dev:event
npm run dev:read
curl -X POST http://localhost:4000/orders -H "Content-Type: application/json" -d '{"id": "1", "product": "Laptop", "quantity": 2}'
curl -X GET http://localhost:5001/orders/1
```
