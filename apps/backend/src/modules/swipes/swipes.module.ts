import { Module } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}

