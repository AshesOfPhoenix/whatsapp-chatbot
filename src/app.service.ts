import { Injectable } from '@nestjs/common';
import { rootGreeting } from './utils/constants';

@Injectable()
export class AppService {
  getHello(): string {
    return rootGreeting;
  }
}
