import '@tsed/platform-express';
import '@tsed/swagger';
import '@tsed/ajv';
import './filters';

import { PlatformApplication } from '@tsed/common';
import { importProviders } from '@tsed/components-scan';
import { Inject } from '@tsed/di';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import endent from 'endent';
import express from 'express';
import figlet from 'figlet';
import methodOverride from 'method-override';
import * as emoji from 'node-emoji';

import { Logger } from '@domain/shared';
import { CacheConfig, GlobalConfig } from '@infrastructure/shared/config';

import { AppConfig, AppInfo } from './app.config';
import { ErrorHandlerMiddleware, LoggerMiddleware, NotFoundMiddleware } from './middlewares';

class Server {
  @Inject()
  private app: PlatformApplication;

  public static async getConfiguration(): Promise<Partial<TsED.Configuration>> {
    const baseConfiguration: Partial<TsED.Configuration> = {
      rootDir: __dirname,
      acceptMimes: ['application/json'],
      httpPort: AppConfig.PORT,
      httpsPort: false
    };

    const providersConfiguration: Partial<TsED.Configuration> = await importProviders({
      mount: {
        [AppConfig.BASE_PATH]: [`${__dirname}/controllers/**/*.controller.ts`]
      },
      imports: [
        `${__dirname}/../../infrastructure/**/*.domain-service.ts`,
        `${__dirname}/./**/*.service.ts`
      ]
    });

    const swaggerConfiguration: Partial<TsED.Configuration> = {
      swagger: [
        {
          path: `${AppConfig.BASE_PATH}/docs`,
          specVersion: '3.0.3',
          spec: {
            info: {
              title: AppInfo.APP_NAME,
              description: AppInfo.APP_DESCRIPTION,
              version: AppInfo.APP_VERSION,
              contact: {
                name: AppInfo.AUTHOR_NAME,
                email: AppInfo.AUTHOR_EMAIL,
                url: AppInfo.AUTHOR_WEBSITE
              },
              license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html'
              }
            },
            components: {
            }
          }
        }
      ]
    };

    const ioredisConfiguration: Partial<TsED.Configuration> = {
      ioredis: [
        {
          name: 'default',
          cache: false,
          host: CacheConfig.CACHE_HOST,
          port: CacheConfig.CACHE_PORT,
          password: CacheConfig.CACHE_PASSWORD,
          db: CacheConfig.CACHE_DB,
          username: CacheConfig.CACHE_USER,
          tls: CacheConfig.CACHE_TLS ? {} : undefined
        }
      ]
    };

    const loggerConfiguration: Partial<TsED.Configuration> | any = {
      logger: {
        level: 'off',
        disableRoutesSummary: true,
        logRequest: true
      }
    };

    return {
      ...baseConfiguration,
      ...providersConfiguration,
      ...swaggerConfiguration,
      ...ioredisConfiguration,
      ...loggerConfiguration
    };
  }

  public $beforeRoutesInit(): void | Promise<any> {
    this.app
      .use(cors())
      .use(express.json())
      .use(express.urlencoded({ extended: true }))
      .use(cookieParser())
      .use(compression({}))
      .use(methodOverride())
      .use(LoggerMiddleware);
  }

  public $afterRoutesInit(): void {
    this.app.use(NotFoundMiddleware).use(ErrorHandlerMiddleware);
  }

  public $onReady(): void {
    if (!GlobalConfig.IS_TEST) {
      this.showBanner();
    }
  }

  private showBanner(): void {
    const banner = endent`${emoji.get('zap')} Application started successfully!
      ${figlet.textSync(AppInfo.APP_NAME)}
       Name: ${AppInfo.APP_NAME}
       Description: ${AppInfo.APP_DESCRIPTION}
       Version: ${AppInfo.APP_VERSION}
       Port: ${AppConfig.PORT}
       Base Path: ${AppConfig.BASE_PATH}
       OpenApi Spec Path: ${AppConfig.BASE_PATH}/docs
       Environment: ${GlobalConfig.ENVIRONMENT}
       Author: ${AppInfo.AUTHOR_NAME}
       Email: ${AppInfo.AUTHOR_EMAIL}
       Website: ${AppInfo.AUTHOR_WEBSITE}
       Copyright © ${new Date().getFullYear()} ${AppInfo.AUTHOR_EMAIL}. All rights reserved.
    `;
    Logger.info(banner);
  }
}

export { Server };
