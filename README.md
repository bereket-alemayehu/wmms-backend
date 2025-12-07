# Wi-Fi Maintenance Management System (WMMS)

## Overview
The Wi-Fi Maintenance Management System (WMMS) is a backend application designed to manage Wi-Fi maintenance tasks efficiently. It provides functionalities for creating and updating maintenance tickets, tracking device statuses, and facilitating communication between users and maintenance personnel.

## Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)

To install pnpm globally:
```bash
npm install -g pnpm
```

## Project Structure
```
wmms-backend
├── src
│   ├── controllers
│   │   └── maintenance.controller.ts
│   ├── models
│   │   └── device.model.ts
│   ├── routes
│   │   └── maintenance.routes.ts
│   ├── services
│   │   └── wifi.service.ts
│   ├── utils
│   │   └── helpers.ts
│   └── app.ts
├── dist
│   └── (compiled JavaScript files)
├── package.json
├── tsconfig.json
├── server.ts
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd wmms-backend
   ```
3. Install the dependencies:
   ```
   pnpm install
   ```

## Usage

### Development
1. Build the TypeScript project:
   ```
   pnpm run build
   ```
2. Start the development server with hot reload:
   ```
   pnpm run dev
   ```
3. Or watch for TypeScript changes:
   ```
   pnpm run watch
   ```

### Production
1. Build the project:
   ```
   pnpm run build
   ```
2. Start the server:
   ```
   pnpm start
   ```

The application will listen on the specified port (default is 3000). You can access the API endpoints for maintenance operations.

## API Endpoints
- **Create Ticket**: `POST /api/maintenance/tickets`
- **Update Ticket Status**: `PUT /api/maintenance/tickets/:id`
- **Get Ticket Status**: `GET /api/maintenance/tickets/:id`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.