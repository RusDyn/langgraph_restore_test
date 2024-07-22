import 'reflect-metadata';
import 'source-map-support/register';

import { PlatformExpress } from '@tsed/platform-express';


import { Logger } from '@domain/shared';
import { bootstrap } from '@infrastructure/shared';
import { Server } from '@/server';

const start = async (): Promise<void> => {
  await bootstrap();

  const platform = await PlatformExpress.bootstrap(Server, { ...(await Server.getConfiguration()) });
  await platform.listen();

  process
    .on('SIGINT', () => {
      platform.stop();
      Logger.info(`Gracefully shut down!`);
    })
    .on('unhandledRejection', (error: any) => {
      Logger.error(`unhandledRejection captured: ${error}`);
    })
    .on('uncaughtException', (error: any) => {
      Logger.error(`uncaughtException captured: ${error}`);
    });
};
start();
