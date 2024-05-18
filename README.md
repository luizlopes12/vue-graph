# Average Access Time Chart

Este projeto é um componente desenvolvido utilizando Vue 3, Vite e TypeScript, que exibe um gráfico de linha representando o tempo médio de acesso aos sites. O gráfico é gerado a partir de dados fornecidos em um arquivo JSON.

## Tecnologias Utilizadas

- **Vue 3**
- **Vite**
- **TypeScript**
- **Chart.js**

## Instalação

Siga os passos abaixo para configurar e executar o projeto localmente:

1. **Clone o repositório:**
    ```bash
    git clone https://github.com/luizlopes12/vue-graph.git
    cd vue-graph
    ```

2. **Instale as dependências:**
    ```bash
    npm install
    ```

3. **Execute a aplicação:**
    ```bash
    npm run dev
    ```

4. **Acesse a aplicação:**
    Abra seu navegador e vá para `http://localhost:5173/`.

## Dados

Os dados utilizados para criar o gráfico são obtidos a partir de um arquivo JSON hospedado em um servidor remoto. O link para os dados é:
[https://vuetestti.s3.us-east-1.amazonaws.com/data.json](https://vuetestti.s3.us-east-1.amazonaws.com/data.json).

## Estrutura do Projeto

- `src/components/AverageAccessTimeChart.vue`: Componente principal do gráfico que utiliza Chart.js para renderizar o gráfico de linha.
- `src/App.vue`: Componente de nível superior que incorpora o componente `AverageAccessTimeChart`.
- `src/types.d.ts`: Definição de tipos TypeScript para o objeto JSON.
- `src/main.ts`: Ponto de entrada principal do componente Vue.

## Como Funciona

1. **Fetch dos Dados:**
    O aplicativo faz uma requisição HTTP para o endpoint do JSON para obter os dados, foi necessário a criação de um proxy para contornar o erro de CORS.

2. **Processamento dos Dados:**
    Os dados são processados para calcular o tempo médio de acesso por dia.

3. **Renderização do Gráfico:**
    O gráfico de linha é renderizado utilizando `Chart.js`, exibindo o tempo médio de acesso ao longo do tempo.
