# Teste

## Visão Geral

Uma aplicação de processamento de imagens desenvolvida em Node.js. Seu objetivo é fornecer uma API para manipulação de imagens com diferentes parâmetros, como redimensionamento, formato, qualidade e conversão para tons de cinza. As imagens originais são armazenadas no bucket S3 da AWS e, após o processamento, são distribuídas globalmente com baixa latência usando Amazon CloudFront.

## Funcionalidades

- Redimensionamento de imagens (altura e largura ajustáveis).
- Conversão de formatos de imagem (JPG, JPEG, PNG, WEBP).
- Ajuste da qualidade da imagem de 1 a 100.
- Conversão para tons de cinza.
- Armazenamento e cache de imagens processadas no S3.
- Distribuição de imagens por meio de CDN (Amazon CloudFront) para entrega rápida e eficiente.

## Tecnologias Utilizadas

- **Node.js**: Plataforma de execução para JavaScript no lado do servidor.
- **Express**: Framework para criação de rotas HTTP.
- **Sharp**: Biblioteca para manipulação e processamento de imagens.
- **AWS S3**: Armazenamento de objetos para armazenar as imagens originais e processadas.
- **AWS CloudFront**: CDN para distribuir as imagens e melhorar a latência.
- **Docker**: Ferramenta para containerizar a aplicação, facilitando o deploy.

## Estrutura do Projeto

```
Teste/
  |-- src/
      |-- config/
          |-- s3Client.mjs      # Configuração do cliente AWS S3
      |-- controllers/
          |-- imageController.mjs   # Controladores para gerenciar as requisições de imagem
      |-- routes/
          |-- routes.mjs         # Definições de rotas da aplicação
      |-- services/
          |-- imageService.mjs      # Lógica de negócio para processamento de imagem
          |-- s3Service.mjs         # Funções de interação com o S3
      |-- utils/
          |-- generateCacheKey.mjs  # Geração de chave de cache para as imagens
          |-- getBestFormat.mjs     # Seleciona o melhor formato de imagem
      |-- index.mjs                 # Configuração das rotas com express
  |-- Dockerfile                    # Dockerfile para containerização da aplicação
  |-- docker-compose.yml            # Configuração que facilita o gerenciamento de container
  |-- .env                       # Variáveis de ambiente
  |-- package.json               # Dependências do projeto
```

## Configuração do Ambiente

### 1. Pré-requisitos

- **Node.js**
- **AWS CLI** configurado com credenciais válidas
- **Docker** instalado
- Conta AWS com permissões para utilizar S3 e CloudFront

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```
AWS_BUCKET_NAME=seu-bucket-name
AWS_BUCKET_REGION=regiao-do-bucket
AWS_ACCESS_KEY=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-access-key
PORT=4000
```

### 3. Executando com Docker

Para rodar a aplicação em um contêiner Docker, utilize o comando:

```bash
docker-compose up --build
```

A aplicação estará ativa em: `http://localhost:4000`

### 4. Configurando o CloudFront

- No Console da AWS, vá até o **CloudFront** e crie uma nova distribuição.
- Configure o bucket S3 como a origem e siga as orientações mencionadas para definir as políticas de cache e segurança.
- Após a distribuição estar pronta, você receberá um **Domain Name**. Substitua este domínio na lógica do código para gerar URLs CDN no lugar dos URLs diretos do S3.

## Como Utilizar a API

A API fornece endpoints para fazer upload e obter imagens processadas.

### 1. Fazer Upload de uma Imagem

**Endpoint**: `/upload`

- **Método**: POST
- **Body**: Form-data contendo a chave `image` com o arquivo da imagem.

**Exemplo de Requisição**:

```bash
curl -X POST -F "image=@/caminho/para/imagem.jpg" http://localhost:4000/upload
```

### 2. Lista de Imagens no Bucket

**Endpoint**: `/pictures`

- **Método**: GET
- **Retorno**: Retorna uma lista com todas as imagens que estão salvas no Bucket S3

**Exemplo de Requisição**:

```bash
curl "http://localhost:4000/pictures"
```

### 3. Obter Imagem Processada

**Endpoint**: `/pictures/:imageName`

- **Método**: GET
- **Parâmetros de Query**:
  - `w`: Largura da imagem.
  - `h`: Altura da imagem.
  - `q`: Qualidade da imagem (1-100).
  - `fm`: Formato da imagem (`jpg`, `jpeg`, `png`, `webp`).
  - `gray`: Aplicar tons de cinza (`1` para ativar).

**Exemplo de Requisição**:

```bash
curl "http://localhost:4000/pictures/darthvader.jpg?w=200&h=200&q=75&fm=webp&gray=1"
```

## Funcionamento Interno

1. **Upload da Imagem**: A imagem original é enviada ao bucket S3.
2. **Processamento da Imagem**: Quando solicitada, a imagem é recuperada, processada conforme os parâmetros de query, e armazenada novamente no S3.
3. **Entrega Via CDN**: Após ser processada e armazenada, a imagem é distribuída pelo CloudFront, garantindo baixa latência.

## Lógica Utilizada no Desenvolvimento

Para construir essa aplicação, foram considerados alguns pontos importantes para otimizar o desempenho e garantir uma arquitetura escalável e eficiente:

1. **Separação de Responsabilidades**: Cada componente da aplicação foi separado em diferentes camadas, como controladores, serviços, utilitários e configurações. Isso facilita a manutenção do código e torna a lógica mais clara e organizada.

2. **Uso de Cache e CDN**: As imagens processadas são armazenadas no bucket S3 e distribuídas usando CloudFront para garantir entrega rápida e com baixa latência. A política de cache foi configurada para armazenar imagens por um longo período, evitando processamento repetido e melhorando a eficiência.

3. **Processamento Otimizado de Imagens**: A biblioteca `sharp` foi utilizada para realizar operações como redimensionamento, ajuste de qualidade e conversão de formato. O formato da imagem é escolhido de forma dinâmica, verificando o cabeçalho `Accept` da requisição para determinar o melhor formato suportado pelo cliente.

4. **Utilização de Variáveis de Ambiente**: As credenciais sensíveis, como chaves de acesso à AWS, são armazenadas em variáveis de ambiente para garantir segurança e flexibilidade na configuração do ambiente.

5. **Docker para Portabilidade**: A aplicação foi containerizada usando Docker, permitindo que seja facilmente distribuída e executada em diferentes ambientes, mantendo consistência.

6. **Fallback para Formatos de Imagem**: Caso o usuário solicite um formato de imagem que não seja suportado (`jpg`, `jpeg`, `png`, `webp`), a aplicação automaticamente seleciona um formato apropriado usando a lógica definida em `getBestFormat.mjs`. Isso garante que a aplicação sempre retorne uma imagem em um formato adequado.

## Considerações Finais

- **Cache**: O CloudFront armazena as imagens processadas, minimizando o tempo de resposta para requisições subsequentes.
- **Escalabilidade**: A utilização de CloudFront como CDN e S3 para armazenamento garante que a aplicação seja escalável e responda rapidamente a uma grande quantidade de requisições.
- \*\*
