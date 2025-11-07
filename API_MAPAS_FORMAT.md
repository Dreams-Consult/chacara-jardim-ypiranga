# Formato Esperado da API /mapas

## Endpoint
`GET /mapas`

## Descrição
Este endpoint deve retornar todos os mapas cadastrados **junto com seus lotes**.

## Formato de Resposta Esperado

```json
[
  {
    "mapId": "1762455471299",
    "name": "Loteamento Chácara Jardim Ypiranga - Fase 1",
    "description": "Primeira fase do loteamento",
    "imageUrl": "data:image/png;base64,...",
    "imageType": "image/png",
    "width": 800,
    "height": 600,
    "createdAt": "2024-11-07T10:30:00Z",
    "updatedAt": "2024-11-07T10:30:00Z",
    "lots": [
      {
        "id": "lot123",
        "lotNumber": "Lote 01",
        "area": {
          "points": [
            { "x": 100, "y": 100 },
            { "x": 200, "y": 100 },
            { "x": 200, "y": 200 },
            { "x": 100, "y": 200 }
          ]
        },
        "status": "available",
        "price": 50000,
        "size": 250,
        "description": "Lote residencial 01",
        "features": ["Água", "Luz", "Esgoto"],
        "createdAt": "2024-11-07T10:30:00Z",
        "updatedAt": "2024-11-07T10:30:00Z"
      },
      {
        "id": "lot124",
        "lotNumber": "Lote 02",
        "area": {
          "points": [
            { "x": 200, "y": 100 },
            { "x": 300, "y": 100 },
            { "x": 300, "y": 200 },
            { "x": 200, "y": 200 }
          ]
        },
        "status": "reserved",
        "price": 55000,
        "size": 300,
        "description": "Lote residencial 02",
        "features": ["Água", "Luz", "Esgoto"],
        "createdAt": "2024-11-07T10:30:00Z",
        "updatedAt": "2024-11-07T10:30:00Z"
      }
    ]
  },
  {
    "mapId": "1762455680661",
    "name": "Loteamento Chácara Jardim Ypiranga - Fase 2",
    "description": "Segunda fase do loteamento",
    "imageUrl": "data:image/png;base64,...",
    "imageType": "image/png",
    "width": 800,
    "height": 600,
    "createdAt": "2024-11-07T11:00:00Z",
    "updatedAt": "2024-11-07T11:00:00Z",
    "lots": [
      {
        "id": "lot201",
        "lotNumber": "Lote 01",
        "area": {
          "points": [
            { "x": 50, "y": 50 },
            { "x": 150, "y": 50 },
            { "x": 150, "y": 150 },
            { "x": 50, "y": 150 }
          ]
        },
        "status": "available",
        "price": 60000,
        "size": 280,
        "description": "Lote comercial 01",
        "features": ["Água", "Luz", "Esgoto", "Asfalto"],
        "createdAt": "2024-11-07T11:00:00Z",
        "updatedAt": "2024-11-07T11:00:00Z"
      }
    ]
  }
]
```

## Campos Obrigatórios

### Mapa
- `mapId` (string): ID único do mapa
- `name` (string): Nome do mapa
- `imageUrl` (string): URL ou data URI da imagem do mapa
- `lots` (array): **Array de lotes do mapa** (pode ser vazio `[]`)

### Lote
- `id` (string): ID único do lote
- `lotNumber` (string): Número/identificador do lote
- `area` (object): Área do lote com array de pontos
  - `points` (array): Array de coordenadas `{x, y}`
- `status` (string): Status do lote (`"available"`, `"reserved"`, `"sold"`)
- `price` (number): Preço do lote
- `size` (number): Tamanho do lote em m²
- `createdAt` (string/Date): Data de criação
- `updatedAt` (string/Date): Data de atualização

## Campos Opcionais
- `description` (string): Descrição do mapa/lote
- `features` (array): Características do lote
- `imageType` (string): Tipo da imagem (padrão: "image/png")
- `width` (number): Largura da imagem (padrão: 800)
- `height` (number): Altura da imagem (padrão: 600)

## Comportamento Esperado

1. **Primeira carga**: A página pública carrega todos os mapas com seus lotes de uma vez
2. **Troca de mapa**: Quando o usuário seleciona outro mapa no dropdown, os lotes são trocados instantaneamente usando os dados já carregados (sem nova chamada à API)
3. **Após reserva**: Após uma reserva bem-sucedida, a página recarrega os dados da API para atualizar os status

## Exemplo de Implementação no Backend (n8n)

No workflow do n8n, você deve:

1. Buscar todos os mapas da base de dados
2. Para cada mapa, buscar seus lotes associados
3. Montar a resposta combinando mapas com seus respectivos lotes
4. Retornar o array JSON conforme o formato acima

## Vantagens desta Abordagem

✅ **Performance**: Uma única chamada à API carrega tudo
✅ **UX**: Troca instantânea entre mapas (sem loading)
✅ **Simplicidade**: Código frontend mais limpo e fácil de manter
✅ **Consistência**: Dados sempre sincronizados
