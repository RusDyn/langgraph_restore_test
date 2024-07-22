import { Get } from '@tsed/common';
import { Description, Returns, Status, Summary, Tags, Title } from '@tsed/schema';
import { StatusCodes } from 'http-status-codes';

import { AppInfo } from '@/app.config';
import { RestController } from '@/controllers/shared/rest-controller.decorator';

import { HealthStatusApiResponse } from './health-status.api-response';
import { HealthStatus } from '@domain/health';
import { HealthStatusResponse } from './health-status.response';

@RestController('/healthz')
@Tags({ name: 'Health', description: 'Status and health check' })
class HealthController {

  @Get()
  @Title('Health')
  @Summary('Health check')
  @Description('Endpoint to check whether the application is healthy or unhealthy')
  @Returns(StatusCodes.OK, HealthStatusApiResponse)
  @Status(StatusCodes.OK, HealthStatusApiResponse)
  public async checkHealthStatus(): Promise<HealthStatusApiResponse> {
    return Promise.resolve(
      HealthStatusResponse.fromDomainModel(
        HealthStatus.create('ALIVE', '🚀 To infinity and beyond!', AppInfo.APP_VERSION)
      ))
  }
}

export { HealthController };
