import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { DriverService } from './driver.service';

@Module({
  controllers: [TestController],
  providers: [TestService, DriverService],
})
export class TestModule {}
