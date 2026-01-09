"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 3001);
    const apiPrefix = configService.get('app.apiPrefix', 'api/v1');
    const frontendUrl = configService.get('app.frontendUrl', 'http://localhost:3000');
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (configService.get('app.nodeEnv') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Whaticket Enterprise API')
            .setDescription('API documentation for Whaticket Enterprise')
            .setVersion('2.0.0')
            .addBearerAuth()
            .addTag('WhatsApp', 'WhatsApp connection management')
            .addTag('Tickets', 'Ticket management')
            .addTag('Messages', 'Message handling')
            .addTag('Contacts', 'Contact management')
            .addTag('Users', 'User management')
            .addTag('Auth', 'Authentication')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        logger.log(`Swagger documentation available at /docs`);
    }
    app.enableShutdownHooks();
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📧 WhatsApp service using Baileys`);
}
bootstrap();
//# sourceMappingURL=main.js.map