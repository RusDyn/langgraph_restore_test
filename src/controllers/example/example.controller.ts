import { PathParams } from '@tsed/common';
import { Get, Returns, Summary, Tags, Title } from '@tsed/schema';
import { StatusCodes } from 'http-status-codes';

import { RestController } from '@/controllers/shared/rest-controller.decorator';

import { ExampleApiResponse } from './example.api-response';
@RestController('/example')
@Tags({ name: 'Examples', description: 'Work with examples' })
export class ExampleController {
  private readonly ItemNotFound = 'Item not found';


  @Get('/:id')
  @Title('Get example')
  @Summary('Get example info')
  @Returns(StatusCodes.OK, ExampleApiResponse)
  public async getCase(@PathParams('id') id: string): Promise<ExampleApiResponse> {
    if (!id)    {
      throw new Error(this.ItemNotFound);
    }
    return ExampleApiResponse.fromEntity({createdAt: new Date(), description: 'Good - ' + id, lastStatus: 'Ok', updatedAt: new Date().setMonth(0), uuid: "1"});
  }
}
