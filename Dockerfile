# Node.js 24 Alpine — как в https://docker.com/get-started/
FROM node:24-alpine

WORKDIR /app

# Копируем только файлы зависимостей
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Vite dev-сервер слушает на 0.0.0.0, чтобы был доступ с хоста
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
