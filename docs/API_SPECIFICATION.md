# 🔌 Flora Genius AI Consultant — API Specification

The **Flora Genius AI Consultant** is a secure, decoupled microservice that provides automated botanical identification and expert RAG-powered consulting. This service handles high-throughput image recognition and advanced LLM prompts with localized Redis caching and robust rate limiting.

---

## 🏗️ Architecture Overview

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant API as Consultant Microservice
    participant Redis as Redis Cache
    participant PN as PlantNet API
    participant DB as Supabase DB (pgvector)
    participant Gemini as Google Gemini 1.5 Flash

    User->>API: POST /api/consultant/expert (query, image, scientificName)
    activate API
    API->>Redis: Check cache for query + image hash
    alt Cache Hit
        Redis-->>API: Return cached advice
        API-->>User: Response (source: 'cache')
    else Cache Miss
        alt Image Uploaded & No Scientific Name
            API->>Redis: Check plant identification cache
            alt Identification Cache Hit
                Redis-->>API: Return cached species
            else Identification Cache Miss
                API->>PN: POST /v2/identify (multipart image)
                PN-->>API: Return identified plant species
                API->>Redis: Cache plant identification (7 days)
            end
        end
        
        rect rgb(30, 45, 30)
            note over API, DB: Retrieval-Augmented Generation (RAG)
            API->>Gemini: expandQuery(query)
            Gemini-->>API: Return expanded queries
            API->>DB: RPC: hybrid_plant_search(queries, embeddings)
            DB-->>API: Return top K unique context chunks
            API->>Redis: Cache context (24 hours)
        end
        
        API->>Gemini: askExpert(context, query, history, image)
        Gemini-->>API: Return botanical markdown advice
        API->>Redis: Cache advice (12 hours)
        API-->>User: Response (source: 'api')
    end
    deactivate API
```

---

## 🔑 Authentication & Headers

Every request to the consultant microservice must be authenticated using the following headers:

| Header Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `x-api-key` | String | Shared microservice access token (`process.env.MICROSERVICE_API_KEY`) | **Yes** |
| `Authorization` | String | Bearer JWT token issued by Supabase Auth (`Bearer <token>`) | **Yes** |

---

## 🚦 Global Rate Limiting

To prevent API abuse and reduce token costs, the service enforces a rate limiter via Redis:
* **Limit**: **10 requests per 15 minutes** per authenticated user ID (falls back to IP address if unauthenticated).
* **Header**: Standard `RateLimit` headers are returned in every response.

---

## 📡 Endpoints Specification

### 1. Identify Plant (`POST /api/consultant/identify`)

Allows identifying a plant species directly from a photograph.

#### Request Headers
```http
x-api-key: your-microservice-api-key
Authorization: Bearer your-supabase-jwt-token
Content-Type: multipart/form-data
```

#### Multipart Body Params
* `image` *(File, Required)*: A JPEG, PNG, or WEBP image file of the plant (Max **5MB**).

#### Sample curl Request
```bash
curl -X POST http://localhost:5002/api/consultant/identify \
  -H "x-api-key: my_secure_microservice_key" \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -F "image=@/path/to/leaf.jpg"
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "scientific_name": "Azadirachta indica",
    "common_name": "Neem",
    "confidence": 0.9412
  },
  "source": "api"
}
```

---

### 2. Expert Consultation (`POST /api/consultant/expert`)

Query the RAG-powered botanical expert with optional multi-modal image support.

#### Request Headers
```http
x-api-key: your-microservice-api-key
Authorization: Bearer your-supabase-jwt-token
Content-Type: multipart/form-data
```

#### Multipart Body Params
* `query` *(String, Required)*: The botanical question or prompt (1 - 1000 characters).
* `scientificName` *(String, Optional)*: The plant context (Max 100 characters). If set to `"General Plants"` or omitted, the model answers generally or performs auto-identification if an image is provided.
* `history` *(String, Optional)*: A JSON string containing conversational history (for contextual memory tracking).
* `image` *(File, Optional)*: A JPEG, PNG, or WEBP image file for visual diagnostic context (Max **5MB**).

#### Sample curl Request
```bash
curl -X POST http://localhost:5002/api/consultant/expert \
  -H "x-api-key: my_secure_microservice_key" \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -F "query=Why are the leaves turning yellow?" \
  -F "scientificName=Azadirachta indica" \
  -F "image=@/path/to/yellow_leaf.jpg" \
  -F 'history=[{"role":"user","parts":"I adopted a Neem tree"},{"role":"model","parts":"Congratulations!"}]'
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "answer": "### Visual Diagnosis\nBased on the uploaded image of your Neem tree (*Azadirachta indica*), the yellowing leaves with dark spots are likely caused by:\n1. **Overwatering**: Neem trees are highly drought-tolerant. Ensure the soil is completely dry before watering.\n2. **Leaf Spot Fungus (*Pseudocercospora subsessilis*)**: Remove affected leaves and spray with organic neem oil.",
  "identifiedPlant": {
    "scientificName": "Azadirachta indica",
    "commonName": "Neem",
    "confidence": 0.9412
  },
  "source": "api"
}
```

---

## 🛠️ Errors Reference

The API returns standard HTTP status codes combined with consistent error structures:

| Status Code | Error Message / Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `Image is required` | Multipart form did not contain an image field for `/identify`. |
| `400 Bad Request` | `Invalid query length/type (max 1000 chars)` | Query is missing, too long, or not a string. |
| `401 Unauthorized` | `Missing or invalid API key` | `x-api-key` header did not match the configured secret. |
| `429 Too Many Requests`| `{ "code": "RATE_LIMITED", "message": "..." }` | User has exceeded the rate limit threshold. |
| `500 Internal Error` | `Gemini API rate limit exceeded` | An downstream dependency error occurred. |

---
> [!NOTE]
> For integration details or schema mappings, refer to [DATABASE_AND_RAG.md](DATABASE_AND_RAG.md). The full OpenAPI specification can be found in [openapi.yaml](openapi.yaml).
