import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    const port = process.env.PORT || 3000
    // Enable all hosts
    await app.listen(port, '0.0.0.0')
}
bootstrap()
