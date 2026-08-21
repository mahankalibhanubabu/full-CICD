import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { PipelineRun } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  getStatus() {
    return this.appService.getSystemStatus();
  }

  @Get('pipelines')
  getPipelines(): PipelineRun[] {
    return this.appService.getPipelines();
  }

  @Get('pipelines/:id')
  getPipelineById(@Param('id') id: string): PipelineRun | { error: string } {
    const pipe = this.appService.getPipelineById(id);
    return pipe || { error: 'Pipeline run not found' };
  }

  @Get('metrics')
  getMetrics() {
    return this.appService.getMetrics();
  }

  @Post('trigger')
  triggerBuild(
    @Body() body: { branch?: string; commitMsg?: string },
  ): PipelineRun {
    return this.appService.triggerPipeline(body.branch, body.commitMsg);
  }
}
