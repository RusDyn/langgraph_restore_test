import { Default, Property } from '@tsed/schema';

import { AppInfo } from '@/app.config';
import { HealthStatusResponse } from './health-status.response';

class HealthStatusApiResponse {
  @Property()
  readonly status: string;

  @Property()
  readonly message: string;

  @Property()
  @Default(AppInfo.APP_VERSION)
  readonly appVersion: string = AppInfo.APP_VERSION;

  constructor(status: string, message: string) {
    this.status = status;
    this.message = message;
  }

  public static fromHealthStatusResponse(healthStatus: HealthStatusResponse): HealthStatusResponse {
    return new HealthStatusApiResponse(healthStatus.status, healthStatus.message);
  }
}

export { HealthStatusApiResponse };
