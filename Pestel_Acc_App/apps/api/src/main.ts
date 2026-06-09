import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function isAllowedOrigin(origin?: string) {
    if (!origin) return true;

    const configured = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    if (configured.includes(origin)) return true;

    // Allow local network dev origins like http://192.168.1.5:3000
    return /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/i.test(origin);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // CORS — only allow the frontend origin
    app.enableCors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('CORS not allowed for this origin'));
        },
        credentials: true,
    });

    // Global validation pipe — strips unknown properties, validates all DTOs
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,        // strip properties not in DTO
            forbidNonWhitelisted: true,
            transform: true,        // auto-transform to DTO types
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Swagger API docs (development only)
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Fannie Logistics API')
            .setDescription('REST API for the Fannie Logistics finance and operations system')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    const port = process.env.PORT ?? 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`API running on http://localhost:${port}/api/v1`);
    console.log('API is also reachable on your local network IP at the same port.');
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
